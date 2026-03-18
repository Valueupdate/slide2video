import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slide2Video - PDFからプレゼン動画を自動生成",
  description: "スライドPDFをアップロードするだけで、AIがナレーション付きプレゼンテーション動画を自動生成します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
