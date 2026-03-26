[🇯🇵 日本語版はこちら](README.ja.md)

# Slide2Video

**Give voice to your slides, bring life to your PDFs.**

🎬 **[Try Live Demo → slide2video.valueupdate.jp](https://slide2video.valueupdate.jp)**

A web application that automatically generates AI-narrated presentation videos from PDF files.

## Features

- **PDF → Video conversion**: Upload a PDF and AI generates narration scripts, synthesizes speech, and creates a video
- **Multiple AI providers**: Google Gemini (free tier available), OpenAI, and various models via OpenRouter
- **6 TTS engines**: Edge-TTS (free), OpenAI TTS, ElevenLabs, Azure Speech, Google Cloud TTS, Voice Clone (DashScope)
- **Multi-language**: Japanese, English, Chinese, Korean, French, Spanish, German, Portuguese
- **Aspect ratio options**: Landscape 16:9 (YouTube), Portrait 9:16 (Shorts/TikTok), Square 1:1 (Instagram)
- **Privacy-first**: API keys are never stored on the server; generated videos are auto-deleted after 30 minutes

## Prerequisites

- **Python 3.12+**
- **Node.js 18+**
- **AI API Key** (one of the following):
  - [Google Gemini](https://aistudio.google.com/apikey) (recommended, free tier available)
  - [OpenAI](https://platform.openai.com/api-keys)
  - [OpenRouter](https://openrouter.ai/keys)

## Setup

### 1. Clone the repository

    git clone https://github.com/your-username/slide2video.git
    cd slide2video

### 2. Backend setup

    cd backend
    python -m venv venv

    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate

    pip install -r requirements.txt

### 3. Build the frontend

    cd frontend
    npm install
    npm run build

### 4. Run

    cd backend
    python -m uvicorn main:app --host 0.0.0.0 --port 8000

Open http://localhost:8000 in your browser.

## Environment Variables (Optional)

Create `backend/.env` with the following:

    # Frontend URL (for CORS)
    FRONTEND_URL=http://localhost:3000

    # Additional CORS origins (comma-separated, for ngrok, custom domains, etc.)
    # EXTRA_CORS_ORIGINS=https://your-app.ngrok-free.dev,https://your-domain.com

    # RunPod (pro voice actors, optional)
    RUNPOD_ENDPOINT_URL=
    RUNPOD_API_KEY=

### Deploying with ngrok

If you expose the backend via ngrok or a similar tunnel service, add the public URL to `EXTRA_CORS_ORIGINS` in `backend/.env`:

    EXTRA_CORS_ORIGINS=https://your-subdomain.ngrok-free.dev

No code changes are required — all deployment-specific URLs are managed through environment variables.

## TTS Provider Comparison

| Provider | Cost | Quality | API Key |
|---|---|---|---|
| Edge-TTS | Free | ★★★☆ | Not required |
| OpenAI TTS | Paid | ★★★★ | Required |
| ElevenLabs | Free tier 10k chars/mo | ★★★★★ | Required |
| Azure Speech | Free tier 500k chars/mo | ★★★★ | Required |
| Google Cloud TTS | Free tier 4M chars/mo | ★★★★ | Required |
| Voice Clone | DashScope free tier | ★★★☆ | Required |

## Tech Stack

**Backend**: Python / FastAPI / edge-tts / FFmpeg

**Frontend**: Next.js / TypeScript / Tailwind CSS / shadcn/ui

**AI**: Google Gemini / OpenAI / OpenRouter (image → script generation)

## License

[MIT License](LICENSE)

## Disclaimer

- Users are responsible for the copyright of uploaded PDFs
- Accuracy of AI-generated content is not guaranteed
- Please comply with each AI provider's terms of service
- See the Terms of Service page within the application for details
