# PDF→プレゼン動画 自動生成サービス 要件定義書

## 1. プロジェクト概要

### 1.1 サービス名（仮）
**Slide2Video**

### 1.2 コンセプト
スライドPDFファイルをアップロードするだけで、AIが台本を生成し、
音声合成と合成して、プレゼンテーション動画（MP4）を自動生成するWebサービス。

### 1.3 ターゲットユーザー
- 自分のAI APIキーを持っている個人・開発者
- スライド資料から手軽に解説動画を作りたい人

---

## 2. 機能要件

### 2.1 基本フロー（一気通貫型）

1. ユーザーがPDFアップロード + APIキー入力
2. フロントエンド（Cloudflare Pages）からバックエンド（VPS）へ送信
3. バックエンドで以下を順次実行:
   - PDF → ページ画像に変換（PyMuPDF）
   - 画像/テキスト → AI台本生成（Gemini / OpenAI）
   - 台本 → 音声合成（Edge-TTS 無料 / OpenAI TTS 有料）
   - 画像 + 音声 → 動画合成（FFmpeg）
4. 完成動画URLを返却
5. ユーザーがブラウザでダウンロード

### 2.2 フェーズ1（MVP）の機能一覧

| # | 機能 | 詳細 |
|---|------|------|
| F-01 | PDFアップロード | ブラウザからPDFファイルを選択して送信 |
| F-02 | APIキー入力 | Gemini or OpenAI のAPIキーをフォームから入力（サーバー保存しない） |
| F-03 | AI台本自動生成 | 各スライドのテキスト+画像をAIに送り台本を生成 |
| F-04 | 音声合成 | Edge-TTS（無料・高品質）をデフォルト、OpenAI TTSをオプション |
| F-05 | 動画生成 | スライド画像+音声を合成しMP4を生成 |
| F-06 | 進捗表示 | SSEで処理進捗をリアルタイム表示 |
| F-07 | 動画ダウンロード | 完成した動画をブラウザからダウンロード |

### 2.3 フェーズ2（将来拡張）で検討する機能

| # | 機能 |
|---|------|
| F-08 | 台本の手動編集（Studio機能） |
| F-09 | PPTX対応 |
| F-10 | ボイス選択（複数話者） |
| F-11 | BGM追加 |
| F-12 | ユーザー認証・履歴管理 |

---

## 3. 非機能要件

### 3.1 セキュリティ
- ユーザーのAPIキーはサーバーに保存しない（リクエストヘッダーで受け渡し、処理完了後に破棄）
- アップロードされたPDF・生成ファイルは処理完了後に一定時間（30分）で自動削除
- HTTPS必須

### 3.2 パフォーマンス
- 10スライド程度のPDFで5分以内に動画生成完了を目標
- 同時処理数: 初期は1〜2件（VPSスペックに依存）

### 3.3 可用性
- 個人サービスのため99%以上のSLAは不要
- VPS再起動時にsystemdで自動復旧

---

## 4. システム構成

詳細は [docs/architecture.md](docs/architecture.md) を参照。

---

## 5. API設計

詳細は [docs/api-spec.md](docs/api-spec.md) を参照。

---

## 6. 画面設計

詳細は [docs/ui-spec.md](docs/ui-spec.md) を参照。

---

## 7. ディレクトリ構成

    slide2video/
    ├── README.md
    ├── REQUIREMENTS.md          # この要件定義書
    ├── ISSUE.md                 # 課題管理
    │
    ├── docs/                    # 設計ドキュメント
    │   ├── architecture.md      # システム構成・技術スタック
    │   ├── api-spec.md          # API設計
    │   └── ui-spec.md           # 画面設計
    │
    ├── backend/                 # FastAPI バックエンド
    │   ├── main.py              # エントリーポイント + APIルーティング
    │   ├── config.py            # 設定管理
    │   ├── requirements.txt     # Python依存関係
    │   ├── .env.example         # 環境変数テンプレート
    │   ├── services/            # ビジネスロジック
    │   │   ├── pdf_service.py   # PDF解析（PyMuPDF）
    │   │   ├── ai_service.py    # AI台本生成（Gemini/OpenAI）
    │   │   ├── tts_service.py   # 音声合成（Edge-TTS/OpenAI TTS）
    │   │   ├── video_service.py # 動画生成（FFmpeg）
    │   │   └── job_manager.py   # ジョブ管理・進捗追跡
    │   └── temp/                # 一時ファイル（自動削除）
    │
    ├── frontend/                # Next.js フロントエンド
    │   ├── src/
    │   │   ├── app/
    │   │   │   ├── layout.tsx   # 共通レイアウト
    │   │   │   └── page.tsx     # メインページ（1画面完結）
    │   │   ├── components/
    │   │   │   ├── UploadForm.tsx
    │   │   │   ├── SettingsForm.tsx
    │   │   │   ├── ProgressView.tsx
    │   │   │   └── DownloadView.tsx
    │   │   └── lib/
    │   │       └── api.ts       # APIクライアント
    │   ├── package.json
    │   └── next.config.ts       # 静的エクスポート設定
    │
    └── deploy/                  # デプロイ関連
        ├── nginx.conf           # Nginx設定
        └── slide2video.service  # systemdユニットファイル

---

## 8. 開発ロードマップ

### Phase 1: バックエンドMVP
1. FastAPI基盤構築（ヘルスチェック、CORS）
2. PDF解析サービス（PyMuPDF）
3. AI台本生成サービス（Gemini対応のみ先行）
4. Edge-TTS音声合成サービス
5. FFmpeg動画生成サービス
6. ジョブ管理 + SSE進捗配信
7. 一時ファイル自動クリーンアップ

### Phase 2: フロントエンドMVP
1. 1画面UIの構築
2. PDFアップロード + 設定フォーム
3. SSE進捗表示
4. ダウンロード機能

### Phase 3: 結合・デプロイ
1. ローカルでのE2E動作確認
2. VPSセットアップ（Nginx + SSL）
3. Cloudflare Pagesへフロントデプロイ
4. 本番E2Eテスト

### Phase 4: 品質向上
1. OpenAI対応追加
2. OpenAI TTS対応
3. エラーハンドリング強化
4. レート制限対応

---

## 9. 既存プロジェクトからの流用判断

| コンポーネント | 判断 | 理由 |
|-------------|------|------|
| PDF解析 (processor.py) | ✅ 流用可 | PyMuPDF部分はそのまま使える |
| AI台本生成 (ai_gemini_provider.py) | ✅ 流用可 | レート制限・リトライロジックが実装済み |
| AI台本生成 (ai_openai_provider.py) | ⚠️ 要改修 | max_tokens等の修正が必要 |
| TTS (tts_service.py) | ❌ 書き直し | Edge-TTS中心に再設計 |
| 動画生成 (video_service.py) | ⚠️ 要改修 | moviepy→FFmpeg直接呼び出しに変更 |
| PPTXレンダラー | ❌ 不要 | Phase1はPDFのみ |
| フロントエンド全体 | ❌ 書き直し | 1画面完結型に簡素化 |
| shadcn/ui コンポーネント | ✅ 流用可 | UIパーツはそのまま使える |
