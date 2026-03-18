"""
アプリケーション設定の一元管理モジュール
"""
import os
from dotenv import load_dotenv

load_dotenv(override=True)

# ─── バージョン ─────────────────────────────────────
APP_VERSION = "1.0.0"

# ─── ディレクトリ設定 ───────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp")

# 起動時にディレクトリを作成
os.makedirs(TEMP_DIR, exist_ok=True)

# ─── サーバー設定 ────────────────────────────────────
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
PORT = int(os.getenv("PORT", "8000"))

# ─── フロントエンドURL（CORS用）─────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# ─── ファイル制限 ────────────────────────────────────
MAX_PDF_SIZE_MB = 50
MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024

# ─── ジョブ設定 ──────────────────────────────────────
JOB_EXPIRY_MINUTES = 30
JOB_CLEANUP_INTERVAL_SECONDS = 60

# ─── Edge-TTS デフォルト設定 ─────────────────────────
DEFAULT_VOICE = "ja-JP-NanamiNeural"
DEFAULT_TTS_PROVIDER = "edge-tts"

# ─── AI デフォルト設定 ───────────────────────────────
GEMINI_MODEL = "models/gemini-2.5-flash"
OPENAI_MODEL = "gpt-4o"
