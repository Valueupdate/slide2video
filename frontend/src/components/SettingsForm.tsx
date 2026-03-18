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
  ttsProvider: string;
  onTtsProviderChange: (v: string) => void;
  voice: string;
  onVoiceChange: (v: string) => void;
  disabled: boolean;
}

const safeChange = (fn: (v: string) => void) => (v: string | null) => {
  if (v !== null) fn(v);
};

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

export function SettingsForm({
  aiProvider,
  onAiProviderChange,
  apiKey,
  onApiKeyChange,
  ttsProvider,
  onTtsProviderChange,
  voice,
  onVoiceChange,
  disabled,
}: SettingsFormProps) {
  const [showKey, setShowKey] = useState(false);

  const voices = VOICE_OPTIONS[ttsProvider] || VOICE_OPTIONS["edge-tts"];

  return (
    <Card className="p-5 space-y-4">
      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">設定</h2>

      <div className="space-y-2">
        <Label>AI プロバイダー</Label>
        <Select value={aiProvider} onValueChange={safeChange(onAiProviderChange)} disabled={disabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini">Google Gemini</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>API キー</Label>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={aiProvider === "gemini" ? "AIzaSy..." : "sk-..."}
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
        <p className="text-xs text-muted-foreground">キーはサーバーに保存されません。リクエスト時のみ使用されます。</p>
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
          <SelectTrigger>
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
          <SelectTrigger>
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
