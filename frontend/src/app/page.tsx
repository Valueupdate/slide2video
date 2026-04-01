"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { UploadArea } from "@/components/UploadArea";
import { SettingsForm } from "@/components/SettingsForm";
import { ProgressView } from "@/components/ProgressView";
import { DownloadView } from "@/components/DownloadView";
import { translations, type Lang } from "@/lib/i18n";

export type AppState = "idle" | "ready" | "processing" | "done" | "error";

export interface LogEntry {
  step: string;
  message: string;
  timestamp: Date;
}

function DemoVideoCard({ uiLang }: { uiLang: string }) {
  const [open, setOpen] = useState(false);
  const videoId = uiLang === "ja" ? "RWbunkq8ttA" : "x-gOYT_M9Rg";
  const label = uiLang === "ja" ? "デモ動画を見る" : "Watch Demo Video";
  const note = uiLang === "ja"
    ? "✨ この動画は Slide2Video で自動生成されました"
    : "✨ This video was automatically generated with Slide2Video";

  return (
    <div
      className="rounded-lg border border-border bg-card px-3 py-2 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl shrink-0">🎬</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{label}</div>
          <div className="text-xs text-muted-foreground">{note}</div>
        </div>
        <svg
          className={`w-3 h-3 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <div
          className="mt-2 pt-2 border-t border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-lg overflow-hidden aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
              title="Slide2Video Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

function UseCaseCards({ t }: { t: import("@/lib/i18n").Translations }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const cases = [
    { icon: "🎓", title: t.useCaseEducation, desc: t.useCaseEducationDesc, scenario: t.useCaseEducationScenario },
    { icon: "💼", title: t.useCaseSales, desc: t.useCaseSalesDesc, scenario: t.useCaseSalesScenario },
    { icon: "📱", title: t.useCaseSNS, desc: t.useCaseSNSDesc, scenario: t.useCaseSNSScenario },
    { icon: "🏢", title: t.useCaseInternal, desc: t.useCaseInternalDesc, scenario: t.useCaseInternalScenario },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {cases.map((item, i) => (
        <div
          key={item.title}
          className="rounded-lg border border-border bg-card px-3 py-2 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
            <svg
              className={`w-3 h-3 shrink-0 text-muted-foreground transition-transform ${openIndex === i ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {openIndex === i && (
            <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground leading-relaxed">
              {item.scenario}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [aiProvider, setAiProvider] = useState<string>("gemini");
  const [apiKey, setApiKey] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("google/gemini-2.5-flash");
  const [ttsProvider, setTtsProvider] = useState<string>("edge-tts");
  const [voice, setVoice] = useState<string>("ja-JP-NanamiNeural");
  const [proVoices, setProVoices] = useState<Array<{ voice_id: string; name: string; gender: string; description: string }>>([]);
  const [proVoiceAvailable, setProVoiceAvailable] = useState<boolean>(false);
  const [slideDuration, setSlideDuration] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [outputLanguage, setOutputLanguage] = useState<string>("");
  const [dashscopeKey, setDashscopeKey] = useState<string>("");
  const [voiceSample, setVoiceSample] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [jobId, setJobId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uiLang, setUiLang] = useState<Lang>("ja");
  const abortRef = useRef<AbortController | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const t = translations[uiLang];

  // ブラウザの言語設定からUI言語を推定
  useEffect(() => {
    const browserLang = navigator.language || "ja";
    const isEnglish = browserLang.startsWith("en");
    setUiLang(isEnglish ? "en" : "ja");
  }, []);



  // ブラウザの言語設定からデフォルト出力言語を推定
  useEffect(() => {
    if (outputLanguage === "") {
      const browserLang = navigator.language || "ja";
      const langCode = browserLang.startsWith("zh") ? "zh-CN"
        : browserLang.split("-")[0];
      const supported = ["ja", "en", "zh-CN", "ko", "fr", "es", "de", "pt", "auto"];
      setOutputLanguage(supported.includes(langCode) ? langCode : "en");
    }
  }, [outputLanguage]);

  // 出力言語変更時に Edge-TTS のデフォルト話者を自動切替
  useEffect(() => {
    if (ttsProvider !== "edge-tts" || outputLanguage === "") return;
    const defaultVoices: Record<string, string> = {
      "auto": "ja-JP-NanamiNeural",
      "ja": "ja-JP-NanamiNeural",
      "en": "en-US-JennyNeural",
      "zh-CN": "zh-CN-XiaoxiaoNeural",
      "ko": "ko-KR-SunHiNeural",
      "fr": "fr-FR-DeniseNeural",
      "es": "es-ES-ElviraNeural",
      "de": "de-DE-KatjaNeural",
      "pt": "pt-BR-FranciscaNeural",
    };
    const defaultVoice = defaultVoices[outputLanguage];
    if (defaultVoice) {
      setVoice(defaultVoice);
    }
  }, [outputLanguage, ttsProvider]);

  // プロ声優ボイス一覧を取得
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await fetch(`${API_URL}/voices`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (res.ok) {
          const data = await res.json();
          setProVoices(data.voices || []);
          setProVoiceAvailable(data.available || false);
        }
      } catch {
        // サーバー未起動等の場合は無視
      }
    };
    fetchVoices();
  }, [API_URL]);

  // F-11: ページ離脱対策 Lv1 — 処理中にページを閉じようとすると警告を表示
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state === "processing") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state]);

  const addLog = useCallback((step: string, message: string) => {
    setLogs((prev) => [...prev, { step, message, timestamp: new Date() }]);
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setState("ready");
    setLogs([]);
    setProgress(0);
    setErrorMessage("");
    setJobId("");
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setState("idle");
    setLogs([]);
    setProgress(0);
    setErrorMessage("");
    setJobId("");
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!file || !apiKey) return;

    setState("processing");
    setProgress(0);
    setLogs([]);
    setErrorMessage("");

    // GA4: 動画生成開始イベント
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "generate_start", {
        ai_provider: aiProvider,
        tts_provider: ttsProvider,
        output_language: outputLanguage,
        aspect_ratio: aspectRatio,
        slide_duration: slideDuration,
      });
    }

    try {
      addLog("upload", t.uploadingPdf);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("voice", voice);
      formData.append("tts_provider", ttsProvider);
      formData.append("slide_duration", String(slideDuration));
      formData.append("aspect_ratio", aspectRatio);
      formData.append("output_language", outputLanguage);

      // ボイスクローン時は音声サンプルを追加
      if (ttsProvider === "qwen-clone" && voiceSample) {
        formData.append("voice_sample", voiceSample);
      }

      // ヘッダー構築
      const headers: Record<string, string> = {
        "X-AI-Provider": aiProvider,
        "X-API-Key": apiKey,
        "ngrok-skip-browser-warning": "true",
      };
      if (aiProvider === "openrouter" && aiModel) {
        headers["X-AI-Model"] = aiModel;
      }
      if ((ttsProvider === "openai" || ttsProvider === "qwen-clone" || ttsProvider === "elevenlabs" || ttsProvider === "azure" || ttsProvider === "google-cloud") && dashscopeKey) {
        headers["X-DashScope-Key"] = dashscopeKey;
      }

      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || t.uploadFailed);
      }

      const data = await res.json();
      const currentJobId = data.job_id;
      setJobId(currentJobId);
      addLog("upload", `${t.jobStarted}${currentJobId}`);

      const abort = new AbortController();
      abortRef.current = abort;

      const eventRes = await fetch(`${API_URL}/progress/${currentJobId}`, {
        signal: abort.signal,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!eventRes.ok || !eventRes.body) {
        throw new Error(t.progressFailed);
      }

      const reader = eventRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.step === "keepalive") continue;

            if (event.progress >= 0) {
              setProgress(event.progress);
            }
            if (event.message) {
              addLog(event.step, event.message);
            }

            if (event.step === "done") {
              setJobId(currentJobId);
              setState("done");
              // GA4: 動画生成完了イベント
              if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
                (window as any).gtag("event", "generate_complete", {
                  ai_provider: aiProvider,
                  tts_provider: ttsProvider,
                  output_language: outputLanguage,
                  aspect_ratio: aspectRatio,
                  slide_duration: slideDuration,
                });
              }
              return;
            }
            if (event.step === "error") {
              throw new Error(event.message || t.processingError);
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : t.unknownError;
      setErrorMessage(message);
      addLog("error", message);
      setState("error");
    }
  }, [file, apiKey, aiProvider, aiModel, ttsProvider, voice, slideDuration, aspectRatio, outputLanguage, dashscopeKey, voiceSample, API_URL, addLog]);

  const handleReset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setFile(null);
    setState("idle");
    setProgress(0);
    setLogs([]);
    setJobId("");
    setErrorMessage("");
  }, []);

  const handleRegenerate = useCallback(() => {
    setProgress(0);
    setLogs([]);
    setJobId("");
    setErrorMessage("");
    setState("ready");
  }, []);

  const canGenerate = (() => {
    if (state !== "ready" || !file || !apiKey) return false;
    if (ttsProvider === "qwen-clone" && (!dashscopeKey || !voiceSample)) return false;
    if (ttsProvider === "openai" && aiProvider !== "openai" && !dashscopeKey) return false;
    if (ttsProvider === "elevenlabs" && !dashscopeKey) return false;
    if (ttsProvider === "azure" && !dashscopeKey) return false;
    if (ttsProvider === "google-cloud" && !dashscopeKey) return false;
    return true;
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Header uiLang={uiLang} onLangChange={setUiLang} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {t.mainTitle}
          </h1>
          <p className="text-muted-foreground">
            {t.mainSubtitle}
          </p>
        </div>

        <UseCaseCards t={t} />

        {/* デモ動画セクション */}
        <DemoVideoCard uiLang={uiLang} />
        <UploadArea
          file={file}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          disabled={state === "processing"}
          t={t}
        />

        <SettingsForm
          aiProvider={aiProvider}
          onAiProviderChange={setAiProvider}
          aiModel={aiModel}
          onAiModelChange={setAiModel}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          ttsProvider={ttsProvider}
          onTtsProviderChange={setTtsProvider}
          voice={voice}
          onVoiceChange={setVoice}
          proVoices={proVoices}
          proVoiceAvailable={proVoiceAvailable}
          slideDuration={slideDuration}
          onSlideDurationChange={setSlideDuration}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          outputLanguage={outputLanguage}
          onOutputLanguageChange={setOutputLanguage}
          dashscopeKey={dashscopeKey}
          onDashscopeKeyChange={setDashscopeKey}
          voiceSample={voiceSample}
          onVoiceSampleChange={setVoiceSample}
          disabled={state === "processing"}
          uiLang={uiLang}
          t={t}
        />

        {(state === "idle" || state === "ready") && (
          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              {t.termsNotice}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {t.termsLink}
              </a>
              {t.termsNoticeSuffix}
            </p>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-3 rounded-lg font-semibold text-base transition-all
                bg-primary text-primary-foreground hover:opacity-90
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t.generateButton}
            </button>
          </div>
        )}

        {(state === "processing" || state === "done" || state === "error") && (
          <ProgressView
            progress={progress}
            logs={logs}
            isProcessing={state === "processing"}
            errorMessage={errorMessage}
            t={t}
          />
        )}

        {state === "done" && jobId && (
          <DownloadView
            apiUrl={API_URL}
            jobId={jobId}
            onReset={handleReset}
            onRegenerate={handleRegenerate}
            t={t}
          />
        )}

        {state === "error" && (
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-lg font-semibold text-base
              bg-secondary text-secondary-foreground hover:opacity-90"
          >
            {t.resetButton}
          </button>
        )}
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border space-y-2">
        <div>{t.footerTagline}</div>
        <div className="text-xs">{t.footerPrivacy}</div>
        <div className="text-xs space-x-3">
          <a href="/terms" className="text-blue-600 hover:underline">{t.footerTerms}</a>
          <span>|</span>
          <a href="/privacy" className="text-blue-600 hover:underline">{t.footerPrivacyLink}</a>
          <span>|</span>
          <a href="https://github.com/Valueupdate/slide2video" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            GitHub
          </a>
          <span>|</span>
          <a href="https://github.com/Valueupdate/slide2video/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MIT License</a>
          <span>|</span>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSexZdYudG4t4kxAAJBhrfNv2o0c-hEWq7gyNqy3Ny0ue73wpg/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t.footerFeedback}</a>
        </div>
      </footer>
    </div>
  );
}