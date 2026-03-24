"""
Slide2Video バックエンド - エントリーポイント

PDFをアップロードすると、AI台本生成→音声合成→動画生成を一気通貫で実行し、
MP4動画をダウンロードできるAPIサーバー。
"""
import os
import json
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Header, Form, Query, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional

from config import (
    APP_VERSION, TEMP_DIR, FRONTEND_URL, EXTRA_CORS_ORIGINS, MAX_PDF_SIZE_BYTES,
    JOB_CLEANUP_INTERVAL_SECONDS, DEFAULT_VOICE, DEFAULT_TTS_PROVIDER,
    DEFAULT_SLIDE_DURATION, DEFAULT_ASPECT_RATIO, ASPECT_RATIO_RESOLUTIONS,
    RUNPOD_ENDPOINT_URL,
)
from services.job_manager import job_manager, Job
from services.pdf_service import parse_pdf
from services.ai_service import generate_scripts
from services.tts_service import generate_audio
from services.video_service import generate_video
from services.voice_clone import create_voice as create_clone_voice


# ─── 定期クリーンアップタスク ─────────────────────────
async def cleanup_loop():
    """期限切れジョブを定期的に削除する"""
    while True:
        await asyncio.sleep(JOB_CLEANUP_INTERVAL_SECONDS)
        job_manager.cleanup_expired()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    task = asyncio.create_task(cleanup_loop())
    yield
    task.cancel()


