"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef } from "react";
import type { LogEntry } from "@/app/page";
import type { Translations } from "@/lib/i18n";

interface ProgressViewProps {
  progress: number;
  logs: LogEntry[];
  isProcessing: boolean;
  errorMessage: string;
  t: Translations;
}

const STEP_LABELS_JA: Record<string, string> = {
  upload: "アップロード",
  pdf_parse: "PDF解析",
  script_gen: "台本生成",
  tts: "音声合成",
  video_render: "動画生成",
  done: "完了",
  error: "エラー",
};

const STEP_LABELS_EN: Record<string, string> = {
  upload: "Upload",
  pdf_parse: "PDF Parse",
  script_gen: "Script Gen",
  tts: "TTS",
  video_render: "Rendering",
  done: "Done",
  error: "Error",
};

export function ProgressView({ progress, logs, isProcessing, errorMessage, t }: ProgressViewProps) {
  const STEP_LABELS = t.processing === "処理中..." ? STEP_LABELS_JA : STEP_LABELS_EN;
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Card className="p-5 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">
            {isProcessing ? t.processing : errorMessage ? t.errorLabel : t.completed}
          </span>
          <span className="text-muted-foreground">{Math.max(0, progress)}%</span>
        </div>
        <Progress value={Math.max(0, progress)} className="h-2" />
      </div>

      <div className="bg-background rounded-md border border-border p-3 h-48 overflow-y-auto text-xs font-mono space-y-1">
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-2 ${log.step === "error" ? "text-destructive" : "text-muted-foreground"}`}>
            <span className="text-muted-foreground/60 shrink-0">
              {log.timestamp.toLocaleTimeString("ja-JP")}
            </span>
            <span className="text-primary/80 shrink-0">
              [{STEP_LABELS[log.step] || log.step}]
            </span>
            <span className={log.step === "error" ? "text-destructive" : "text-foreground"}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}
    </Card>
  );
}
