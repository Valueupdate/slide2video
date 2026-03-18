"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DownloadViewProps {
  apiUrl: string;
  jobId: string;
  onReset: () => void;
}

export function DownloadView({ apiUrl, jobId, onReset }: DownloadViewProps) {
  const downloadUrl = `${apiUrl}/download/${jobId}`;

  return (
    <Card className="p-5 space-y-4">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-green-500/15 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold">動画の生成が完了しました</p>
        <p className="text-sm text-muted-foreground">
          ダウンロードリンクは約30分間有効です
        </p>
      </div>

      <div className="flex gap-3">
        <a href={downloadUrl} download className="flex-1">
          <Button className="w-full" size="lg">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            動画をダウンロード
          </Button>
        </a>
        <Button variant="secondary" size="lg" onClick={onReset}>
          新規作成
        </Button>
      </div>
    </Card>
  );
}
