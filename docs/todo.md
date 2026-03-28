# Slide2Video ToDo リスト

## 3.1 公開直後（緊急・必須）

| # | タスク | 詳細 | 状態 |
|---|--------|------|------|
| T-01 | DNS 設定（サブドメイン） | ドメインレジストラでサブドメインのAレコードをVPS IPに向ける | ✅ 完了 |
| T-02 | SSL 証明書（Let's Encrypt） | `certbot --nginx` で HTTPS 化 | ✅ 完了 |
| T-03 | `.env` 本番設定 | `FRONTEND_URL` を本番URLに変更 | ✅ 完了 |
| T-04 | page.tsx の ElevenLabs useEffect 修正 | `/voices` エンドポイント取得の useEffect が欠落 → 追加 | 🔲 未着手 |

## 3.2 運用基盤（1週間以内）

| # | タスク | 詳細 | 状態 |
|---|--------|------|------|
| T-05 | Google Analytics 導入 | `NEXT_PUBLIC_GA_ID` 環境変数方式で GA4 スクリプトを追加 | ✅ 完了 |
| T-06 | VPS デプロイ手順の文書化 | `git pull` → `npm run build` → `systemctl restart slide2video` の手順を記載 | 🔲 未着手 |
| T-07 | 自動デプロイスクリプト作成 | `deploy.sh`（pull, install, build, restart を一括実行）を作成 | 🔲 未着手 |
| T-08 | ログローテーション設定 | `/etc/systemd/journald.conf` で `SystemMaxUse=500M` 等 | 🔲 未着手 |
| T-09 | 一時ファイル自動削除 | cron で24時間経過分を削除 | 🔲 未着手 |
| T-20 | フッターに GitHub リンク追加 | フッターに GitHub リポジトリへのリンクを表示 | ✅ 完了 |
| T-21 | フッターに MIT License 表記 | フッターに「MIT License」と記載し LICENSE ファイルにリンク | ✅ 完了 |
| T-22 | README.md に Live Demo URL 追加 | README 冒頭に公開サイトURL記載 + GitHub About に Website URL 設定 | ✅ 完了 |

## 3.3 機能改善（2〜4週間）

| # | タスク | 詳細 | 状態 |
|---|--------|------|------|
| T-10 | 動画生成キャンセル機能（F-10） | 処理中ジョブの中断 + 一時ファイルクリーンアップ | 🔲 未着手 |
| T-11 | ページ離脱対策（F-11） | beforeunload 警告 → job_id localStorage 保存 → リロード後復帰 | 🔲 未着手 |
| T-12 | AIモデル自動更新機構（F-17） | `models.json` 外部定義 + `/api/models` エンドポイント + ホットリロード | 🔲 未着手 |
| T-13 | 台本手動編集 Studio 機能（F-18） | AI生成台本を編集してから音声合成を実行 | 🔲 未着手 |

## 3.4 将来拡張（Phase C 以降）

| # | タスク | 詳細 | 状態 |
|---|--------|------|------|
| T-14 | ボイスクローン（F-16） | Qwen3-TTS-VC / DashScope API でユーザー音声の複製 | 🔲 未着手 |
| T-15 | YouTube アップロード（F-12） | OAuth 2.0 連携で直接アップロード | 🔲 未着手 |
| T-16 | PPTX 対応（F-19） | PowerPoint ファイル直接アップロード | 🔲 未着手 |
| T-17 | BGM 追加（F-20） | FFmpeg で BGM ミキシング（音量バランス自動調整） | 🔲 未着手 |
| T-18 | Docker 化 | Dockerfile 作成。Cloud Run 移行への準備 | 🔲 未着手 |
| T-19 | Cloud Run + GCS 移行 | 一時ファイル → GCS、ジョブ管理 → Redis/Firestore | 🔲 未着手 |
| T-23 | PDF英語化 Step1（F-22） | PyMuPDF でテキストレイヤー抽出 → AI翻訳 → PDF書き戻しのプロトタイプ実装 | 🔲 未着手 |
| T-24 | PDF英語化 Step2（F-22） | 画像内テキストのOCR検出 + OpenCV簡易インペインティング対応 | 🔲 未着手 |
| T-25 | PDF英語化 Step3（F-22） | LaMa（IOPaint）による高品質インペインティング対応 | 🔲 未着手 |

## 3.5 完了済み

| # | タスク | 完了日 |
|---|--------|--------|
| ✅ | Edge-TTS 音声リスト修正（Azure専用音声を除外） | 2026-03-25 |
| ✅ | ElevenLabs premade 音声のみ無料表示 | 2026-03-25 |
| ✅ | OpenRouter モデルを Vision 対応のみに限定 | 2026-03-25 |
| ✅ | ElevenLabs SDK → httpx 化（402エラー対応） | 2026-03-25 |
| ✅ | LICENSE（MIT）作成 | 2026-03-25 |
| ✅ | README.md（英語）/ README.ja.md（日本語）作成 | 2026-03-25 |
| ✅ | 利用規約に TTS プロバイダー追記 | 2026-03-25 |
| ✅ | CORS ngrok URL 削除 | 2026-03-25 |
| ✅ | config.py 余分コード削除 | 2026-03-25 |
| ✅ | ConoHa VPS 契約・初期セットアップ | 2026-03-25 |
| ✅ | Nginx + バックエンド systemd 設定 | 2026-03-25 |
| ✅ | UFW ファイアウォール開放（80/443） | 2026-03-25 |
| ✅ | HTTP でのアプリ表示確認 | 2026-03-25 |
| ✅ | SSL証明書取得（slide2video.valueupdate.jp/.co.jp/.net） | 2026-03-28 |
| ✅ | 英語UI対応（i18n 全文字列英語化） | 2026-03-28 |
| ✅ | Google Analytics 導入（GA4 + カスタムイベント） | 2026-03-28 |
