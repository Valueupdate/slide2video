[🇺🇸 English version](README.md)

# Slide2Video

**スライドに声を、PDFに命を。**

🎬 **[ライブデモを試す → slide2video.valueupdate.net](https://slide2video.valueupdate.net)**

PDFプレゼンテーションからAIナレーション付き動画を自動生成するWebアプリケーションです。

## 特徴

- **PDF → 動画の自動変換**: PDFをアップロードするだけで、AIがナレーション台本を生成し、音声合成して動画を作成
- **複数のAIプロバイダー対応**: Google Gemini（無料枠あり）、OpenAI、OpenRouter経由で多数のモデルを利用可能
- **6種類の音声合成エンジン**: Edge-TTS（無料）、OpenAI TTS、ElevenLabs、Azure Speech、Google Cloud TTS、ボイスクローン（DashScope）
- **多言語対応**: 日本語・英語・中国語・韓国語・フランス語・スペイン語・ドイツ語・ポルトガル語
- **アスペクト比選択**: 横型16:9（YouTube）、縦型9:16（Shorts/TikTok）、正方形1:1（Instagram）
- **APIキーはサーバーに保存されません**: リクエスト時のみ使用し、生成した動画は30分後に自動削除

## 必要なもの

- **Python 3.12+**
- **Node.js 18+**
- **AI APIキー**（いずれか1つ）:
  - [Google Gemini](https://aistudio.google.com/apikey)（推奨・無料枠あり）
  - [OpenAI](https://platform.openai.com/api-keys)
  - [OpenRouter](https://openrouter.ai/keys)

## セットアップ

### 1. リポジトリのクローン

    git clone https://github.com/your-username/slide2video.git
    cd slide2video

### 2. バックエンドのセットアップ

    cd backend
    python -m venv venv

    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate

    pip install -r requirements.txt

### 3. フロントエンドのビルド

    cd frontend
    npm install
    npm run build

### 4. 起動

    cd backend
    python -m uvicorn main:app --host 0.0.0.0 --port 8000

ブラウザで http://localhost:8000 を開いてください。

## 環境変数（オプション）

backend/.env に以下を設定できます：

    # フロントエンドのURL（CORS用）
    FRONTEND_URL=http://localhost:3000

    # 追加の CORS 許可オリジン（カンマ区切り、ngrok やカスタムドメイン等）
    # EXTRA_CORS_ORIGINS=https://your-app.ngrok-free.dev,https://your-domain.com

    # RunPod（プロ声優ボイス・オプション）
    RUNPOD_ENDPOINT_URL=
    RUNPOD_API_KEY=

### ngrok でのデプロイ

ngrok 等のトンネルサービスでバックエンドを公開する場合、公開 URL を `backend/.env` の `EXTRA_CORS_ORIGINS` に追加してください：

    EXTRA_CORS_ORIGINS=https://your-subdomain.ngrok-free.dev

コードの変更は不要です。デプロイ固有の URL はすべて環境変数で管理されます。

## TTS プロバイダー比較

| プロバイダー | 費用 | 品質 | APIキー |
|---|---|---|---|
| Edge-TTS | 無料 | ★★★☆ | 不要 |
| OpenAI TTS | 有料 | ★★★★ | 必要 |
| ElevenLabs | 無料枠10k文字/月 | ★★★★★ | 必要 |
| Azure Speech | 無料枠50万文字/月 | ★★★★ | 必要 |
| Google Cloud TTS | 無料枠400万文字/月 | ★★★★ | 必要 |
| ボイスクローン | DashScope無料枠 | ★★★☆ | 必要 |

## 技術スタック

**バックエンド**: Python / FastAPI / edge-tts / FFmpeg

**フロントエンド**: Next.js / TypeScript / Tailwind CSS / shadcn/ui

**AI**: Google Gemini / OpenAI / OpenRouter（画像→台本生成）

## ライセンス

[MIT License](LICENSE)

## 注意事項

- アップロードするPDFの著作権はユーザーの責任です
- AI生成コンテンツの正確性は保証されません
- 各AIプロバイダーの利用規約に従ってください
- 詳細はアプリケーション内の利用規約ページをご確認ください
