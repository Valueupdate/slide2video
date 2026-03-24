"""
音声合成サービス

Edge-TTS（無料・高品質）をデフォルトとし、
OpenAI TTSをオプションで提供する。
Qwen3-TTS-VC（ボイスクローン）にも対応。
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
    dashscope_api_key: Optional[str] = None,
    clone_voice_id: Optional[str] = None,
    pro_voice_id: Optional[str] = None,
    language: str = "Japanese",
) -> str:
    """
    テキストから音声ファイル（MP3/WAV）を生成する。

    Args:
        text: 読み上げるテキスト
        output_path: 出力ファイルパス
        tts_provider: "edge-tts" or "openai" or "qwen-clone" or "pro-voice"
        voice: 音声モデル名
        openai_api_key: OpenAI TTS使用時のAPIキー
        dashscope_api_key: Qwen TTS使用時のDashScope APIキー
        clone_voice_id: ボイスクローン使用時のボイスID
        pro_voice_id: 声優ボイスID（RunPod セルフホスト）
        language: 言語名（"Japanese", "English" 等）

    Returns:
        生成された音声ファイルのパス
    """
    if tts_provider == "openai" and openai_api_key:
        return await _generate_with_openai(text, output_path, voice, openai_api_key)
    elif tts_provider == "elevenlabs" and openai_api_key:
        return await _generate_with_elevenlabs(text, output_path, voice, openai_api_key)
    elif tts_provider == "azure" and openai_api_key:
        return await _generate_with_azure(text, output_path, voice, openai_api_key)
    elif tts_provider == "google-cloud" and openai_api_key:
        return await _generate_with_google_cloud(text, output_path, voice, openai_api_key, language)
    elif tts_provider == "qwen-clone" and dashscope_api_key and clone_voice_id:
        return await _generate_with_qwen_clone(text, output_path, clone_voice_id, dashscope_api_key)
    elif tts_provider == "pro-voice" and pro_voice_id:
        return await _generate_with_pro_voice(text, output_path, pro_voice_id, language)
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


async def _generate_with_qwen_clone(text: str, output_path: str, voice_id: str, api_key: str) -> str:
    """Qwen3-TTS-VCでクローンした声で音声を生成する"""
    from services.voice_clone import synthesize

    await synthesize(
        text=text,
        voice_id=voice_id,
        output_path=output_path,
        api_key=api_key,
    )

    print(f"[TTSService] Qwen Clone TTS generated: {output_path}")
    return output_path


async def _generate_with_elevenlabs(text: str, output_path: str, voice: str, api_key: str) -> str:
    """ElevenLabs TTSで音声を生成する（高品質・有料）"""
    import httpx

    # ElevenLabs の音声IDにマッピング（プリセット音声）
    elevenlabs_voices = {
        "rachel": "21m00Tcm4TlvDq8ikWAM",
        "drew": "29vD33N1CtxCmqQRPOHJ",
        "clyde": "2EiwWnXFnvU5JabPnv8n",
        "paul": "5Q0t7uMcjvnagumLfvZi",
        "domi": "AZnzlk1XvdvUeBnXmlld",
        "dave": "CYw3kZ02Hs0563khs1Fj",
        "fin": "D38z5RcWu1voky8WS1ja",
        "sarah": "EXAVITQu4vr4xnSDxMaL",
        "antoni": "ErXwobaYiN019PkySvjV",
        "thomas": "GBv7mTt0atIp3Br8iCZE",
        "charlie": "IKne3meq5aSn9XLyUdCD",
        "george": "JBFqnCBsd6RMkjVDRZzb",
        "emily": "LcfcDJNUP1GQjkzn1xUU",
        "elli": "MF3mGyEYCl7XYWbV9V6O",
        "callum": "N2lVS1w4EtoT3dr4eOWO",
        "patrick": "ODq5zmih8GrVes37Dizd",
        "harry": "SOYHLrjzK2X1ezoPC6cr",
        "liam": "TX3LPaxmHKxFdv7VOQHJ",
        "dorothy": "ThT5KcBeYPX3keUQqHPh",
        "josh": "TxGEqnHWrfWFTfGW9XjX",
        "arnold": "VR6AewLTigWG4xSOukaG",
        "charlotte": "XB0fDUnXU5powFXDhCwa",
        "alice": "Xb7hH8MSUJpSbSDYk0k2",
        "matilda": "XrExE9yKIg1WjnnlVkGX",
        "james": "ZQe5CZNOzWyzPSCn5a3c",
        "jessica": "cgSgspJ2msm6clMCkdW9",
        "lily": "pFZP5JQG7iQjIQuC4Bku",
        "aria": "9BWtsMINqrJLrRacOk9x",
        "river": "SAz9YHcvj6GT2YYXdXww",
    }

    # voice が既知のキーならIDに変換、そうでなければそのまま voice_id として使用
    voice_id = elevenlabs_voices.get(voice, voice)

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                    },
                },
            )

            if response.status_code == 402:
                raise Exception(
                    "ElevenLabs エラー: この音声は有料プラン（Starter $5/月〜）が必要です。"
                    "プリセット音声（Rachel, Sarah 等）を選択するか、"
                    "https://elevenlabs.io/pricing でプランをアップグレードしてください。"
                )
            elif response.status_code == 401:
                raise Exception("ElevenLabs エラー: API キーが無効です。キーを確認してください。")
            elif response.status_code != 200:
                raise Exception(f"ElevenLabs エラー (HTTP {response.status_code}): {response.text[:200]}")

            with open(output_path, "wb") as f:
                f.write(response.content)

        print(f"[TTSService] ElevenLabs TTS generated: {output_path}")
        return output_path

    except httpx.HTTPError as e:
        raise Exception(f"ElevenLabs 通信エラー: {str(e)}")


async def _generate_with_google_cloud(text: str, output_path: str, voice: str, api_key: str, language: str = "Japanese") -> str:
    """Google Cloud TTSで音声を生成する（高品質・無料枠400万文字/月）"""
    import json
    import tempfile
    from google.cloud import texttospeech
    from google.oauth2 import service_account

    # 言語名 → 言語コードのマッピング
    lang_codes = {
        "Japanese": "ja-JP", "English": "en-US", "Chinese": "zh-CN",
        "Korean": "ko-KR", "French": "fr-FR", "Spanish": "es-ES",
        "German": "de-DE", "Portuguese": "pt-BR", "Auto": "ja-JP",
    }
    lang_code = lang_codes.get(language, "ja-JP")

    # Google Cloud の音声名にマッピング
    google_voices = {
        "wavenet-a": f"{lang_code}-Wavenet-A",
        "wavenet-b": f"{lang_code}-Wavenet-B",
        "wavenet-c": f"{lang_code}-Wavenet-C",
        "wavenet-d": f"{lang_code}-Wavenet-D",
        "neural2-b": f"{lang_code}-Neural2-B",
        "neural2-c": f"{lang_code}-Neural2-C",
        "neural2-d": f"{lang_code}-Neural2-D",
        "standard-a": f"{lang_code}-Standard-A",
        "standard-b": f"{lang_code}-Standard-B",
        "standard-c": f"{lang_code}-Standard-C",
        "standard-d": f"{lang_code}-Standard-D",
    }
    voice_name = google_voices.get(voice, voice)

    # voice_name から言語コードを抽出（例: "ja-JP-Wavenet-A" → "ja-JP"）
    voice_lang = "-".join(voice_name.split("-")[:2]) if "-" in voice_name else lang_code

    def _synthesize():
        # api_key は JSON サービスアカウントキーの文字列
        try:
            key_data = json.loads(api_key)
            credentials = service_account.Credentials.from_service_account_info(key_data)
            client = texttospeech.TextToSpeechClient(credentials=credentials)
        except (json.JSONDecodeError, ValueError):
            # JSON でない場合は API キーとして直接使用を試みる
            # 環境変数 GOOGLE_APPLICATION_CREDENTIALS 経由
            tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
            tmp.write(api_key)
            tmp.close()
            import os
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = tmp.name
            client = texttospeech.TextToSpeechClient()

        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice_params = texttospeech.VoiceSelectionParams(
            language_code=voice_lang,
            name=voice_name,
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
        )

        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice_params,
            audio_config=audio_config,
        )

        with open(output_path, "wb") as f:
            f.write(response.audio_content)

        return output_path

    await asyncio.to_thread(_synthesize)
    print(f"[TTSService] Google Cloud TTS generated: {output_path}")
    return output_path


async def _generate_with_azure(text: str, output_path: str, voice: str, api_key: str) -> str:
    """Azure Speech TTSで音声を生成する（高品質・無料枠50万文字/月）"""
    import azure.cognitiveservices.speech as speechsdk

    # api_key は "key:region" 形式（例: "abc123:japaneast"）
    if ":" in api_key:
        key, region = api_key.rsplit(":", 1)
    else:
        key = api_key
        region = "japaneast"

    # Azure の音声名にマッピング
    azure_voices = {
        "nanami": "ja-JP-NanamiNeural",
        "keita": "ja-JP-KeitaNeural",
        "aoi": "ja-JP-AoiNeural",
        "daichi": "ja-JP-DaichiNeural",
        "mayu": "ja-JP-MayuNeural",
        "naoki": "ja-JP-NaokiNeural",
        "shiori": "ja-JP-ShioriNeural",
        "jenny": "en-US-JennyNeural",
        "guy": "en-US-GuyNeural",
        "aria": "en-US-AriaNeural",
        "davis": "en-US-DavisNeural",
        "xiaoxiao": "zh-CN-XiaoxiaoNeural",
        "yunxi": "zh-CN-YunxiNeural",
    }
    voice_name = azure_voices.get(voice, voice)

    def _synthesize():
        speech_config = speechsdk.SpeechConfig(subscription=key, region=region)
        speech_config.speech_synthesis_voice_name = voice_name
        speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3
        )

        audio_config = speechsdk.audio.AudioOutputConfig(filename=output_path)
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=speech_config,
            audio_config=audio_config,
        )

        result = synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.Canceled:
            cancellation = result.cancellation_details
            raise Exception(f"Azure TTS エラー: {cancellation.reason} - {cancellation.error_details}")

        return output_path

    await asyncio.to_thread(_synthesize)
    print(f"[TTSService] Azure TTS generated: {output_path}")
    return output_path


async def _generate_with_pro_voice(text: str, output_path: str, voice_id: str, language: str = "Japanese") -> str:
    """RunPod セルフホスト Qwen3-TTS で声優ボイスを生成する"""
    from services.runpod_tts_service import synthesize

    await synthesize(
        text=text,
        voice_id=voice_id,
        output_path=output_path,
        language=language,
    )

    print(f"[TTSService] Pro Voice TTS generated: {output_path}")
    return output_path
