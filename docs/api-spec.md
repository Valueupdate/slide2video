# API設計

## 1. エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /health | ヘルスチェック |
| POST | /generate | 動画生成（メインエンドポイント） |
| GET | /progress/{job_id} | 進捗取得（SSE） |
| GET | /download/{job_id} | 動画ダウンロード |

---

## 2. ヘルスチェック

**GET /health**

レスポンス:

    {
      "status": "ok",
      "version": "1.0.0"
    }

---

## 3. 動画生成

**POST /generate**

リクエスト:
- Content-Type: multipart/form-data
- file: PDFファイル（必須）
- ヘッダー:
  - X-AI-Provider: gemini または openai（必須）
  - X-API-Key: ユーザーのAI APIキー（必須）
- フォームフィールド:
  - voice: 音声モデル名（任意、デフォルト: ja-JP-NanamiNeural）
  - tts_provider: edge-tts または openai（任意、デフォルト: edge-tts）

レスポンス（200 OK）:

    {
      "job_id": "abc123def456",
      "status": "processing",
      "message": "動画生成を開始しました"
    }

エラーレスポンス（400 Bad Request）:

    {
      "detail": "PDFファイルのみアップロード可能です"
    }

エラーレスポンス（422 Unprocessable Entity）:

    {
      "detail": "AIプロバイダとAPIキーは必須です"
    }

---

## 4. 進捗取得（SSE）

**GET /progress/{job_id}**

Content-Type: text/event-stream

SSEイベント例:

    data: {"step": "pdf_parse", "progress": 10, "message": "PDF解析中... (5ページ検出)"}

    data: {"step": "script_gen", "progress": 25, "message": "スライド 1/5 の台本生成中..."}

    data: {"step": "script_gen", "progress": 35, "message": "スライド 2/5 の台本生成中..."}

    data: {"step": "script_gen", "progress": 50, "message": "スライド 5/5 の台本生成完了"}

    data: {"step": "tts", "progress": 60, "message": "スライド 2/5 の音声生成中..."}

    data: {"step": "tts", "progress": 80, "message": "音声生成完了"}

    data: {"step": "video_render", "progress": 90, "message": "動画レンダリング中..."}

    data: {"step": "done", "progress": 100, "download_url": "/download/abc123def456"}

エラー時:

    data: {"step": "error", "progress": -1, "message": "AI API呼び出しに失敗しました: 429 Rate Limit"}

ジョブが見つからない場合（404）:

    data: {"step": "error", "progress": -1, "message": "ジョブが見つかりません"}

---

## 5. 動画ダウンロード

**GET /download/{job_id}**

成功時:
- Content-Type: video/mp4
- Content-Disposition: attachment; filename="slide2video_abc123.mp4"
- （MP4バイナリデータ）

エラー（404 Not Found）:

    {
      "detail": "動画が見つかりません。有効期限が切れた可能性があります。"
    }

---

## 6. 共通仕様

### 6.1 APIキーの取り扱い
- リクエストヘッダー（X-API-Key）でのみ受け渡し
- サーバー側ではメモリ上でのみ使用し、ログ・DB・ファイルに一切保存しない
- 処理完了後にPython側で参照を破棄

### 6.2 ファイルサイズ制限
- PDFファイル: 最大50MB
- 生成動画: サイズ制限なし（スライド数に依存）

### 6.3 CORS
- フロントエンドのドメインのみ許可
- 開発時は localhost:3000 を追加許可

### 6.4 レート制限
- 同一IPから同時に処理できるジョブ数: 1件
- 1時間あたりのジョブ数上限: 10件（初期設定）
