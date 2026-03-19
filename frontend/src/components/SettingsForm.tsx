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
  disabled: boolean;
}

const safeChange = (fn: (v: string) => void) => (v: string | null) => {
  if (v !== null) fn(v);
};

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
  disabled,
}: SettingsFormProps) {
  const [showKey, setShowKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const voices = VOICE_OPTIONS[ttsProvider] || VOICE_OPTIONS["edge-tts"];
  const guide = API_KEY_GUIDES[aiProvider];

  return (
    <Card className="p-5 space-y-4">
      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">設定</h2>

      <div className="space-y-2">
        <Label>AI プロバイダー</Label>
        <Select value={aiProvider} onValueChange={safeChange(onAiProviderChange)} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini">Google Gemini</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="openrouter">OpenRouter（複数モデル対応）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {aiProvider === "openrouter" && (
        <div className="space-y-2">
          <Label>モデル</Label>
          <Select value={aiModel} onValueChange={safeChange(onAiModelChange)} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPENROUTER_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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

      <div className="space-y-2">
        <Label>音声合成エンジン</Label>
        <Select
          value={ttsProvider}
          onValueChange={safeChange((v) => {
            onTtsProviderChange(v);
            const defaultVoice = VOICE_OPTIONS[v]?.[0]?.value;
            if (defaultVoice) onVoiceChange(defaultVoice);
          })}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="edge-tts">Edge-TTS（無料）</SelectItem>
            <SelectItem value="openai">OpenAI TTS（有料・高品質）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>話者</Label>
        <Select value={voice} onValueChange={safeChange(onVoiceChange)} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {voices.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
