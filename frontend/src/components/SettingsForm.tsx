"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const DASHSCOPE_KEY_GUIDE = {
  url: "https://modelstudio.console.alibabacloud.com/?tab=playground#/api-key",
  label: "Alibaba Cloud Model Studio でキーを作成",
  steps: [
    "上のリンクから Alibaba Cloud Model Studio を開く",
    "Alibaba Cloud アカウントでログイン（無料登録可）",
    "「Create API Key」をクリックしてコピー",
  ],
};

const OUTPUT_LANGUAGE_OPTIONS = [
  { label: "原文のまま（自動判定）", value: "auto" },
  { label: "日本語", value: "ja" },
  { label: "English", value: "en" },
  { label: "中文（简体）", value: "zh-CN" },
  { label: "한국어", value: "ko" },
  { label: "Français", value: "fr" },
  { label: "Español", value: "es" },
  { label: "Deutsch", value: "de" },
  { label: "Português", value: "pt" },
];

interface SettingsFormProps {
  aiProvider: string;
  onAiProviderChange: (v: string) => void;
  apiKey: string;
  onApiKeyChange: (v: string) => void;
  aiModel: string;
  onAiModelChange: (v: string) => void;
  ttsProvider: string;
  onTtsProviderChange: (v: string) => void;
  voice: string;
  onVoiceChange: (v: string) => void;
  slideDuration: number;
  onSlideDurationChange: (v: number) => void;
  aspectRatio: string;
  onAspectRatioChange: (v: string) => void;
  outputLanguage: string;
  onOutputLanguageChange: (v: string) => void;
  dashscopeKey: string;
  onDashscopeKeyChange: (v: string) => void;
  voiceSample: File | null;
  onVoiceSampleChange: (v: File | null) => void;
  disabled: boolean;
}

const safeChange = (fn: (v: string) => void) => (v: string | null) => {
  if (v !== null) fn(v);
};

const SLIDE_DURATION_OPTIONS = [
  { label: "自動（AI台本に合わせる）", value: "0" },
  { label: "約15秒 / スライド", value: "15" },
  { label: "約30秒 / スライド", value: "30" },
  { label: "約45秒 / スライド", value: "45" },
  { label: "約60秒 / スライド", value: "60" },
];

const ASPECT_RATIO_OPTIONS = [
  { label: "横型 16:9（YouTube / PC）", value: "16:9" },
  { label: "縦型 9:16（Shorts / TikTok / Reels）", value: "9:16" },
  { label: "正方形 1:1（Instagram / SNS）", value: "1:1" },
];

const AI_PROVIDER_OPTIONS = [
  { label: "Google Gemini", value: "gemini" },
  { label: "OpenAI", value: "openai" },
  { label: "OpenRouter（複数モデル対応）", value: "openrouter" },
];

const OPENROUTER_MODELS = [
  { label: "Gemini 2.5 Flash（Google）", value: "google/gemini-2.5-flash" },
  { label: "Gemini 2.5 Pro（Google）", value: "google/gemini-2.5-pro" },
  { label: "Claude Sonnet 4（Anthropic）", value: "anthropic/claude-sonnet-4" },
  { label: "Claude Haiku 3.5（Anthropic）", value: "anthropic/claude-3.5-haiku" },
  { label: "GPT-4o（OpenAI）", value: "openai/gpt-4o" },
  { label: "GPT-4o mini（OpenAI）", value: "openai/gpt-4o-mini" },
  { label: "DeepSeek R1（DeepSeek）", value: "deepseek/deepseek-r1" },
  { label: "DeepSeek Chat V3（DeepSeek）", value: "deepseek/deepseek-chat" },
  { label: "Mistral Large（Mistral）", value: "mistralai/mistral-large" },
  { label: "Llama 3.1 70B（Meta）", value: "meta-llama/llama-3.1-70b-instruct" },
];

const TTS_PROVIDER_OPTIONS = [
  { label: "Edge-TTS（無料）", value: "edge-tts" },
  { label: "OpenAI TTS（有料・高品質）", value: "openai" },
  { label: "ボイスクローン（自分の声で読み上げ）", value: "qwen-clone" },
];

const VOICE_OPTIONS: Record<string, { label: string; value: string }[]> = {
  "edge-tts": [
    { label: "Nanami（女性・落ち着き）", value: "ja-JP-NanamiNeural" },
    { label: "Keita（男性・標準）", value: "ja-JP-KeitaNeural" },
  ],
  openai: [
    { label: "Alloy（中性的）", value: "alloy" },
    { label: "Nova（女性）", value: "nova" },
    { label: "Onyx（男性）", value: "onyx" },
    { label: "Shimmer（女性・柔らか）", value: "shimmer" },
  ],
};

