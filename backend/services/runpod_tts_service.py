"""
RunPod GPU サーバー連携 TTS サービス

セルフホストの Qwen3-TTS を RunPod サーバーレス GPU 経由で呼び出す。
声優事務所から提供された音声でクローンした「プロ声優ボイス」を提供する。
ユーザーは API キー不要。サーバー側で RunPod を呼び出す。
"""
import os
import asyncio
import base64
import json
import time
import subprocess
import requests
from typing import Optional, List, Dict, Any

from config import RUNPOD_ENDPOINT_URL, RUNPOD_API_KEY, RUNPOD_TIMEOUT_SECONDS

# 声優一覧のキャッシュ
_voices_cache: Optional[List[Dict[str, Any]]] = None
_voices_cache_time: float = 0
VOICES_CACHE_TTL = 300  # 5分


def _check_config():
    """RunPod の設定が有効か確認する"""
    if not RUNPOD_ENDPOINT_URL or not RUNPOD_API_KEY:
        raise Exception(
            "RunPod が設定されていません。.env に RUNPOD_ENDPOINT_URL と RUNPOD_API_KEY を設定してください。"
        )


def _runpod_request_sync(payload: dict, timeout: int = RUNPOD_TIMEOUT_SECONDS) -> dict:
    """
    RunPod サーバーレスエンドポイントにリクエストを送信する（同期版）

    RunPod の非同期フロー:
    1. POST /run → {"id": "xxx", "status": "IN_QUEUE"}
    2. GET /status/{id} をポーリング → {"status": "COMPLETED", "output": {...}}
    """
    _check_config()

    headers = {
        "Authorization": f"Bearer {RUNPOD_API_KEY}",
        "Content-Type": "application/json",
    }

    # 1. ジョブを投入
    run_url = f"{RUNPOD_ENDPOINT_URL}/run"
    resp = requests.post(run_url, json={"input": payload}, headers=headers, timeout=30)

    if resp.status_code != 200:
        raise Exception(f"RunPod ジョブ投入失敗 (HTTP {resp.status_code}): {resp.text[:500]}")

    job_data = resp.json()
    job_id = job_data.get("id")

    if not job_id:
        # 同期レスポンス（runsync の場合）
        if "output" in job_data:
            return job_data["output"]
        raise Exception(f"RunPod レスポンスにジョブIDがありません: {job_data}")

    # 2. ステータスをポーリング
    status_url = f"{RUNPOD_ENDPOINT_URL}/status/{job_id}"
    start_time = time.time()
    poll_interval = 1.0

    while True:
        elapsed = time.time() - start_time
        if elapsed > timeout:
            raise Exception(f"RunPod タイムアウト ({timeout}秒): ジョブ {job_id}")

        time.sleep(poll_interval)
        poll_interval = min(poll_interval * 1.2, 5.0)  # 徐々に間隔を広げる

        status_resp = requests.get(status_url, headers=headers, timeout=15)
        if status_resp.status_code != 200:
            continue

        status_data = status_resp.json()
        status = status_data.get("status")

        if status == "COMPLETED":
            output = status_data.get("output", {})
            if "error" in output:
                raise Exception(f"RunPod 処理エラー: {output['error']}")
            return output

        if status == "FAILED":
            error = status_data.get("error", "不明なエラー")
            raise Exception(f"RunPod ジョブ失敗: {error}")

        # IN_QUEUE, IN_PROGRESS → 続行
        print(f"[RunPodTTS] Job {job_id}: {status} ({elapsed:.0f}s)")


async def get_pro_voices() -> List[Dict[str, Any]]:
    """
    利用可能な声優ボイス一覧を取得する。
    結果は5分間キャッシュされる。
    """
    global _voices_cache, _voices_cache_time

    now = time.time()
    if _voices_cache is not None and (now - _voices_cache_time) < VOICES_CACHE_TTL:
        return _voices_cache

    try:
        result = await asyncio.to_thread(
            _runpod_request_sync,
            {"mode": "list_voices"},
        )
        voices = result.get("voices", [])
        _voices_cache = voices
        _voices_cache_time = now
        print(f"[RunPodTTS] Fetched {len(voices)} pro voices")
        return voices
    except Exception as e:
        print(f"[RunPodTTS] Failed to fetch voices: {e}")
        if _voices_cache is not None:
            return _voices_cache
        return []


async def synthesize(
    text: str,
    voice_id: str,
    output_path: str,
    language: str = "Japanese",
) -> str:
    """
    声優ボイスで音声合成する。

    Args:
        text: 読み上げるテキスト
        voice_id: 声優ID（RunPod 側で事前登録済み）
        output_path: 出力音声ファイルパス
        language: 言語

    Returns:
        生成された音声ファイルのパス
    """
    chunks = _split_text(text, max_length=500)

    if len(chunks) == 1:
        return await _synthesize_single(text, voice_id, output_path, language)

    # 複数チャンク: 個別に合成して FFmpeg で結合
    print(f"[RunPodTTS] Text split into {len(chunks)} chunks ({len(text)} chars)")

    work_dir = os.path.dirname(output_path)
    base_name = os.path.splitext(os.path.basename(output_path))[0]
    chunk_paths = []

    for i, chunk in enumerate(chunks):
        chunk_path = os.path.join(work_dir, f"{base_name}_rpchunk_{i:03d}.wav")
        print(f"[RunPodTTS] Synthesizing chunk {i + 1}/{len(chunks)} ({len(chunk)} chars)")
        await _synthesize_single(chunk, voice_id, chunk_path, language)
        chunk_paths.append(chunk_path)

    # FFmpeg で結合
    concat_list = os.path.join(work_dir, f"{base_name}_rp_concat.txt")
    with open(concat_list, "w", encoding="utf-8") as f:
        for p in chunk_paths:
            f.write(f"file '{p.replace(os.sep, '/')}'\n")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        output_path,
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        raise Exception(f"音声結合失敗: {result.stderr.decode()[:300]}")

    # 一時ファイル削除
    for p in chunk_paths:
        try:
            os.remove(p)
        except OSError:
            pass
    try:
        os.remove(concat_list)
    except OSError:
        pass

    return output_path


async def _synthesize_single(
    text: str,
    voice_id: str,
    output_path: str,
    language: str,
) -> str:
    """1チャンク分の音声を RunPod 経由で合成する"""
    result = await asyncio.to_thread(
        _runpod_request_sync,
        {
            "mode": "clone",
            "text": text,
            "voice_id": voice_id,
            "language": language,
        },
    )

    audio_base64 = result.get("audio_base64")
    if not audio_base64:
        raise Exception("RunPod から音声データが返されませんでした")

    audio_bytes = base64.b64decode(audio_base64)
    with open(output_path, "wb") as f:
        f.write(audio_bytes)

    duration = result.get("duration", 0)
    print(f"[RunPodTTS] Generated: {output_path} ({duration}s)")
    return output_path


def _split_text(text: str, max_length: int = 500) -> list:
    """テキストを区切り文字で分割する"""
    if len(text) <= max_length:
        return [text]

    chunks = []
    remaining = text

    while remaining:
        if len(remaining) <= max_length:
            chunks.append(remaining)
            break

        segment = remaining[:max_length]
        split_pos = -1

        for delimiter in ["。", "！", "？", "\n", "、", "．", " "]:
            pos = segment.rfind(delimiter)
            if pos > 0:
                split_pos = pos + 1
                break

        if split_pos <= 0:
            split_pos = max_length

        chunk = remaining[:split_pos].strip()
        if chunk:
            chunks.append(chunk)
        remaining = remaining[split_pos:].strip()

    return chunks
