"""
音声合成サービス

Edge-TTS（無料・高品質）をデフォルトとし、
OpenAI TTSをオプションで提供する。
"""
import os
import asyncio
from typing import Optional

from config import DEFAULT_VOICE


async def generate_audio(
    text: str,
    output_path: str,
    tts_provider: str = "edge-tts",
    voice: str = DEFAULT_VOICE,
    openai_api_key: Optional[str] = None,
) -> str:
    """
    テキストから音声ファイル（MP3）を生成する。

    Args:
        text: 読み上げるテキスト
        output_path: 出力ファイルパス
        tts_provider: "edge-tts" or "openai"
        voice: 音声モデル名
        openai_api_key: OpenAI TTS使用時のAPIキー

    Returns:
        生成された音声ファイルのパス
    """
    if tts_provider == "openai" and openai_api_key:
        return await _generate_with_openai(text, output_path, voice, openai_api_key)
    else:
        return await _generate_with_edge_tts(text, output_path, voice)


async def _generate_with_edge_tts(text: str, output_path: str, voice: str) -> str:
    """Edge-TTSで音声を生成する（無料・高品質）"""
    import edge_tts

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)

    print(f"[TTSService] Edge-TTS generated: {output_path}")
    return output_path


async def _generate_with_openai(text: str, output_path: str, voice: str, api_key: str) -> str:
    """OpenAI TTSで音声を生成する（有料・高品質）"""
    from openai import OpenAI

    client = OpenAI(api_key=api_key)

    # OpenAI TTS の音声名にマッピング（Edge-TTS名が来た場合のフォールバック）
    openai_voices = {"alloy", "echo", "fable", "onyx", "nova", "shimmer"}
    if voice not in openai_voices:
        voice = "alloy"

    response = await asyncio.to_thread(
        lambda: client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text,
        )
    )
    await asyncio.to_thread(lambda: response.stream_to_file(output_path))

    print(f"[TTSService] OpenAI TTS generated: {output_path}")
    return output_path