const API_KEY_GUIDES: Record<string, { url: string; label: string; steps: string[] }> = {
  gemini: {
    url: "https://aistudio.google.com/apikey",
    label: "Google AI Studio でキーを作成",
    steps: [
      "上のリンクから Google AI Studio を開く",
      "Google アカウントでログイン",
      "「APIキーを作成」をクリックしてコピー",
    ],
  },
  openai: {
    url: "https://platform.openai.com/api-keys",
    label: "OpenAI ダッシュボードでキーを作成",
    steps: [
      "上のリンクから OpenAI のダッシュボードを開く",
      "アカウント作成後「+ Create new secret key」をクリック",
      "表示されたキーをコピー（クレジット購入が必要です）",
    ],
  },
  openrouter: {
    url: "https://openrouter.ai/keys",
    label: "OpenRouter でキーを作成",
    steps: [
      "上のリンクから OpenRouter を開く",
      "Google / GitHub アカウントでサインアップ",
      "「Create Key」をクリックしてコピー（無料クレジットあり）",
    ],
  },
};

/** value から対応するラベルを取得するヘルパー */
function findLabel(options: { label: string; value: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function SettingsForm({
  aiProvider,
  onAiProviderChange,
  apiKey,
  onApiKeyChange,
  aiModel,
  onAiModelChange,
  ttsProvider,
  onTtsProviderChange,
  voice,
  onVoiceChange,
  slideDuration,
  onSlideDurationChange,
  aspectRatio,
  onAspectRatioChange,
  outputLanguage,
  onOutputLanguageChange,
  dashscopeKey,
  onDashscopeKeyChange,
  voiceSample,
  onVoiceSampleChange,
  disabled,
}: SettingsFormProps) {
  const [showKey, setShowKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showDashscopeKey, setShowDashscopeKey] = useState(false);
  const [showDashscopeGuide, setShowDashscopeGuide] = useState(false);

  const voices = VOICE_OPTIONS[ttsProvider] || VOICE_OPTIONS["edge-tts"];
  const guide = API_KEY_GUIDES[aiProvider];

  return (
    <Card className="p-5 space-y-4">
      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">設定</h2>

      {/* ── AI プロバイダー ── */}
      <div className="space-y-2">
        <Label>AI プロバイダー</Label>
        <Select value={aiProvider} onValueChange={safeChange(onAiProviderChange)} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue>{findLabel(AI_PROVIDER_OPTIONS, aiProvider)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {AI_PROVIDER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── OpenRouter モデル選択 ── */}
      {aiProvider === "openrouter" && (
        <div className="space-y-2">
          <Label>モデル</Label>
          <Select value={aiModel} onValueChange={safeChange(onAiModelChange)} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue>{findLabel(OPENROUTER_MODELS, aiModel)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {OPENROUTER_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── API キー ── */}
      <div className="space-y-2">
        <Label>API キー</Label>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={aiProvider === "gemini" ? "AIzaSy..." : aiProvider === "openrouter" ? "sk-or-..." : "sk-..."}
            disabled={disabled}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showKey ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">キーはサーバーに保存されません。リクエスト時のみ使用されます。</p>

          {/* レート制限案内リンク（プロバイダー別） */}
          {aiProvider === "gemini" && (
            <p className="text-xs text-gray-500">
              ℹ️ 無料枠のレート制限はプロジェクトにより異なります。
              <a
                href="https://aistudio.google.com/rate-limit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                AI Studio で確認 ↗
              </a>
            </p>
          )}
          {aiProvider === "openrouter" && (
            <p className="text-xs text-gray-500">
              ℹ️ 利用状況と制限は OpenRouter ダッシュボードで確認できます。
              <a
                href="https://openrouter.ai/activity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                OpenRouter Activity で確認 ↗
              </a>
            </p>
          )}
          {aiProvider === "openai" && (
            <p className="text-xs text-gray-500">
              ℹ️ 利用状況は OpenAI ダッシュボードで確認できます。
              <a
                href="https://platform.openai.com/usage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Usage で確認 ↗
              </a>
            </p>
          )}

          {guide && (
            <div className="text-xs">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                API キーの取得方法
                <svg className={`w-3 h-3 transition-transform ${showGuide ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showGuide && (
                <div className="mt-2 p-3 rounded-md bg-muted/50 border border-border space-y-2">
                  <a
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    {guide.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    {guide.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 音声合成エンジン ── */}
      <div className="space-y-2">
        <Label>音声合成エンジン</Label>
        <Select
          value={ttsProvider}
          onValueChange={safeChange((v) => {
            onTtsProviderChange(v);
            // ボイスクローン以外はデフォルトボイスに切替
            if (v !== "qwen-clone") {
              const defaultVoice = VOICE_OPTIONS[v]?.[0]?.value;
              if (defaultVoice) onVoiceChange(defaultVoice);
            }
          })}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{findLabel(TTS_PROVIDER_OPTIONS, ttsProvider)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TTS_PROVIDER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── 話者（ボイスクローン以外） ── */}
      {ttsProvider !== "qwen-clone" && (
        <div className="space-y-2">
          <Label>話者</Label>
          <Select value={voice} onValueChange={safeChange(onVoiceChange)} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue>{findLabel(voices, voice)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {voices.map((v) => (
                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── ボイスクローン設定 ── */}
      {ttsProvider === "qwen-clone" && (
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="font-semibold text-sm">ボイスクローン設定</h3>
          <p className="text-xs text-muted-foreground">
            あなたの声（10〜20秒の音声サンプル）を元に、AIがナレーションを読み上げます。
          </p>

          {/* DashScope API キー */}
          <div className="space-y-2">
            <Label>DashScope API キー</Label>
            <div className="relative">
              <input
                type={showDashscopeKey ? "text" : "password"}
                value={dashscopeKey}
                onChange={(e) => onDashscopeKeyChange(e.target.value)}
                placeholder="sk-..."
                disabled={disabled}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowDashscopeKey(!showDashscopeKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showDashscopeKey ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="text-xs">
              <button
                type="button"
                onClick={() => setShowDashscopeGuide(!showDashscopeGuide)}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                DashScope キーの取得方法
                <svg className={`w-3 h-3 transition-transform ${showDashscopeGuide ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDashscopeGuide && (
                <div className="mt-2 p-3 rounded-md bg-muted/50 border border-border space-y-2">
                  <a
                    href={DASHSCOPE_KEY_GUIDE.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    {DASHSCOPE_KEY_GUIDE.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    {DASHSCOPE_KEY_GUIDE.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* 音声サンプルアップロード */}
          <div className="space-y-2">
            <Label>音声サンプル</Label>
            {voiceSample ? (
              <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-background">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span className="text-sm truncate flex-1">{voiceSample.name}</span>
                <button
                  type="button"
                  onClick={() => onVoiceSampleChange(null)}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-destructive text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center gap-2 p-4 rounded-md border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-sm text-muted-foreground">クリックして音声ファイルを選択</span>
                <span className="text-xs text-muted-foreground">WAV / MP3 / M4A（10〜20秒推奨）</span>
                <input
                  type="file"
                  accept=".wav,.mp3,.m4a"
                  className="hidden"
                  disabled={disabled}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onVoiceSampleChange(f);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            <p className="text-xs text-muted-foreground">
              静かな環境で録音した、はっきり話す音声が最適です。雑音の少ないサンプルほど高品質なクローンになります。
            </p>
          </div>
        </div>
      )}

      <hr className="border-border" />
      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">動画設定</h2>

      {/* ── スライド時間 ── */}
      <div className="space-y-2">
        <Label>1スライドあたりの時間</Label>
        <Select
          value={String(slideDuration)}
          onValueChange={safeChange((v) => onSlideDurationChange(Number(v)))}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{findLabel(SLIDE_DURATION_OPTIONS, String(slideDuration))}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SLIDE_DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">AIが生成する台本の分量と動画の長さを調整します。</p>
      </div>

      {/* ── アスペクト比 ── */}
      <div className="space-y-2">
        <Label>アスペクト比</Label>
        <Select value={aspectRatio} onValueChange={safeChange(onAspectRatioChange)} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue>{findLabel(ASPECT_RATIO_OPTIONS, aspectRatio)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── ナレーション言語 ── */}
      <div className="space-y-2">
        <Label>ナレーション言語</Label>
        <Select value={outputLanguage} onValueChange={safeChange(onOutputLanguageChange)} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue>{findLabel(OUTPUT_LANGUAGE_OPTIONS, outputLanguage)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {OUTPUT_LANGUAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          PDFの言語に関係なく、選択した言語でナレーション台本を生成します。「原文のまま」はスライドと同じ言語で出力します。
        </p>
      </div>
    </Card>
  );
}