# ─── アプリケーション初期化 ───────────────────────────
app = FastAPI(title="Slide2Video API", version=APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"] + EXTRA_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── メインの動画生成処理 ─────────────────────────────
async def run_generation(
    job: Job,
    pdf_path: str,
    ai_provider: str,
    api_key: str,
    ai_model: Optional[str],
    tts_provider: str,
    voice: str,
    slide_duration: int,
    aspect_ratio: str,
    output_language: str = "ja",
    dashscope_api_key: Optional[str] = None,
    voice_sample_path: Optional[str] = None,
):
    """バックグラウンドで動画生成パイプラインを実行する"""
    try:
        # 1. PDF解析
        await job.update("pdf_parse", 5, "PDF解析中...")
        pages = parse_pdf(pdf_path, job.work_dir)
        await job.update("pdf_parse", 10, f"PDF解析完了 ({len(pages)}ページ検出)")

        # 2. AI台本生成
        async def script_progress(pct, msg):
            await job.update("script_gen", pct, msg)

        pages = await generate_scripts(
            pages, ai_provider, api_key, script_progress,
            ai_model=ai_model, target_duration=slide_duration,
            output_language=output_language,
        )
        await job.update("script_gen", 50, "全スライドの台本生成完了")

        # 3. 言語コードから言語名へのマッピング（RunPod TTS用）
        language_names = {
            "ja": "Japanese", "en": "English", "zh-CN": "Chinese",
            "ko": "Korean", "fr": "French", "es": "Spanish",
            "de": "German", "pt": "Portuguese", "auto": "Auto",
        }
        tts_language = language_names.get(output_language, "Japanese")

        # 4. ボイスクローン（qwen-clone 選択時のみ）
        clone_voice_id = None
        if tts_provider == "qwen-clone":
            if not dashscope_api_key:
                raise Exception("ボイスクローンには DashScope API キーが必要です")
            if not voice_sample_path or not os.path.exists(voice_sample_path):
                raise Exception("ボイスクローンには音声サンプルファイルが必要です")

            await job.update("voice_clone", 52, "ボイスクローン作成中（音声サンプルを解析しています）...")
            clone_voice_id = await create_clone_voice(
                audio_path=voice_sample_path,
                api_key=dashscope_api_key,
            )
            await job.update("voice_clone", 55, f"ボイスクローン作成完了（ID: {clone_voice_id[:16]}...）")

        # 4. 音声合成
        total = len(pages)
        for i, page in enumerate(pages):
            pct = 55 + int((i / total) * 25) if tts_provider == "qwen-clone" else 50 + int((i / total) * 30)
            await job.update("tts", pct, f"スライド {page['page_number']}/{total} の音声生成中...")

            audio_ext = "wav" if tts_provider == "pro-voice" else "mp3"
            audio_path = os.path.join(job.work_dir, f"audio_{page['page_number']}.{audio_ext}")

            # 有料 TTS の場合は X-DashScope-Key ヘッダーで渡された API キーを使用
            openai_key = None
            if tts_provider == "openai" and dashscope_api_key:
                openai_key = dashscope_api_key
            elif tts_provider == "openai" and ai_provider == "openai":
                openai_key = api_key  # AI プロバイダーが OpenAI なら同じキーを流用
            if tts_provider == "elevenlabs" and dashscope_api_key:
                openai_key = dashscope_api_key  # ElevenLabs API キーは X-DashScope-Key ヘッダーで受け渡し
            if tts_provider == "azure" and dashscope_api_key:
                openai_key = dashscope_api_key  # Azure Speech キーは X-DashScope-Key ヘッダーで受け渡し
            if tts_provider == "google-cloud" and dashscope_api_key:
                openai_key = dashscope_api_key  # Google Cloud キーは X-DashScope-Key ヘッダーで受け渡し

            await generate_audio(
                text=page["script"],
                output_path=audio_path,
                tts_provider=tts_provider,
                voice=voice,
                openai_api_key=openai_key,
                dashscope_api_key=dashscope_api_key,
                clone_voice_id=clone_voice_id,
                pro_voice_id=voice if tts_provider == "pro-voice" else None,
                language=tts_language,
            )
            page["audio_path"] = audio_path

        await job.update("tts", 80, "音声生成完了")

        # 5. 動画生成
        resolution = ASPECT_RATIO_RESOLUTIONS.get(aspect_ratio, (1920, 1080))
        total_pages = len(pages)
        await job.update("video_render", 82, f"動画レンダリング開始 ({total_pages}スライド, {aspect_ratio})")

        async def video_progress(current, total, duration, concat=False):
            if concat:
                await job.update("video_render", 93, f"動画セグメントを結合中... ({total}スライド分)")
            else:
                pct = 82 + int((current / total) * 10)  # 82〜92%
                await job.update("video_render", pct, f"スライド {current}/{total} をレンダリング中... ({duration:.1f}秒)")

        output_path = os.path.join(job.work_dir, f"{job.job_id}.mp4")
        await generate_video(
            pages, output_path,
            resolution=resolution,
            min_duration=slide_duration,
            progress_callback=video_progress,
        )
        await job.update("video_render", 95, "動画レンダリング完了")

        # 6. 完了
        download_url = f"/download/{job.job_id}"
        await job.complete(download_url)

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[Main] Job {job.job_id} failed: {e}")
        await job.fail(str(e))


# ─── エンドポイント ───────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "version": APP_VERSION, "pro_voice_available": bool(RUNPOD_ENDPOINT_URL)}


@app.get("/voices")
async def list_voices():
    """利用可能な声優ボイス一覧を返す"""
    from services.runpod_tts_service import get_pro_voices
    try:
        voices = await get_pro_voices()
        return {"voices": voices, "available": bool(RUNPOD_ENDPOINT_URL)}
    except Exception as e:
        return {"voices": [], "available": False, "error": str(e)}


@app.get("/elevenlabs/voices")
async def list_elevenlabs_voices(
    x_elevenlabs_key: Optional[str] = Header(None),
    language: Optional[str] = Query(None),
):
    """ElevenLabs の利用可能な音声一覧を取得する"""
    print(f"[ElevenLabs] Received key: {'yes' if x_elevenlabs_key else 'no'} (length: {len(x_elevenlabs_key) if x_elevenlabs_key else 0})")
    if not x_elevenlabs_key:
        raise HTTPException(status_code=422, detail="X-ElevenLabs-Key ヘッダーが必要です")

    try:
        import httpx
        import asyncio

        # 1. 自分のアカウントの音声を取得
        def _fetch_my_voices():
            resp = httpx.get(
                "https://api.elevenlabs.io/v1/voices",
                headers={"xi-api-key": x_elevenlabs_key},
                timeout=30.0,
            )
            resp.raise_for_status()
            return resp.json()

        # 2. コミュニティ Voice Library から人気の音声を取得
        def _fetch_shared_voices(lang: str = None, page_size: int = 100):
            params = {
                "page_size": page_size,
                "sort": "trending",
            }
            if lang:
                params["language"] = lang
            resp = httpx.get(
                "https://api.elevenlabs.io/v1/shared-voices",
                params=params,
                headers={"xi-api-key": x_elevenlabs_key},
                timeout=30.0,
            )
            resp.raise_for_status()
            return resp.json()

        # 言語コードのマッピング
        lang_map = {
            "ja": "ja", "en": "en", "zh-CN": "zh", "ko": "ko",
            "fr": "fr", "es": "es", "de": "de", "pt": "pt",
        }
        target_lang = lang_map.get(language, None)

        my_data = await asyncio.to_thread(_fetch_my_voices)

        # 指定言語の音声 + グローバル人気音声を両方取得
        if target_lang:
            lang_data = await asyncio.to_thread(lambda: _fetch_shared_voices(lang=target_lang, page_size=100))
            global_data = await asyncio.to_thread(lambda: _fetch_shared_voices(lang=None, page_size=50))
        else:
            lang_data = {"voices": []}
            global_data = await asyncio.to_thread(lambda: _fetch_shared_voices(lang=None, page_size=100))

        voices = []
        seen_ids = set()

        # 自分の音声（優先表示）
        for v in my_data.get("voices", []):
            vid = v.get("voice_id", "")
            if vid in seen_ids:
                continue
            seen_ids.add(vid)
            labels = v.get("labels") or {}
            # 元の category を保持（premade, cloned, generated 等）
            original_category = v.get("category", "unknown")
            voices.append({
                "voice_id": vid,
                "name": v.get("name", "Unknown"),
                "gender": labels.get("gender", "unknown"),
                "accent": labels.get("accent", ""),
                "description": labels.get("description", ""),
                "use_case": labels.get("use_case", ""),
                "age": labels.get("age", ""),
                "category": original_category,
                "preview_url": v.get("preview_url", ""),
            })

        # 指定言語のコミュニティ音声（優先）
        for v in lang_data.get("voices", []):
            vid = v.get("voice_id", "")
            if vid in seen_ids:
                continue
            seen_ids.add(vid)
            voices.append({
                "voice_id": vid,
                "name": v.get("name", "Unknown"),
                "gender": v.get("gender", "unknown"),
                "accent": v.get("accent", ""),
                "description": v.get("description", ""),
                "use_case": v.get("use_case", ""),
                "age": v.get("age", ""),
                "category": "community-local",
                "preview_url": v.get("preview_url", ""),
            })

        # グローバル人気音声
        for v in global_data.get("voices", []):
            vid = v.get("voice_id", "")
            if vid in seen_ids:
                continue
            seen_ids.add(vid)
            voices.append({
                "voice_id": vid,
                "name": v.get("name", "Unknown"),
                "gender": v.get("gender", "unknown"),
                "accent": v.get("accent", ""),
                "description": v.get("description", ""),
                "use_case": v.get("use_case", ""),
                "age": v.get("age", ""),
                "category": "community",
                "preview_url": v.get("preview_url", ""),
            })

        return {"voices": voices, "count": len(voices)}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=400, detail=f"ElevenLabs API エラー (HTTP {e.response.status_code}): {e.response.text[:300]}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ElevenLabs API エラー: {str(e)[:300]}")


