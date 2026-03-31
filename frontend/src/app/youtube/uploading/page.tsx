"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UploadingContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job_id") || "";
  const [status, setStatus] = useState<"uploading" | "done" | "error">("uploading");
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/youtube/status/${jobId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const data = await res.json();

        if (data.status === "done" && data.video_id) {
          setStatus("done");
          // 完了後にフロントにリダイレクト
          window.location.href = `/?youtube_video_id=${data.video_id}&job_id=${jobId}`;
        } else if (data.status === "error") {
          setStatus("error");
          setErrorMessage(data.error || "アップロードに失敗しました");
        }
        // uploading 中は継続ポーリング
      } catch {
        // ネットワークエラーは無視して継続
      }
    };

    // 2秒ごとにポーリング
    const interval = setInterval(poll, 2000);
    poll(); // 初回即時実行

    return () => clearInterval(interval);
  }, [jobId, API_URL]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-sm mx-auto">
        {status === "uploading" && (
          <>
            <div className="w-16 h-16 mx-auto">
              <svg className="w-16 h-16 text-red-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                YouTube にアップロード中...
              </h1>
              <p className="text-sm text-muted-foreground">
                動画をアップロードしています。しばらくお待ちください。
              </p>
              <p className="text-xs text-muted-foreground">
                このページはそのままにしておいてください。
              </p>
            </div>
            {/* ローディングバー */}
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-red-500 rounded-full animate-[loading_2s_ease-in-out_infinite]"
                style={{
                  animation: "pulse 2s ease-in-out infinite",
                  width: "60%",
                  margin: "0 auto",
                }}
              />
            </div>
          </>
        )}

        {status === "done" && (
          <>
            <div className="w-16 h-16 mx-auto bg-green-500/15 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                アップロード完了！
              </h1>
              <p className="text-sm text-muted-foreground">
                元の画面に戻っています...
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto bg-destructive/15 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                アップロードに失敗しました
              </h1>
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
            <a
              href="/"
              className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              元の画面に戻る
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function YouTubeUploadingPage() {
  return (
    <Suspense>
      <UploadingContent />
    </Suspense>
  );
}
