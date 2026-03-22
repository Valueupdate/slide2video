"""
ボイスクローンサービス

Alibaba Cloud DashScope API (Qwen3-TTS-VC) を使用して
ユーザーの音声サンプルから声を複製し、音声合成に使用する。
"""
import os
import base64
import pathlib
import requests
import asyncio
import subprocess
from typing import Optional

# DashScope API エンドポイント（シンガポールリージョン）
DASHSCOPE_VOICE_CLONE_URL = "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/customization"
DASHSCOPE_TTS_BASE_URL = "https://dashscope-intl.aliyuncs.com/api/v1"

# ボイスクローン用モデル（固定）
VOICE_ENROLLMENT_MODEL = "qwen-voice-enrollment"
# 音声合成モデル（非ストリーミング）
DEFAULT_TTS_VC_MODEL = "qwen3-tts-vc-2026-01-22"

# テキスト長の上限（DashScope API の制約）
MAX_TEXT_LENGTH = 500  # 安全マージンを取って500文字

# 音声ファイルのMIMEタイプ
MIME_TYPES = {
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
}


def _get_mime_type(file_path: str) -> str:
    """ファイル拡張子からMIMEタイプを取得"""
    ext = pathlib.Path(file_path).suffix.lower()
    return MIME_TYPES.get(ext, "audio/mpeg")


def _split_text(text: str, max_length: int = MAX_TEXT_LENGTH) -> list[str]:
    """
    テキストを指定文字数以下のチャンクに分割する。
    句点（。）、読点（、）、改行で区切りを優先する。
    """
    if len(text) <= max_length:
        return [text]

    chunks = []
    remaining = text

    while remaining:
        if len(remaining) <= max_length:
            chunks.append(remaining)
            break

        # max_length 以内で最適な区切り位置を探す
        segment = remaining[:max_length]
        split_pos = -1

        # 優先順: 句点 > 読点 > 改行 > スペース
        for delimiter in ["。", "！", "？", "\n", "、", "．", " "]:
            pos = segment.rfind(delimiter)
            if pos > 0:
                split_pos = pos + 1  # 区切り文字を含める
                break

        # 区切りが見つからなければ max_length で強制分割
        if split_pos <= 0:
            split_pos = max_length

        chunk = remaining[:split_pos].strip()
        if chunk:
            chunks.append(chunk)
        remaining = remaining[split_pos:].strip()

    return chunks