@app.post("/generate")
async def generate(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    voice: str = Form(DEFAULT_VOICE),
    tts_provider: str = Form(DEFAULT_TTS_PROVIDER),
    slide_duration: int = Form(DEFAULT_SLIDE_DURATION),
    aspect_ratio: str = Form(DEFAULT_ASPECT_RATIO),
    output_language: str = Form("ja"),
    voice_sample: Optional[UploadFile] = File(None),
    x_ai_provider: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None),
    x_ai_model: Optional[str] = Header(None),
    x_dashscope_key: Optional[str] = Header(None),
):
    """動画生成のメインエンドポイント"""

    # バリデーション
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDFファイルのみアップロード可能です")

    if not x_ai_provider or x_ai_provider not in ("gemini", "openai", "openrouter"):
        raise HTTPException(status_code=422, detail="X-AI-Provider ヘッダーに gemini, openai, または openrouter を指定してください")

    if not x_api_key:
        raise HTTPException(status_code=422, detail="X-API-Key ヘッダーにAPIキーを指定してください")

    if aspect_ratio not in ASPECT_RATIO_RESOLUTIONS:
        raise HTTPException(status_code=422, detail=f"aspect_ratio は {', '.join(ASPECT_RATIO_RESOLUTIONS.keys())} のいずれかを指定してください")

    if slide_duration < 0 or slide_duration > 120:
        raise HTTPException(status_code=422, detail="slide_duration は 0〜120 の範囲で指定してください（0=自動）")

    # ボイスクローンのバリデーション
    if tts_provider == "qwen-clone":
        if not x_dashscope_key:
            raise HTTPException(status_code=422, detail="ボイスクローンには X-DashScope-Key ヘッダーが必要です")
        if not voice_sample or not voice_sample.filename:
            raise HTTPException(status_code=422, detail="ボイスクローンには音声サンプルファイルが必要です")
        allowed_audio_ext = (".wav", ".mp3", ".m4a")
        if not voice_sample.filename.lower().endswith(allowed_audio_ext):
            raise HTTPException(status_code=400, detail=f"音声サンプルは {', '.join(allowed_audio_ext)} 形式のみ対応しています")

    # ファイルサイズチェック
    content = await file.read()
    if len(content) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"ファイルサイズが{MAX_PDF_SIZE_BYTES // (1024*1024)}MBを超えています")

    # ジョブ作成
    job = job_manager.create_job()

    # PDFを一時ファイルに保存
    pdf_path = os.path.join(job.work_dir, "input.pdf")
    with open(pdf_path, "wb") as f:
        f.write(content)

    # 音声サンプルを一時ファイルに保存（ボイスクローン時）
    voice_sample_path = None
    if tts_provider == "qwen-clone" and voice_sample and voice_sample.filename:
        ext = os.path.splitext(voice_sample.filename)[1].lower()
        voice_sample_path = os.path.join(job.work_dir, f"voice_sample{ext}")
        sample_content = await voice_sample.read()
        with open(voice_sample_path, "wb") as f:
            f.write(sample_content)

    # バックグラウンドで処理開始
    background_tasks.add_task(
        run_generation,
        job=job,
        pdf_path=pdf_path,
        ai_provider=x_ai_provider,
        api_key=x_api_key,
        ai_model=x_ai_model,
        tts_provider=tts_provider,
        voice=voice,
        slide_duration=slide_duration,
        aspect_ratio=aspect_ratio,
        output_language=output_language,
        dashscope_api_key=x_dashscope_key,
        voice_sample_path=voice_sample_path,
    )

    return {
        "job_id": job.job_id,
        "status": "processing",
        "message": "動画生成を開始しました",
    }


