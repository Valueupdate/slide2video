"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Translations } from "@/lib/i18n";

interface DownloadViewProps {
  apiUrl: string;
  jobId: string;
  onReset: () => void;
  onRegenerate: () => void;
  t: Translations;
  initialYoutubeVideoId?: string | null;
}

export function DownloadView({ apiUrl, jobId, onReset, onRegenerate, t, initialYoutubeVideoId = null }: DownloadViewProps) {
  const downloadUrl = `${apiUrl}/download/${jobId}`;
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(initialYoutubeVideoId);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState("");
  const [showYoutubeHint, setShowYoutubeHint] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleYoutubeTransfer = async () => {
    setYoutubeLoading(true);
    setYoutubeError("");
    try {
      const res = await fetch(`${apiUrl}/youtube/upload/${jobId}`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "転送に失敗しました");
      }
      // auth_url が返ってきた場合は OAuth 認証へリダイレクト
      if (data.auth_url) {
        window.location.href = data.auth_url;
        return;
      }
      if (data.video_id) {
        setYoutubeVideoId(data.video_id);
      }
    } catch (e) {
      setYoutubeError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setYoutubeLoading(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-green-500/15 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold">{t.downloadComplete}</p>
        <p className="text-sm text-muted-foreground">{t.downloadNote}</p>
      </div>

      {/* インラインプレビュープレイヤー */}
      <video
        src={downloadUrl}
        controls
        className="w-full rounded-lg bg-black"
        style={{ maxHeight: "240px" }}
      />

      {/* ダウンロード・新規作成ボタン */}
      <div className="flex gap-3">
        <a
          href={downloadUrl}
          download
          className="flex-1"
          onClick={() => setDownloaded(true)}
        >
          <Button className={`w-full ${downloaded ? "bg-green-600 hover:bg-green-700" : ""}`} size="lg">
            {downloaded ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t.downloadedButton}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t.downloadButton}
              </>
            )}
          </Button>
        </a>
        <Button variant="secondary" size="lg" onClick={onReset}>
          {t.newGeneration}
        </Button>
      </div>

      {/* 再生成ボタン */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
        <p className="text-xs text-muted-foreground text-center">{t.regenerateNote}</p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            if (downloaded || window.confirm(t.regenerateConfirm)) {
              onRegenerate();
            }
          }}
        >
          {t.regenerateButton}
        </Button>
      </div>

      {/* YouTube転送セクション */}
      {!youtubeVideoId ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <button
            type="button"
            onClick={() => setShowYoutubeHint(!showYoutubeHint)}
            className="w-full text-left flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              {t.youtubeTransfer}
            </span>
            <svg
              className={`w-3 h-3 transition-transform ${showYoutubeHint ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showYoutubeHint && (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-yellow-500/80">{t.youtubeTransferComingSoon}</p>
              <p className="text-xs text-muted-foreground">{t.youtubeTransferNote}</p>
              {youtubeError && (
                <p className="text-xs text-destructive">{youtubeError}</p>
              )}
              <Button
                variant="outline"
                className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
                onClick={handleYoutubeTransfer}
                disabled={youtubeLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                {youtubeLoading ? "転送中..." : t.youtubeTransfer}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* YouTube転送完了 */
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 space-y-2">
          <p className="text-sm font-medium text-green-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {t.youtubeTransferComplete}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            https://www.youtube.com/watch?v={youtubeVideoId}
          </p>
          <p className="text-xs text-muted-foreground">{t.youtubeTransferPrivateNote}</p>
          <div className="flex gap-2">
            <a
              href={`https://studio.youtube.com/video/${youtubeVideoId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full text-xs">
                {t.youtubeStudioButton}
              </Button>
            </a>
            <a
              href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full text-xs">
                {t.youtubeWatchButton}
              </Button>
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}
