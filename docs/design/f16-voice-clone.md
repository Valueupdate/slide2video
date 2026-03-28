# F-16 ボイスクローン設計（Qwen3-TTS-VC）

## 概要

ユーザーの音声サンプル（10〜20秒）からAIが声を複製し、
ナレーションに使用できる機能。
自分の声でプレゼン動画を作成したい場合に有用。

---

## 実装方式の比較

| 方式 | 実装 | コスト | 備考 |
|------|------|--------|------|
| A: DashScope API（Alibaba Cloud） | REST API で voice enrollment → synthesis | ボイス作成 $0.01 + 合成は従量課金 | 最も簡単。推奨プロトタイプ |
| B: ローカル実行（HuggingFace モデル） | Qwen3-TTS-12Hz-1.7B-CustomVoice をサーバーで推論 | GPU サーバー費用のみ（≥4GB VRAM） | API費用ゼロだがインフラ要件高 |
| C: セルフホスト API | 方式Bをコンテナ化して Cloud Run GPU 等で提供 | GPU インスタンス費用 | スケーラブルだが設計が複雑 |

**推奨:** Phase B で方式A（DashScope API）をプロトタイプ実装。Phase C で方式B へ移行検討。

---

## 処理フロー（方式A）

ユーザーが音声サンプルをアップロード → DashScope API に voice enrollment リクエスト → voice_id を取得・保存 → 台本テキストと voice_id で synthesis リクエスト → 音声ファイルを返却 → FFmpeg で動画合成


---

## 音声サンプル要件

| 項目 | 要件 |
|------|------|
| 形式 | WAV / MP3 / M4A |
| 長さ | 10〜20秒推奨（最低3秒） |
| 品質 | 24kHz以上、モノラル推奨 |
| 環境 | 雑音の少ない静かな環境で録音 |
| 言語 | 日本語 / 英語 / 中国語 / 韓国語 / フランス語 ほか対応 |

---

## DashScope API キー取得手順

1. [Alibaba Cloud Model Studio](https://modelstudio.console.alibabacloud.com) を開く
2. Alibaba Cloud アカウントでログイン（無料登録可）
3. 「Create API Key」をクリックしてコピー

---

## 法的留意点

- 他人の声（声優等）を使用する場合、本人の明示的な同意・ライセンス契約が必須
- 自分の声のみ使用することを利用規約に明記する必要あり

---

## 関連ToDo

| ToDo | 内容 |
|------|------|
| T-14 | Qwen3-TTS-VC / DashScope API でユーザー音声の複製 |

---

## 実装箇所

`backend/services/tts_service.py` に qwen-clone プロバイダーを追加。
`frontend/src/components/SettingsForm.tsx` にボイスクローン設定UIを追加。

## 状態

✅ UI実装済み（2026-03-25）
🔲 バックエンド本番実装未着手