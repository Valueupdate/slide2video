"use client";

import { useState, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { UploadArea } from "@/components/UploadArea";
import { SettingsForm } from "@/components/SettingsForm";
import { ProgressView } from "@/components/ProgressView";
import { DownloadView } from "@/components/DownloadView";

export type AppState = "idle" | "ready" | "processing" | "done" | "error";

export interface LogEntry {
  step: string;
  message: string;
  timestamp: Date;
}

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [aiProvider, setAiProvider] = useState<string>("gemini");
  const [apiKey, setApiKey] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("google/gemini-2.5-flash");
  const [ttsProvider, setTtsProvider] = useState<string>("edge-tts");
  const [voice, setVoice] = useState<string>("ja-JP-NanamiNeural");
  const [slideDuration, setSlideDuration] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [dashscopeKey, setDashscopeKey] = useState<string>("");
  const [voiceSample, setVoiceSample] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [jobId, setJobId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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

    try {
      addLog("upload", "PDFをアップロード中...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("voice", voice);
      formData.append("tts_provider", ttsProvider);
      formData.append("slide_duration", String(slideDuration));
      formData.append("aspect_ratio", aspectRatio);

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
      if (ttsProvider === "qwen-clone" && dashscopeKey) {
        headers["X-DashScope-Key"] = dashscopeKey;
      }

      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "アップロードに失敗しました");
      }

      const data = await res.json();
      const currentJobId = data.job_id;
      setJobId(currentJobId);
      addLog("upload", `ジョブ開始: ${currentJobId}`);

      const abort = new AbortController();
      abortRef.current = abort;

      const eventRes = await fetch(`${API_URL}/progress/${currentJobId}`, {
        signal: abort.signal,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!eventRes.ok || !eventRes.body) {
        throw new Error("進捗の取得に失敗しました");
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
              return;
            }
            if (event.step === "error") {
              throw new Error(event.message || "処理中にエラーが発生しました");
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "不明なエラー";
      setErrorMessage(message);
      addLog("error", message);
      setState("error");
    }
  }, [file, apiKey, aiProvider, aiModel, ttsProvider, voice, slideDuration, aspectRatio, dashscopeKey, voiceSample, API_URL, addLog]);

  const handleReset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setFile(null);
    setState("idle");
    setProgress(0);
    setLogs([]);
    setJobId("");
    setErrorMessage("");
  }, []);

  const canGenerate = (() => {
    if (state !== "ready" || !file || !apiKey) return false;
    if (ttsProvider === "qwen-clone" && (!dashscopeKey || !voiceSample)) return false;
    return true;
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            スライドに声を、PDFに命を。
          </h1>
          <p className="text-muted-foreground">
            AIナレーション × 自動動画生成。あなたのPDFが、プロ品質のプレゼン動画になります。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "🎓", title: "教育・研修", desc: "授業資料をオンデマンド教材に" },
            { icon: "💼", title: "営業・提案", desc: "提案書を動画で開封率アップ" },
            { icon: "📱", title: "SNS配信", desc: "縦型対応でShorts/Reelsに投稿" },
            { icon: "🏢", title: "社内共有", desc: "手順書や議事録を動画で伝達" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-card px-3 py-2 flex items-center gap-3"
            >
              <div className="text-2xl shrink-0">{item.icon}</div>
              <div>
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <UploadArea
          file={file}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          disabled={state === "processing"}
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
          slideDuration={slideDuration}
          onSlideDurationChange={setSlideDuration}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          dashscopeKey={dashscopeKey}
          onDashscopeKeyChange={setDashscopeKey}
          voiceSample={voiceSample}
          onVoiceSampleChange={setVoiceSample}
          disabled={state === "processing"}
        />

        {(state === "idle" || state === "ready") && (
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full py-3 rounded-lg font-semibold text-base transition-all
              bg-primary text-primary-foreground hover:opacity-90
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            動画を生成する
          </button>
        )}

        {(state === "processing" || state === "done" || state === "error") && (
          <ProgressView
            progress={progress}
            logs={logs}
            isProcessing={state === "processing"}
            errorMessage={errorMessage}
          />
        )}

        {state === "done" && jobId && (
          <DownloadView
            apiUrl={API_URL}
            jobId={jobId}
            onReset={handleReset}
          />
        )}

        {state === "error" && (
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-lg font-semibold text-base
              bg-secondary text-secondary-foreground hover:opacity-90"
          >
            最初からやり直す
          </button>
        )}
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border space-y-1">
        <div>Slide2Video — スライドに声を、PDFに命を。</div>
        <div className="text-xs">APIキーはサーバーに保存されません。生成した動画は30分後に自動削除されます。</div>
      </footer>
    </div>
  );
}
