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
  const [ttsProvider, setTtsProvider] = useState<string>("edge-tts");
  const [voice, setVoice] = useState<string>("ja-JP-NanamiNeural");
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [jobId, setJobId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "X-AI-Provider": aiProvider,
          "X-API-Key": apiKey,
        },
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
  }, [file, apiKey, aiProvider, ttsProvider, voice, API_URL, addLog]);

  const handleReset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setFile(null);
    setState("idle");
    setProgress(0);
    setLogs([]);
    setJobId("");
    setErrorMessage("");
  }, []);

  const canGenerate = state === "ready" && file !== null && apiKey.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            PDFからプレゼン動画を自動生成
          </h1>
          <p className="text-muted-foreground">
            スライドPDFをアップロードするだけ。AIがナレーション付き動画を作成します。
          </p>
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
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          ttsProvider={ttsProvider}
          onTtsProviderChange={setTtsProvider}
          voice={voice}
          onVoiceChange={setVoice}
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

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        Slide2Video — APIキーはサーバーに保存されません
      </footer>
    </div>
  );
}