@app.get("/progress/{job_id}")
async def progress(job_id: str):
    """SSEで進捗を配信する"""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="ジョブが見つかりません")

    async def event_stream():
        while True:
            try:
                event = await asyncio.wait_for(job.queue.get(), timeout=30.0)
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                if event.get("step") in ("done", "error"):
                    break
            except asyncio.TimeoutError:
                # キープアライブ
                yield f"data: {json.dumps({'step': 'keepalive', 'progress': job.progress, 'message': job.message})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/download/{job_id}")
async def download(job_id: str):
    """生成された動画をダウンロードする"""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="ジョブが見つかりません。有効期限が切れた可能性があります。")

    video_path = os.path.join(job.work_dir, f"{job.job_id}.mp4")
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="動画ファイルが見つかりません")

    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"slide2video_{job_id}.mp4",
    )


# ─── フロントエンド静的ファイル配信 ───────────────────
# APIエンドポイントより後にマウントすることで、APIが優先される
import pathlib
FRONTEND_OUT = pathlib.Path(__file__).resolve().parent.parent / "frontend" / "out"
if FRONTEND_OUT.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_OUT), html=True), name="frontend")
    print(f"[Main] Frontend mounted from: {FRONTEND_OUT}")
else:
    print(f"[Main] Frontend not found at: {FRONTEND_OUT}")
