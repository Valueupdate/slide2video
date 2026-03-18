# Slide2Video

PDFスライドからナレーション付きプレゼンテーション動画を自動生成するWebサービスです。

---

## 概要

スライドPDFをアップロードするだけで、AIが各スライドのナレーション台本を自動生成し、音声合成と動画レンダリングを経てMP4動画を出力します。APIキーはリクエスト時のみ使用され、サーバーに保存されません。

### 処理フロー

    PDF アップロード → AI 台本生成 → 音声合成 → 動画レンダリング → MP4 ダウンロード

### 主な特徴

- **一気通貫**: PDFを送るだけで動画が完成。コマンド操作やツール切り替え不要
- **AI台本生成**: Google Gemini または OpenAI がスライド内容から自然なナレーションを作成
- **無料TTS対応**: Edge-TTS（Microsoft製・無料）をデフォルト搭載。OpenAI TTSも選択可
- **セキュア**: ユーザーのAPIキーはサーバーに保存しない。生成ファイルは30分で自動削除
- **リアルタイム進捗**: SSEによるリアルタイム進捗表示

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| バックエンド | Python 3.10+, FastAPI, Uvicorn |
| PDF解析 | PyMuPDF (fitz) |
| AI台本生成 | Google Gemini API / OpenAI API |
| 音声合成 | Edge-TTS（無料） / OpenAI TTS（有料） |
| 動画生成 | FFmpeg |
| 通信 | Server-Sent Events (SSE) |

---

## 必要な環境

- Python 3.10 以上
- Node.js 18 以上
- FFmpeg 6.x 以上
- Google Gemini API キー または OpenAI API キー

---

## セットアップ

### 1. リポジトリのクローン

    git clone https://github.com/Valueupdate/slide2video.git
    cd slide2video

### 2. バックエンド

    cd backend
    python -m venv venv
    venv\Scripts\activate        # Windows
    # source venv/bin/activate   # macOS / Linux
    pip install -r requirements.txt
    cp .env.example .env
    python -m uvicorn main:app --reload --port 8000

ヘルスチェック:

    curl http://localhost:8000/health
    # {"status": "ok", "version": "1.0.0"}

### 3. フロントエンド

    cd frontend
    npm install
    cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
    npm run dev

ブラウザで http://localhost:3000 にアクセスしてください。

---

## 使い方

1. ブラウザで http://localhost:3000 を開く
2. **AI プロバイダー**（Gemini / OpenAI）を選択し、APIキーを入力
3. 必要に応じて**音声合成エンジン**と**話者**を選択
4. PDFファイルをドラッグ＆ドロップ、またはクリックしてアップロード
5. 「**動画を生成する**」ボタンをクリック
6. 進捗バーとログがリアルタイムで表示される
7. 完了後「**動画をダウンロード**」ボタンからMP4を取得

ダウンロードリンクは生成後 **約30分間** 有効です。

---

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/health` | ヘルスチェック |
| POST | `/generate` | PDF送信 → 動画生成ジョブ開始 |
| GET | `/progress/{job_id}` | SSEで進捗をリアルタイム配信 |
| GET | `/download/{job_id}` | 生成された動画をダウンロード |

詳細は [docs/api-spec.md](docs/api-spec.md) を参照してください。

---

## ディレクトリ構成

    slide2video/
    ├── README.md
    ├── REQUIREMENTS.md
    ├── SETUP.md
    ├── .gitignore
    ├── backend/
    │   ├── main.py              # FastAPI エントリーポイント
    │   ├── config.py            # アプリ設定
    │   ├── requirements.txt
    │   ├── .env.example
    │   └── services/
    │       ├── ai_service.py    # AI台本生成
    │       ├── pdf_service.py   # PDF解析
    │       ├── tts_service.py   # 音声合成
    │       ├── video_service.py # 動画生成
    │       └── job_manager.py   # ジョブ管理
    ├── frontend/
    │   ├── src/
    │   │   ├── app/             # Next.js App Router
    │   │   └── components/      # UIコンポーネント
    │   ├── package.json
    │   └── .env.example
    └── docs/
        ├── architecture.md      # システム構成
        ├── api-spec.md          # API仕様
        └── ui-spec.md           # UI設計

---

## ライセンス

Private repository. All rights reserved.
