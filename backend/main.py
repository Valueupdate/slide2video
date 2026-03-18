"""
Slide2Video バックエンド - エントリーポイント

PDFをアップロードすると、AI台本生成→音声合成→動画生成を一気通貫で実行し、
MP4動画をダウンロードできるAPIサーバー。
"""
import os
import json
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Header, Form, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional

from config import (
    APP_VERSION, TEMP_DIR, FRONTEND_URL, MAX_PDF_SIZE_BYTES,
    JOB_CLEANUP_INTERVAL_SECONDS, DEFAULT_VOICE, DEFAULT_TTS_PROVIDER,
)
from services.job_manager import job_manager, Job
from services.pdf_service import parse_pdf
from services.ai_service import generate_scripts
from services.tts_service import generate_audio
from services.video_service import generate_video


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
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "https://decrescent-patrick-patriarchical.ngrok-free.dev"],
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
    tts_provider: str,
    voice: str,
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

        pages = await generate_scripts(pages, ai_provider, api_key, script_progress)
        await job.update("script_gen", 50, "全スライドの台本生成完了")

        # 3. 音声合成
        total = len(pages)
        for i, page in enumerate(pages):
            pct = 50 + int((i / total) * 30)
            await job.update("tts", pct, f"スライド {page['page_number']}/{total} の音声生成中...")

            audio_path = os.path.join(job.work_dir, f"audio_{page['page_number']}.mp3")

            # OpenAI TTS の場合はAPIキーを渡す
            openai_key = api_key if (tts_provider == "openai" and ai_provider == "openai") else None

            await generate_audio(
                text=page["script"],
                output_path=audio_path,
                tts_provider=tts_provider,
                voice=voice,
                openai_api_key=openai_key,
            )
            page["audio_path"] = audio_path

        await job.update("tts", 80, "音声生成完了")

        # 4. 動画生成
        await job.update("video_render", 85, "動画レンダリング中...")
        output_path = os.path.join(job.work_dir, f"{job.job_id}.mp4")
        await generate_video(pages, output_path)
        await job.update("video_render", 95, "動画レンダリング完了")

        # 5. 完了
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
    return {"status": "ok", "version": APP_VERSION}


@app.post("/generate")
async def generate(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    voice: str = Form(DEFAULT_VOICE),
    tts_provider: str = Form(DEFAULT_TTS_PROVIDER),
    x_ai_provider: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None),
):
    """動画生成のメインエンドポイント"""

    # バリデーション
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDFファイルのみアップロード可能です")

    if not x_ai_provider or x_ai_provider not in ("gemini", "openai"):
        raise HTTPException(status_code=422, detail="X-AI-Provider ヘッダーに gemini または openai を指定してください")

    if not x_api_key:
        raise HTTPException(status_code=422, detail="X-API-Key ヘッダーにAPIキーを指定してください")

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

    # バックグラウンドで処理開始
    background_tasks.add_task(
        run_generation,
        job=job,
        pdf_path=pdf_path,
        ai_provider=x_ai_provider,
        api_key=x_api_key,
        tts_provider=tts_provider,
        voice=voice,
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
