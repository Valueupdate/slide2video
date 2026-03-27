"use client";

import { useCallback, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import type { Translations } from "@/lib/i18n";

interface UploadAreaProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  disabled: boolean;
  t: Translations;
}

export function UploadArea({ file, onFileSelect, onRemoveFile, disabled, t }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
        onFileSelect(f);
      }
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [disabled, handleFile]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onClick = useCallback(() => {
    if (!disabled && inputRef.current) inputRef.current.click();
  }, [disabled]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(1) : "";

  if (file) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{fileSizeMB} MB</p>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={onRemoveFile}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={onInputChange}
      />
      <Card
        className={`p-8 border-2 border-dashed cursor-pointer transition-all text-center
          ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={onClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="font-medium">{t.uploadTitle}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.uploadSubtitle}</p>
          </div>
        </div>
      </Card>
    </>
  );
}
