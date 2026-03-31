"use client";

import { useState, useEffect, useRef } from "react";
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
  const [showYoutubeModal, setShowYoutubeModal] = useState(!!initialYoutubeVideoId);
  const [isPollingYoutube, setIsPollingYoutube] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // YouTube アップロード完了をポーリングで監視（別タブで認証した場合）
  useEffect(() => {
    if (!isPollingYoutube) return;

    const poll = async () => {
      try {
        const res = await fetch(`${apiUrl}/youtube/status/${jobId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const data = await res.json();
        if (data.status === "done" && data.video_id) {
          setYoutubeVideoId(data.video_id);
          setShowYoutubeModal(true);
          setIsPollingYoutube(false);
          setYoutubeLoading(false);
        } else if (data.status === "error") {
          setYoutubeError(data.error || "アップロードに失敗しました");
          setIsPollingYoutube(false);
          setYoutubeLoading(false);
        }
      } catch {
        // ネットワークエラーは無視して継続
      }
    };

    pollingRef.current = setInterval(poll, 2000);
    poll(); // 初回即時実行

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isPollingYoutube, apiUrl, jobId]);

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
      // auth_url が返ってきた場合は OAuth 認証を別タブで開き、
      // 元のタブはポーリングで完了を待つ（リダイレクトしない）
      if (data.auth_url) {
        window.open(data.auth_url, "_blank", "noopener,noreferrer");
        setIsPollingYoutube(true);
        return;
      }
      if (data.video_id) {
        setYoutubeVideoId(data.video_id);
        setShowYoutubeModal(true);
      }
    } catch (e) {
      setYoutubeError(e instanceof Error ? e.message : "エラーが発生しました");
      setYoutubeLoading(false);
    }
  };

  return (
    <>
      {/* YouTube完了モーダル */}
      {showYoutubeModal && youtubeVideoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-green-500/15 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">{t.youtubeTransferComplete}</h2>
              <p className="text-xs text-muted-foreground font-mono break-all">
                https://www.youtube.com/watch?v={youtubeVideoId}
              </p>
              <p className="text-xs text-muted-foreground">{t.youtubeTransferPrivateNote}</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`https://studio.youtube.com/video/${youtubeVideoId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowYoutubeModal(false)}
              >
                <button className="w-full py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  {t.youtubeStudioButton}
                </button>
              </a>
              <button
                onClick={() => setShowYoutubeModal(false)}
                className="w-full py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.youtubeModalClose}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube ポーリング中の表示 */}
      {isPollingYoutube && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto">
                <svg className="w-14 h-14 text-red-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold">YouTube にアップロード中...</h2>
              <p className="text-sm text-muted-foreground">
                別タブで Google アカウントの認証を完了してください。
              </p>
              <p className="text-xs text-muted-foreground">
                認証が完了すると自動的にアップロードが開始されます。
              </p>
            </div>
            <button
              onClick={() => {
                setIsPollingYoutube(false);
                setYoutubeLoading(false);
              }}
              className="w-full py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

    <Card className="p-5 space-y-4">
      {/* 完了メッセージ */}
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

      {/* 保存・共有セクション */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.saveShareSection}</p>
        <div className="flex gap-3">
          {/* ダウンロードボタン */}
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

          {/* 共有ボタン */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowYoutubeHint(!showYoutubeHint)}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {t.shareButton}
          </Button>
        </div>

        {/* 共有先メニュー */}
        {showYoutubeHint && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
            {!youtubeVideoId ? (
              <>
                <p className="text-xs font-medium text-muted-foreground">{t.shareDestination}</p>
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
                  {youtubeLoading ? t.sharingInProgress : t.youtubeTransfer}
                </Button>
              </>
            ) : (
              /* YouTube共有完了 */
              <div className="space-y-2">
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
                  <a href={`https://studio.youtube.com/video/${youtubeVideoId}/edit`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">{t.youtubeStudioButton}</Button>
                  </a>
                  <a href={`https://www.youtube.com/watch?v=${youtubeVideoId}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">{t.youtubeWatchButton}</Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 次の動画を作るセクション */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.nextVideoSection}</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRegenerate}
          >
            {t.regenerateButton}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onReset}>
            {t.newGeneration}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">{t.regenerateNote}</p>
      </div>
    </Card>
    </>
  );
}
