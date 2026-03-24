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
import { useState, useEffect, useCallback } from "react";

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

interface ProVoice {
  voice_id: string;
  name: string;
  gender: string;
  description: string;
}

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  description: string;
  use_case: string;
  age: string;
  category: string;
  preview_url: string;
}

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
  proVoices: ProVoice[];
  proVoiceAvailable: boolean;
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
  { label: "Gemini 2.5 Flash（Google）⭐ おすすめ", value: "google/gemini-2.5-flash" },
  { label: "Gemini 2.5 Pro（Google）", value: "google/gemini-2.5-pro" },
  { label: "Claude Sonnet 4（Anthropic）", value: "anthropic/claude-sonnet-4" },
  { label: "Claude Haiku 3.5（Anthropic）", value: "anthropic/claude-3.5-haiku" },
  { label: "GPT-4o（OpenAI）", value: "openai/gpt-4o" },
  { label: "GPT-4o mini（OpenAI）", value: "openai/gpt-4o-mini" },
  { label: "Llama 4 Scout（Meta）", value: "meta-llama/llama-4-scout" },
  { label: "Qwen 2.5 VL 72B（Alibaba）", value: "qwen/qwen2.5-vl-72b-instruct" },
];

const TTS_PROVIDER_OPTIONS_BASE = [
  { label: "Edge-TTS（無料）", value: "edge-tts" },
  { label: "OpenAI TTS（有料・高品質）", value: "openai" },
  { label: "ElevenLabs（高品質・多言語）", value: "elevenlabs" },
  { label: "Azure Speech（Microsoft・無料枠大）", value: "azure" },
  { label: "Google Cloud TTS（Google・無料枠大）", value: "google-cloud" },
  { label: "ボイスクローン（自分の声で読み上げ）", value: "qwen-clone" },
];

const TTS_PROVIDER_OPTION_PRO = { label: "🎙️ プロ声優ボイス", value: "pro-voice" };

const EDGE_TTS_VOICES_BY_LANG: Record<string, { label: string; value: string }[]> = {
  "ja": [
    { label: "Nanami（七海・女性）", value: "ja-JP-NanamiNeural" },
    { label: "Keita（圭太・男性）", value: "ja-JP-KeitaNeural" },
  ],
  "en": [
    { label: "Jenny（女性・アメリカ）", value: "en-US-JennyNeural" },
    { label: "Guy（男性・アメリカ）", value: "en-US-GuyNeural" },
    { label: "Aria（女性・ニュース）", value: "en-US-AriaNeural" },
    { label: "Christopher（男性・ニュース）", value: "en-US-ChristopherNeural" },
    { label: "Michelle（女性・フレンドリー）", value: "en-US-MichelleNeural" },
    { label: "Roger（男性・明るい）", value: "en-US-RogerNeural" },
    { label: "Sonia（女性・イギリス）", value: "en-GB-SoniaNeural" },
    { label: "Ryan（男性・イギリス）", value: "en-GB-RyanNeural" },
    { label: "Natasha（女性・オーストラリア）", value: "en-AU-NatashaNeural" },
    { label: "William（男性・オーストラリア）", value: "en-AU-WilliamNeural" },
  ],
  "zh-CN": [
    { label: "Xiaoxiao（女性・やさしい）", value: "zh-CN-XiaoxiaoNeural" },
    { label: "Yunxi（男性・標準）", value: "zh-CN-YunxiNeural" },
    { label: "Xiaoyi（女性・明るい）", value: "zh-CN-XiaoyiNeural" },
    { label: "Yunjian（男性・スポーツ）", value: "zh-CN-YunjianNeural" },
    { label: "Yunyang（男性・ニュース）", value: "zh-CN-YunyangNeural" },
    { label: "Yunxia（男性・キュート）", value: "zh-CN-YunxiaNeural" },
  ],
  "ko": [
    { label: "SunHi（女性）", value: "ko-KR-SunHiNeural" },
    { label: "InJoon（男性）", value: "ko-KR-InJoonNeural" },
  ],
  "fr": [
    { label: "Denise（女性）", value: "fr-FR-DeniseNeural" },
    { label: "Henri（男性）", value: "fr-FR-HenriNeural" },
    { label: "Eloise（女性・やさしい）", value: "fr-FR-EloiseNeural" },
  ],
  "es": [
    { label: "Elvira（女性・スペイン）", value: "es-ES-ElviraNeural" },
    { label: "Alvaro（男性・スペイン）", value: "es-ES-AlvaroNeural" },
    { label: "Dalia（女性・メキシコ）", value: "es-MX-DaliaNeural" },
    { label: "Jorge（男性・メキシコ）", value: "es-MX-JorgeNeural" },
  ],
  "de": [
    { label: "Katja（女性）", value: "de-DE-KatjaNeural" },
    { label: "Conrad（男性）", value: "de-DE-ConradNeural" },
    { label: "Amala（女性・やさしい）", value: "de-DE-AmalaNeural" },
    { label: "Killian（男性）", value: "de-DE-KillianNeural" },
  ],
  "pt": [
    { label: "Francisca（女性・ブラジル）", value: "pt-BR-FranciscaNeural" },
    { label: "Antonio（男性・ブラジル）", value: "pt-BR-AntonioNeural" },
    { label: "Raquel（女性・ポルトガル）", value: "pt-PT-RaquelNeural" },
    { label: "Duarte（男性・ポルトガル）", value: "pt-PT-DuarteNeural" },
  ],
};

