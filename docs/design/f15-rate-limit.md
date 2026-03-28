# F-15 レート制限案内リンク設計

## 概要

AIプロバイダー選択時に、該当プロバイダーのレート制限・利用状況確認ページへの
リンクを SettingsForm 内に表示する。
ユーザーが自身の無料枠・レート制限を事前に把握し、生成回数の見通しを立てられるようにする。

---

## 表示場所

APIキー入力欄の直下（補足テキストの次）

---

## プロバイダー別表示内容

| プロバイダー | 表示テキスト | リンク先 |
|------------|------------|---------|
| Gemini | 無料枠のレート制限はプロジェクトにより異なります。 | https://aistudio.google.com/rate-limit |
| OpenRouter | 利用状況と制限は OpenRouter ダッシュボードで確認できます。 | https://openrouter.ai/activity |
| OpenAI | 利用状況は OpenAI ダッシュボードで確認できます。 | https://platform.openai.com/usage |

---

## 多言語対応

UI言語（ja/en）に応じて表示テキストを切り替える。
翻訳キーは `frontend/src/lib/i18n.ts` で管理。

| キー | 日本語 | 英語 |
|-----|--------|------|
| `geminiRateLimit` | 無料枠のレート制限はプロジェクトにより異なります。 | Free tier rate limits vary by project. |
| `geminiRateLimitLink` | AI Studio で確認 ↗ | Check on AI Studio ↗ |
| `openrouterUsage` | 利用状況と制限は OpenRouter ダッシュボードで確認できます。 | View usage and limits on the OpenRouter dashboard. |
| `openrouterUsageLink` | OpenRouter Activity で確認 ↗ | Check on OpenRouter Activity ↗ |
| `openaiUsage` | 利用状況は OpenAI ダッシュボードで確認できます。 | View usage on the OpenAI dashboard. |
| `openaiUsageLink` | Usage で確認 ↗ | Check on Usage ↗ |

---

## 実装箇所

`frontend/src/components/SettingsForm.tsx`
`frontend/src/lib/i18n.ts`

## 状態

✅ 実装済み（2026-03-28）