def _create_voice_sync(
    audio_path: str,
    api_key: str,
    preferred_name: str = "slide2video",
    target_model: str = DEFAULT_TTS_VC_MODEL,
) -> str:
    """
    音声サンプルからボイスIDを作成する（同期版）

    Args:
        audio_path: 音声サンプルファイルのパス
        api_key: DashScope APIキー
        preferred_name: ボイスの識別名
        target_model: 対象のTTSモデル

    Returns:
        ボイスID文字列

    Raises:
        Exception: API呼び出し失敗時
    """
    file_path = pathlib.Path(audio_path)
    if not file_path.exists():
        raise FileNotFoundError(f"音声ファイルが見つかりません: {audio_path}")

    mime_type = _get_mime_type(audio_path)
    base64_str = base64.b64encode(file_path.read_bytes()).decode()
    data_uri = f"data:{mime_type};base64,{base64_str}"

    payload = {
        "model": VOICE_ENROLLMENT_MODEL,
        "input": {
            "action": "create",
            "target_model": target_model,
            "preferred_name": preferred_name,
            "audio": {"data": data_uri},
        },
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    resp = requests.post(DASHSCOPE_VOICE_CLONE_URL, json=payload, headers=headers)

    if resp.status_code != 200:
        raise Exception(f"ボイスクローン失敗 (HTTP {resp.status_code}): {resp.text[:500]}")

    try:
        voice_id = resp.json()["output"]["voice"]
        print(f"[VoiceClone] Created voice: {voice_id}")
        return voice_id
    except (KeyError, ValueError) as e:
        raise Exception(f"ボイスクローンのレスポンス解析に失敗: {e}")


async def create_voice(
    audio_path: str,
    api_key: str,
    preferred_name: str = "slide2video",
    target_model: str = DEFAULT_TTS_VC_MODEL,
) -> str:
    """
    音声サンプルからボイスIDを作成する（非同期版）

    Args:
        audio_path: 音声サンプルファイルのパス
        api_key: DashScope APIキー
        preferred_name: ボイスの識別名
        target_model: 対象のTTSモデル

    Returns:
        ボイスID文字列
    """
    return await asyncio.to_thread(
        _create_voice_sync, audio_path, api_key, preferred_name, target_model
    )


def _synthesize_chunk_sync(
    text: str,
    voice_id: str,
    output_path: str,
    api_key: str,
    target_model: str = DEFAULT_TTS_VC_MODEL,
) -> str:
    """
    1チャンク分のテキストを音声合成する（同期版）

    Args:
        text: 読み上げるテキスト（600文字以下）
        voice_id: create_voiceで取得したボイスID
        output_path: 出力音声ファイルパス
        api_key: DashScope APIキー
        target_model: 対象のTTSモデル

    Returns:
        生成された音声ファイルのパス
    """
    import dashscope

    dashscope.base_http_api_url = DASHSCOPE_TTS_BASE_URL
    dashscope.api_key = api_key

    response = dashscope.MultiModalConversation.call(
        model=target_model,
        api_key=api_key,
        text=text,
        voice=voice_id,
        stream=False,
    )

    if response.status_code != 200:
        raise Exception(f"音声合成失敗: {response.message}")

    # レスポンスから音声URLを取得してダウンロード
    audio_url = response.output.audio.url
    audio_resp = requests.get(audio_url)
    if audio_resp.status_code != 200:
        raise Exception(f"音声ファイルのダウンロード失敗: {audio_resp.status_code}")

    with open(output_path, "wb") as f:
        f.write(audio_resp.content)

    return output_path


def _concat_audio_files(chunk_paths: list[str], output_path: str) -> str:
    """FFmpegでチャンク音声ファイルを結合する"""
    work_dir = os.path.dirname(output_path)
    concat_list_path = os.path.join(work_dir, "audio_concat_list.txt")

    with open(concat_list_path, "w", encoding="utf-8") as f:
        for path in chunk_paths:
            f.write(f"file '{path.replace(os.sep, '/')}'\n")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list_path,
        "-c", "copy",
        output_path,
    ]

    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        raise Exception(f"音声結合失敗: {result.stderr.decode()[:300]}")

    # チャンクファイルを削除
    for path in chunk_paths:
        try:
            os.remove(path)
        except OSError:
            pass
    try:
        os.remove(concat_list_path)
    except OSError:
        pass

    return output_path


def _synthesize_sync(
    text: str,
    voice_id: str,
    output_path: str,
    api_key: str,
    target_model: str = DEFAULT_TTS_VC_MODEL,
) -> str:
    """
    クローンした声で音声合成する（同期版）
    テキストが長い場合はチャンク分割して結合する。

    Args:
        text: 読み上げるテキスト
        voice_id: create_voiceで取得したボイスID
        output_path: 出力音声ファイルパス
        api_key: DashScope APIキー
        target_model: 対象のTTSモデル

    Returns:
        生成された音声ファイルのパス
    """
    chunks = _split_text(text, MAX_TEXT_LENGTH)

    if len(chunks) == 1:
        # 分割不要：そのまま合成
        return _synthesize_chunk_sync(text, voice_id, output_path, api_key, target_model)

    # 複数チャンク：個別に合成してFFmpegで結合
    print(f"[VoiceClone] Text split into {len(chunks)} chunks ({len(text)} chars)")
    work_dir = os.path.dirname(output_path)
    base_name = os.path.splitext(os.path.basename(output_path))[0]
    chunk_paths = []

    for i, chunk in enumerate(chunks):
        chunk_path = os.path.join(work_dir, f"{base_name}_chunk_{i:03d}.mp3")
        print(f"[VoiceClone] Synthesizing chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")
        _synthesize_chunk_sync(chunk, voice_id, chunk_path, api_key, target_model)
        chunk_paths.append(chunk_path)

    # FFmpegで結合
    print(f"[VoiceClone] Concatenating {len(chunk_paths)} audio chunks...")
    return _concat_audio_files(chunk_paths, output_path)


async def synthesize(
    text: str,
    voice_id: str,
    output_path: str,
    api_key: str,
    target_model: str = DEFAULT_TTS_VC_MODEL,
) -> str:
    """
    クローンした声で音声合成する（非同期版）

    Args:
        text: 読み上げるテキスト
        voice_id: create_voiceで取得したボイスID
        output_path: 出力音声ファイルパス
        api_key: DashScope APIキー
        target_model: 対象のTTSモデル

    Returns:
        生成された音声ファイルのパス
    """
    return await asyncio.to_thread(
        _synthesize_sync, text, voice_id, output_path, api_key, target_model
    )