const VOICE_OPTIONS: Record<string, { label: string; value: string }[]> = {
  openai: [
    { label: "Alloy（中性的）", value: "alloy" },
    { label: "Nova（女性）", value: "nova" },
    { label: "Onyx（男性）", value: "onyx" },
    { label: "Shimmer（女性・柔らか）", value: "shimmer" },
  ],
  "google-cloud": [
    { label: "Wavenet A（女性・自然）", value: "wavenet-a" },
    { label: "Wavenet B（男性・自然）", value: "wavenet-b" },
    { label: "Wavenet C（男性・落ち着き）", value: "wavenet-c" },
    { label: "Wavenet D（女性・明るい）", value: "wavenet-d" },
    { label: "Neural2 B（男性・高品質）", value: "neural2-b" },
    { label: "Neural2 C（女性・高品質）", value: "neural2-c" },
    { label: "Standard A（女性・標準）", value: "standard-a" },
    { label: "Standard B（男性・標準）", value: "standard-b" },
  ],
  azure: [
    { label: "Nanami（女性・落ち着き）", value: "nanami" },
    { label: "Keita（男性・標準）", value: "keita" },
    { label: "Aoi（女性・明るい）", value: "aoi" },
    { label: "Daichi（男性・低め）", value: "daichi" },
    { label: "Mayu（女性・やさしい）", value: "mayu" },
    { label: "Naoki（男性・フォーマル）", value: "naoki" },
    { label: "Shiori（女性・ニュース調）", value: "shiori" },
    { label: "Jenny（女性・英語）", value: "jenny" },
    { label: "Guy（男性・英語）", value: "guy" },
    { label: "Aria（女性・英語プロ）", value: "aria" },
    { label: "Xiaoxiao（女性・中国語）", value: "xiaoxiao" },
  ],
  elevenlabs: [],
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
  proVoices,
  proVoiceAvailable,
  disabled,
}: SettingsFormProps) {
  const [showKey, setShowKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showDashscopeKey, setShowDashscopeKey] = useState(false);
  const [showDashscopeGuide, setShowDashscopeGuide] = useState(false);

  // ElevenLabs 音声検索モーダル
  const [showElevenLabsModal, setShowElevenLabsModal] = useState(false);
  const [elevenLabsVoices, setElevenLabsVoices] = useState<ElevenLabsVoice[]>([]);
  const [elevenLabsLoading, setElevenLabsLoading] = useState(false);
  const [elevenLabsError, setElevenLabsError] = useState("");
  const [elevenLabsSearch, setElevenLabsSearch] = useState("");
  const [elevenLabsGender, setElevenLabsGender] = useState("all");
  const [elevenLabsAccent, setElevenLabsAccent] = useState("all");
  const [elevenLabsAge, setElevenLabsAge] = useState("all");
  const [elevenLabsCategory, setElevenLabsCategory] = useState("all");
  const [selectedElevenLabsVoiceName, setSelectedElevenLabsVoiceName] = useState("");

  const API_URL = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "") : "";

  const edgeVoicesForLang = EDGE_TTS_VOICES_BY_LANG[outputLanguage] || EDGE_TTS_VOICES_BY_LANG["ja"];
  const voices = ttsProvider === "edge-tts" ? edgeVoicesForLang : (VOICE_OPTIONS[ttsProvider] || edgeVoicesForLang);
  const guide = API_KEY_GUIDES[aiProvider];

  const ttsProviderOptions = proVoiceAvailable
    ? [TTS_PROVIDER_OPTION_PRO, ...TTS_PROVIDER_OPTIONS_BASE]
    : TTS_PROVIDER_OPTIONS_BASE;

  // ElevenLabs 音声一覧を取得
  const fetchElevenLabsVoices = useCallback(async () => {
    if (!dashscopeKey) return;
    setElevenLabsLoading(true);
    setElevenLabsError("");
    try {
      const langParam = outputLanguage ? `?language=${outputLanguage}` : "";
      const res = await fetch(`${API_URL}/elevenlabs/voices${langParam}`, {
        headers: {
          "X-ElevenLabs-Key": dashscopeKey,
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "取得に失敗しました");
      }
      const data = await res.json();
      setElevenLabsVoices(data.voices || []);
    } catch (e) {
      setElevenLabsError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setElevenLabsLoading(false);
    }
  }, [dashscopeKey, API_URL]);

  // モーダルを開いたときに音声一覧を取得
  useEffect(() => {
    if (showElevenLabsModal && elevenLabsVoices.length === 0 && dashscopeKey) {
      fetchElevenLabsVoices();
    }
  }, [showElevenLabsModal, elevenLabsVoices.length, dashscopeKey, fetchElevenLabsVoices]);

  // 無料プランで使える音声（premade = ElevenLabs デフォルト提供音声）
  const elevenLabsMyVoices = elevenLabsVoices.filter((v) => v.category === "premade");

  // API キー入力時にマイボイスを自動取得
  useEffect(() => {
    if (ttsProvider === "elevenlabs" && dashscopeKey && elevenLabsVoices.length === 0) {
      fetchElevenLabsVoices();
    }
  }, [ttsProvider, dashscopeKey, elevenLabsVoices.length, fetchElevenLabsVoices]);

  // マイボイス取得後にデフォルト音声を設定
  useEffect(() => {
    if (ttsProvider === "elevenlabs" && elevenLabsMyVoices.length > 0 && !elevenLabsMyVoices.find((v) => v.voice_id === voice)) {
      onVoiceChange(elevenLabsMyVoices[0].voice_id);
    }
  }, [ttsProvider, elevenLabsMyVoices, voice, onVoiceChange]);

  // ElevenLabs フィルター用の選択肢を動的に生成
  const elevenLabsAccents = Array.from(new Set(elevenLabsVoices.map((v) => v.accent).filter(Boolean))).sort();
  const elevenLabsAges = Array.from(new Set(elevenLabsVoices.map((v) => v.age).filter(Boolean))).sort();
  const elevenLabsCategories = Array.from(new Set(elevenLabsVoices.map((v) => v.category).filter(Boolean))).sort();

  // ElevenLabs 音声のフィルタリング
  const filteredElevenLabsVoices = elevenLabsVoices.filter((v) => {
    const matchesSearch = elevenLabsSearch === "" ||
      v.name.toLowerCase().includes(elevenLabsSearch.toLowerCase()) ||
      v.accent.toLowerCase().includes(elevenLabsSearch.toLowerCase()) ||
      v.description.toLowerCase().includes(elevenLabsSearch.toLowerCase()) ||
      v.use_case.toLowerCase().includes(elevenLabsSearch.toLowerCase());
    const matchesGender = elevenLabsGender === "all" || v.gender === elevenLabsGender;
    const matchesAccent = elevenLabsAccent === "all" || v.accent === elevenLabsAccent;
    const matchesAge = elevenLabsAge === "all" || v.age === elevenLabsAge;
    const matchesCategory = elevenLabsCategory === "all" || v.category === elevenLabsCategory;
    return matchesSearch && matchesGender && matchesAccent && matchesAge && matchesCategory;
  });

  // ElevenLabs で voice_id が選択されたときに名前を記憶
  const currentElevenLabsLabel = (() => {
    if (ttsProvider !== "elevenlabs") return "";
    // マイボイス（API取得）から探す
    const myVoice = elevenLabsVoices.find((v) => v.voice_id === voice);
    if (myVoice) return `${myVoice.name}（${myVoice.gender === "female" ? "女性" : myVoice.gender === "male" ? "男性" : myVoice.gender}）`;
    // モーダルから選択した場合
    if (selectedElevenLabsVoiceName) return selectedElevenLabsVoiceName;
    return voice;
  })();

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

          {aiProvider === "gemini" && (
            <p className="text-xs text-gray-500">
              ℹ️ 無料枠のレート制限はプロジェクトにより異なります。
              <a href="https://aistudio.google.com/rate-limit" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">AI Studio で確認 ↗</a>
            </p>
          )}
          {aiProvider === "openrouter" && (
            <p className="text-xs text-gray-500">
              ℹ️ 利用状況と制限は OpenRouter ダッシュボードで確認できます。
              <a href="https://openrouter.ai/activity" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">OpenRouter Activity で確認 ↗</a>
            </p>
          )}
          {aiProvider === "openai" && (
            <p className="text-xs text-gray-500">
              ℹ️ 利用状況は OpenAI ダッシュボードで確認できます。
              <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">Usage で確認 ↗</a>
            </p>
          )}

          {guide && (
            <div className="text-xs">
              <button type="button" onClick={() => setShowGuide(!showGuide)} className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                API キーの取得方法
                <svg className={`w-3 h-3 transition-transform ${showGuide ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showGuide && (
                <div className="mt-2 p-3 rounded-md bg-muted/50 border border-border space-y-2">
                  <a href={guide.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                    {guide.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    {guide.steps.map((step, i) => (<li key={i}>{step}</li>))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
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
        <p className="text-xs text-muted-foreground">PDFの言語に関係なく、選択した言語でナレーション台本を生成します。</p>
      </div>

      {/* ── 音声合成エンジン ── */}
      <div className="space-y-2">
        <Label>音声合成エンジン</Label>
        <Select
          value={ttsProvider}
          onValueChange={safeChange((v) => {
            onTtsProviderChange(v);
            setSelectedElevenLabsVoiceName("");
            if (v === "edge-tts") {
              const langVoices = EDGE_TTS_VOICES_BY_LANG[outputLanguage] || EDGE_TTS_VOICES_BY_LANG["ja"];
              if (langVoices[0]) onVoiceChange(langVoices[0].value);
            } else if (v === "pro-voice") {
              if (proVoices.length > 0) onVoiceChange(proVoices[0].voice_id);
            } else if (v !== "qwen-clone") {
              const defaultVoice = VOICE_OPTIONS[v]?.[0]?.value;
              if (defaultVoice) onVoiceChange(defaultVoice);
            }
          })}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{findLabel(ttsProviderOptions, ttsProvider)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ttsProviderOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── 声優ボイス選択 ── */}
      {ttsProvider === "pro-voice" && (
        <div className="space-y-2">
          <Label>声優を選択</Label>
          <Select value={voice} onValueChange={safeChange(onVoiceChange)} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {proVoices.find((v) => v.voice_id === voice)?.name || "声優を選択してください"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {proVoices.map((v) => (
                <SelectItem key={v.voice_id} value={v.voice_id}>
                  <div className="flex flex-col">
                    <span>{v.name}（{v.gender === "male" ? "男性" : v.gender === "female" ? "女性" : v.gender}）</span>
                    {v.description && (
                      <span className="text-xs text-muted-foreground">{v.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            プロの声優による高品質なナレーションです。APIキーは不要です。
          </p>
        </div>
      )}

      {/* ── 話者（ボイスクローン・声優以外） ── */}
      {ttsProvider !== "qwen-clone" && ttsProvider !== "pro-voice" && (
        <div className="space-y-2">
          <Label>話者</Label>
          {ttsProvider === "elevenlabs" ? (
            <>
              {/* マイボイス（無料で使える音声）をコンボボックスに表示 */}
              {elevenLabsMyVoices.length > 0 ? (
                <Select value={voice} onValueChange={safeChange((v) => { onVoiceChange(v); setSelectedElevenLabsVoiceName(""); })} disabled={disabled}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{currentElevenLabsLabel || "音声を選択"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {elevenLabsMyVoices.map((v) => (
                      <SelectItem key={v.voice_id} value={v.voice_id}>
                        {v.name}（{v.gender === "female" ? "女性" : v.gender === "male" ? "男性" : v.gender}）
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  {dashscopeKey ? "音声を読み込み中..." : "API キーを入力すると利用可能な音声が表示されます"}
                </p>
              )}
              {dashscopeKey && (
                <button
                  type="button"
                  onClick={() => setShowElevenLabsModal(true)}
                  disabled={disabled}
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  他の音声を探す（{elevenLabsVoices.length > 0 ? `${elevenLabsVoices.length}件` : "Voice Library"}）
                </button>
              )}
            </>
          ) : (
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
          )}
        </div>
      )}

      {/* ── ElevenLabs 音声検索モーダル ── */}
      {showElevenLabsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowElevenLabsModal(false)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-sm">ElevenLabs Voice Library</h3>
              <button type="button" onClick={() => setShowElevenLabsModal(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 space-y-3 border-b border-border">
              <input
                type="text"
                value={elevenLabsSearch}
                onChange={(e) => setElevenLabsSearch(e.target.value)}
                placeholder="名前、アクセント、用途で検索..."
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />

              {/* 性別 */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground self-center mr-1 shrink-0">性別:</span>
                {[
                  { label: "すべて", value: "all" },
                  { label: "女性", value: "female" },
                  { label: "男性", value: "male" },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setElevenLabsGender(g.value)}
                    className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                      elevenLabsGender === g.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* アクセント / 言語 */}
              {elevenLabsAccents.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground self-center mr-1 shrink-0">言語:</span>
                  <button
                    type="button"
                    onClick={() => setElevenLabsAccent("all")}
                    className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                      elevenLabsAccent === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    すべて
                  </button>
                  {elevenLabsAccents.slice(0, 12).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setElevenLabsAccent(a)}
                      className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                        elevenLabsAccent === a
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}

              {/* 年齢 */}
              {elevenLabsAges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground self-center mr-1 shrink-0">年齢:</span>
                  <button
                    type="button"
                    onClick={() => setElevenLabsAge("all")}
                    className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                      elevenLabsAge === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    すべて
                  </button>
                  {elevenLabsAges.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setElevenLabsAge(a)}
                      className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                        elevenLabsAge === a
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}

              {/* カテゴリ */}
              {elevenLabsCategories.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground self-center mr-1 shrink-0">種別:</span>
                  <button
                    type="button"
                    onClick={() => setElevenLabsCategory("all")}
                    className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                      elevenLabsCategory === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    すべて
                  </button>
                  {elevenLabsCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setElevenLabsCategory(c)}
                      className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                        elevenLabsCategory === c
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c === "my-voice" ? "マイボイス" : c === "community-local" ? "ローカル" : c === "community" ? "グローバル" : c}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {filteredElevenLabsVoices.length}件 / {elevenLabsVoices.length}件
                </span>
                {(elevenLabsGender !== "all" || elevenLabsAccent !== "all" || elevenLabsAge !== "all" || elevenLabsCategory !== "all" || elevenLabsSearch !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setElevenLabsGender("all");
                      setElevenLabsAccent("all");
                      setElevenLabsAge("all");
                      setElevenLabsCategory("all");
                      setElevenLabsSearch("");
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    フィルターをリセット
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {elevenLabsLoading && (
                <div className="text-center py-8 text-muted-foreground text-sm">読み込み中...</div>
              )}
              {elevenLabsError && (
                <div className="text-center py-4 text-destructive text-sm">{elevenLabsError}</div>
              )}
              {!elevenLabsLoading && !elevenLabsError && filteredElevenLabsVoices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">一致する音声が見つかりません</div>
              )}
              {filteredElevenLabsVoices.map((v) => (
                <button
                  key={v.voice_id}
                  type="button"
                  onClick={() => {
                    onVoiceChange(v.voice_id);
                    setSelectedElevenLabsVoiceName(`${v.name}（${v.gender === "female" ? "女性" : v.gender === "male" ? "男性" : v.gender}${v.accent ? `・${v.accent}` : ""}）`);
                    setShowElevenLabsModal(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent ${
                    voice === v.voice_id ? "bg-accent ring-1 ring-primary" : ""
                  } ${v.category !== "premade" ? "opacity-80" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{v.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      v.category === "premade" ? "bg-green-500/20 text-green-400" :
                      v.category === "cloned" ? "bg-primary/20 text-primary" :
                      v.category === "community-local" ? "bg-blue-500/20 text-blue-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {v.category === "premade" ? "無料" : v.category === "cloned" ? "クローン" : v.category === "community-local" ? outputLanguage.toUpperCase() : "Global"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {[
                      v.gender === "female" ? "女性" : v.gender === "male" ? "男性" : v.gender,
                      v.accent,
                      v.age,
                      v.use_case,
                      v.description,
                    ].filter(Boolean).join(" · ")}
                  </div>
                  {v.category !== "premade" && (
                    <span className="text-xs text-yellow-500 mt-0.5 block">⚠ 有料プラン（Starter $5/月〜）が必要</span>
                  )}
                  {v.preview_url && (
                    <audio
                      src={v.preview_url}
                      className="mt-1 w-full h-6"
                      controls
                      preload="none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── OpenAI TTS API キー ── */}
      {ttsProvider === "openai" && aiProvider !== "openai" && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <Label>OpenAI API キー（TTS用）</Label>
          <div className="relative">
            <input
              type={showDashscopeKey ? "text" : "password"}
              value={dashscopeKey}
              onChange={(e) => onDashscopeKeyChange(e.target.value)}
              placeholder="sk-..."
              disabled={disabled}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 pr-10"
            />
            <button type="button" onClick={() => setShowDashscopeKey(!showDashscopeKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showDashscopeKey ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            音声合成に使用する OpenAI API キーを入力してください。キーは <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI ダッシュボード ↗</a> で作成できます。
          </p>
        </div>
      )}
      {ttsProvider === "openai" && aiProvider === "openai" && (
        <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg border border-border p-3">
          ℹ️ AI プロバイダーの OpenAI API キーを音声合成にも使用します。
        </p>
      )}

      {/* ── Google Cloud TTS サービスアカウントキー ── */}
      {ttsProvider === "google-cloud" && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <Label>Google Cloud サービスアカウントキー（JSON）</Label>
          <textarea
            value={dashscopeKey}
            onChange={(e) => onDashscopeKeyChange(e.target.value)}
            placeholder='{"type": "service_account", "project_id": "...", ...}'
            disabled={disabled}
            rows={4}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console ↗</a> でサービスアカウントを作成し、JSON キーをコピーして貼り付けてください。無料枠は WaveNet 400万文字/月、Standard 400万文字/月です。
          </p>
        </div>
      )}

      {/* ── Azure Speech API キー ── */}
      {ttsProvider === "azure" && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <Label>Azure Speech API キー</Label>
          <div className="relative">
            <input
              type={showDashscopeKey ? "text" : "password"}
              value={dashscopeKey}
              onChange={(e) => onDashscopeKeyChange(e.target.value)}
              placeholder="APIキー:リージョン（例: abc123:japaneast）"
              disabled={disabled}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 pr-10"
            />
            <button type="button" onClick={() => setShowDashscopeKey(!showDashscopeKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showDashscopeKey ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            「APIキー:リージョン」の形式で入力してください（例: <code>abc123:japaneast</code>）。
            キーは <a href="https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Azure Portal ↗</a> で作成できます。無料枠は50万文字/月です。
          </p>
        </div>
      )}

      {/* ── ElevenLabs API キー ── */}
      {ttsProvider === "elevenlabs" && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <Label>ElevenLabs API キー</Label>
          <div className="relative">
            <input
              type={showDashscopeKey ? "text" : "password"}
              value={dashscopeKey}
              onChange={(e) => onDashscopeKeyChange(e.target.value)}
              placeholder="sk_..."
              disabled={disabled}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 pr-10"
            />
            <button type="button" onClick={() => setShowDashscopeKey(!showDashscopeKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showDashscopeKey ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            キーは <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ElevenLabs ダッシュボード ↗</a> で作成できます。無料枠は約10,000文字/月です。
          </p>
        </div>
      )}

      {/* ── ボイスクローン設定 ── */}
      {ttsProvider === "qwen-clone" && (
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="font-semibold text-sm">ボイスクローン設定</h3>
          <p className="text-xs text-muted-foreground">
            あなたの声（10〜20秒の音声サンプル）を元に、AIがナレーションを読み上げます。
          </p>

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
              <button type="button" onClick={() => setShowDashscopeKey(!showDashscopeKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showDashscopeKey ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            <div className="text-xs">
              <button type="button" onClick={() => setShowDashscopeGuide(!showDashscopeGuide)} className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                DashScope キーの取得方法
                <svg className={`w-3 h-3 transition-transform ${showDashscopeGuide ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showDashscopeGuide && (
                <div className="mt-2 p-3 rounded-md bg-muted/50 border border-border space-y-2">
                  <a href={DASHSCOPE_KEY_GUIDE.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                    {DASHSCOPE_KEY_GUIDE.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    {DASHSCOPE_KEY_GUIDE.steps.map((step, i) => (<li key={i}>{step}</li>))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>音声サンプル</Label>
            {voiceSample ? (
              <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-background">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                <span className="text-sm truncate flex-1">{voiceSample.name}</span>
                <button type="button" onClick={() => onVoiceSampleChange(null)} disabled={disabled} className="text-muted-foreground hover:text-destructive text-sm">✕</button>
              </div>
            ) : (
              <label className={`flex flex-col items-center gap-2 p-4 rounded-md border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                <span className="text-sm text-muted-foreground">クリックして音声ファイルを選択</span>
                <span className="text-xs text-muted-foreground">WAV / MP3 / M4A（10〜20秒推奨）</span>
                <input type="file" accept=".wav,.mp3,.m4a" className="hidden" disabled={disabled} onChange={(e) => { const f = e.target.files?.[0]; if (f) onVoiceSampleChange(f); e.target.value = ""; }} />
              </label>
            )}
            <p className="text-xs text-muted-foreground">静かな環境で録音した、はっきり話す音声が最適です。雑音の少ないサンプルほど高品質なクローンになります。</p>
            <p className="text-xs text-muted-foreground">💡 ナレーション言語と異なる言語のサンプルでも使用できますが、より自然な発音にはナレーション言語と同じ言語で録音したサンプルをお勧めします。</p>
          </div>
        </div>
      )}

      <hr className="border-border" />
      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">動画設定</h2>

      {/* ── スライド時間 ── */}
      <div className="space-y-2">
        <Label>1スライドあたりの時間</Label>
        <Select value={String(slideDuration)} onValueChange={safeChange((v) => onSlideDurationChange(Number(v)))} disabled={disabled}>
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
    </Card>
  );
}
