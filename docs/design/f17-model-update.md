# F-17 AIモデル自動更新機構設計

## 概要

LLM/TTSモデルは頻繁にアップデートされ、古いモデルIDが廃止されると動作不能になる。
モデル一覧を外部定義ファイルで管理し、コード変更・再デプロイなしで更新できる仕組みを構築する。

---

## 課題

- 現在はモデル一覧が `SettingsForm.tsx` にハードコードされている
- モデルID廃止時にフロントエンドのコード修正 → ビルド → デプロイが必要
- 新モデル追加のたびに開発者の作業が発生する

---

## 設計方針

- モデル一覧を `models.json` 等の外部定義ファイルで管理
- バックエンドは `/api/models` エンドポイントでフロントエンドに選択肢を提供
- フロントエンドはハードコードせず、APIから動的に取得
- `models.json` 更新時にバックエンド再起動なしで反映（ホットリロード）

---

## models.json 構成例

```json
{
  "ai_providers": {
    "gemini": {
      "models": [
        {"id": "gemini-2.5-flash", "label": "Gemini 2.5 Flash ⭐ おすすめ", "default": true},
        {"id": "gemini-2.5-pro", "label": "Gemini 2.5 Pro", "default": false}
      ]
    },
    "openai": {
      "models": [
        {"id": "gpt-4o", "label": "GPT-4o", "default": true},
        {"id": "gpt-4o-mini", "label": "GPT-4o mini", "default": false}
      ]
    },
    "openrouter": {
      "models": [
        {"id": "google/gemini-2.5-flash", "label": "Gemini 2.5 Flash (Google)", "default": true},
        {"id": "anthropic/claude-sonnet-4", "label": "Claude Sonnet 4 (Anthropic)", "default": false}
      ]
    }
  },
  "tts_providers": {
    "edge-tts": {
      "voices": [
        {"id": "ja-JP-NanamiNeural", "label": "Nanami（女性）", "default": true},
        {"id": "ja-JP-KeitaNeural", "label": "Keita（男性）", "default": false}
      ]
    },
    "openai": {
      "voices": [
        {"id": "alloy", "label": "Alloy（中性的）", "default": true},
        {"id": "nova", "label": "Nova（女性）", "default": false}
      ]
    },
    "qwen-clone": {
      "voices": []
    }
  }
}


# APIエンドポイント設計

GET /api/models
モデル一覧を返却する。

# レスポンス例:

{
  "ai_providers": { ... },
  "tts_providers": { ... },
  "updated_at": "2026-03-28T00:00:00Z"
}

# ホットリロード実装方針

models.json のファイル更新日時を定期チェック（例: 60秒ごと）し、 変更があれば自動的に再読み込みする。 バックエンド再起動不要で即時反映される。

# フロントエンド実装方針

アプリ起動時に /api/models を fetch してモデル一覧を取得
取得失敗時はハードコードされたフォールバック値を使用
useEffect で初回マウント時に取得、useState で保持

# 実装箇所
ファイル	変更内容
backend/models.json	モデル一覧の外部定義ファイル（新規作成）
backend/main.py	/api/models エンドポイント追加
backend/services/model_service.py	models.json 読み込み・ホットリロード処理（新規作成）
frontend/src/app/page.tsx	起動時に /api/models を fetch
frontend/src/components/SettingsForm.tsx	ハードコードのモデル一覧を props 経由に変更

# 関連ToDo
ToDo	内容
T-12	models.json 外部定義 + /api/models エンドポイント + ホットリロード

# 状態
🔲 未着手
