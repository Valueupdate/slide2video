"""
RunPod Serverless Handler - Qwen3-TTS 音声合成ワーカー

声優ボイスクローン + カスタムボイス + ボイスデザインに対応。
VPSのバックエンド（FastAPI）からHTTPで呼び出される。
"""
import os
import json
import base64
import io
import torch
import soundfile as sf
import numpy as np
import runpod

from qwen_tts import Qwen3TTSModel

# ─── グローバル変数 ───
clone_model = None
custom_model = None
voice_prompts = {}

MODELS_DIR = "/models"
VOICES_DIR = "/app/voices"


def load_models():
    """モデルをGPUにロードする（初回のみ）"""
    global clone_model, custom_model

    print("[Handler] Loading Qwen3-TTS-12Hz-1.7B-Base...")
    clone_model = Qwen3TTSModel.from_pretrained(
        os.path.join(MODELS_DIR, "Qwen3-TTS-12Hz-1.7B-Base"),
        device_map="cuda:0",
        dtype=torch.bfloat16,
        attn_implementation="flash_attention_2",
    )

    print("[Handler] Loading Qwen3-TTS-12Hz-1.7B-CustomVoice...")
    custom_model = Qwen3TTSModel.from_pretrained(
        os.path.join(MODELS_DIR, "Qwen3-TTS-12Hz-1.7B-CustomVoice"),
        device_map="cuda:0",
        dtype=torch.bfloat16,
        attn_implementation="flash_attention_2",
    )

    print("[Handler] Models loaded successfully.")


def load_voice_prompts():
    """事前登録済みの声優ボイスプロンプトをロードする"""
    global voice_prompts

    if not os.path.exists(VOICES_DIR):
        print(f"[Handler] Voices directory not found: {VOICES_DIR}")
        return

    for voice_dir_name in os.listdir(VOICES_DIR):
        voice_path = os.path.join(VOICES_DIR, voice_dir_name)
        if not os.path.isdir(voice_path):
            continue

        meta_path = os.path.join(voice_path, "meta.json")
        sample_path = os.path.join(voice_path, "sample.wav")

        if not os.path.exists(meta_path) or not os.path.exists(sample_path):
            print(f"[Handler] Skipping incomplete voice: {voice_dir_name}")
            continue

        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

        ref_text = meta.get("ref_text", "")
        print(f"[Handler] Creating voice prompt for: {meta.get('name', voice_dir_name)}")

        try:
            prompt = clone_model.create_voice_clone_prompt(
                ref_audio=sample_path,
                ref_text=ref_text,
                x_vector_only_mode=(ref_text == ""),
            )
            voice_prompts[voice_dir_name] = {
                "prompt": prompt,
                "meta": meta,
            }
            print(f"[Handler] Voice prompt created: {voice_dir_name} ({meta.get('name', 'unknown')})")
        except Exception as e:
            print(f"[Handler] Failed to create voice prompt for {voice_dir_name}: {e}")

    print(f"[Handler] Total voice prompts loaded: {len(voice_prompts)}")


def wav_to_base64(wav_array: np.ndarray, sample_rate: int) -> str:
    """numpy配列のWAVデータをBase64文字列に変換"""
    buffer = io.BytesIO()
    sf.write(buffer, wav_array, sample_rate, format="WAV")
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


def handler(event):
    """RunPod サーバーレスハンドラー"""
    input_data = event.get("input", {})
    mode = input_data.get("mode", "clone")

    # ─── 声優一覧 ───
    if mode == "list_voices":
        voices = []
        for voice_id, info in voice_prompts.items():
            meta = info["meta"]
            voices.append({
                "voice_id": voice_id,
                "name": meta.get("name", voice_id),
                "gender": meta.get("gender", "unknown"),
                "description": meta.get("description", ""),
                "language": meta.get("language", "Japanese"),
                "sample_text": meta.get("ref_text", ""),
            })
        return {"voices": voices}

    # ─── 音声合成 ───
    text = input_data.get("text", "")
    language = input_data.get("language", "Japanese")

    if not text:
        return {"error": "text は必須です"}

    try:
        if mode == "clone":
            voice_id = input_data.get("voice_id")

            if voice_id and voice_id in voice_prompts:
                prompt = voice_prompts[voice_id]["prompt"]
                wavs, sr = clone_model.generate_voice_clone(
                    text=text,
                    language=language,
                    voice_clone_prompt=prompt,
                )
            elif input_data.get("ref_audio_base64"):
                audio_bytes = base64.b64decode(input_data["ref_audio_base64"])
                audio_buffer = io.BytesIO(audio_bytes)
                ref_data, ref_sr = sf.read(audio_buffer)
                ref_text = input_data.get("ref_text", "")

                wavs, sr = clone_model.generate_voice_clone(
                    text=text,
                    language=language,
                    ref_audio=(ref_data, ref_sr),
                    ref_text=ref_text,
                )
            else:
                return {"error": "voice_id または ref_audio_base64 が必要です"}

        elif mode == "custom":
            speaker = input_data.get("speaker", "Vivian")
            instruct = input_data.get("instruct", "")

            wavs, sr = custom_model.generate_custom_voice(
                text=text,
                language=language,
                speaker=speaker,
                instruct=instruct if instruct else None,
            )
        else:
            return {"error": f"未対応の mode: {mode}"}

        audio_base64 = wav_to_base64(wavs[0], sr)
        duration = len(wavs[0]) / sr

        return {
            "audio_base64": audio_base64,
            "sample_rate": sr,
            "duration": round(duration, 2),
        }

    except Exception as e:
        print(f"[Handler] Error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


# ─── 起動時初期化 ───
print("[Handler] Initializing...")
load_models()
load_voice_prompts()
runpod.serverless.start({"handler": handler})
