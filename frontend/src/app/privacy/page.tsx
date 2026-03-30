import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← トップに戻る
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl prose prose-sm dark:prose-invert">
        <h1>プライバシーポリシー / Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">最終更新日 / Last updated: 2026年3月30日</p>

        <h2>1. 収集する情報 / Information We Collect</h2>
        <p>
          本サービス（Slide2Video）は、動画生成の処理に必要な以下の情報を一時的に処理します。
          We temporarily process the following information necessary for video generation.
        </p>
        <ul>
          <li>アップロードされたPDFファイル（処理後30分以内に自動削除）/ Uploaded PDF files (auto-deleted within 30 minutes after processing)</li>
          <li>AIプロバイダーのAPIキー（サーバーに保存されません）/ AI provider API keys (never stored on our servers)</li>
          <li>生成された音声・動画ファイル（処理後30分以内に自動削除）/ Generated audio and video files (auto-deleted within 30 minutes)</li>
        </ul>

        <h2>2. YouTubeデータの取り扱い / YouTube Data</h2>
        <p>
          本サービスはGoogle OAuthを通じてYouTubeアップロード機能を提供します。
          This service provides YouTube upload functionality through Google OAuth.
        </p>
        <ul>
          <li>取得するスコープ: <code>youtube.upload</code>（YouTube動画のアップロードのみ）/ Scope requested: <code>youtube.upload</code> (upload only)</li>
          <li>アクセストークンはアップロード完了後に即座に破棄されます / Access tokens are discarded immediately after upload</li>
          <li>YouTubeアカウントの情報はサーバーに保存されません / YouTube account information is never stored on our servers</li>
          <li>アップロードされた動画は非公開として保存されます / Uploaded videos are saved as private</li>
        </ul>
        <p>
          Google APIサービスの利用は <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Googleプライバシーポリシー</a> に従います。
          Use of Google API Services is subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Privacy Policy</a>.
        </p>

        <h2>3. 情報の利用目的 / Use of Information</h2>
        <p>
          収集した情報は動画生成サービスの提供のみに使用され、第三者への販売・提供は行いません。
          Collected information is used solely for providing the video generation service and is never sold or shared with third parties.
        </p>

        <h2>4. Cookieについて / Cookies</h2>
        <p>
          本サービスはGoogle Analytics（GA4）を使用してアクセス解析を行っています。
          This service uses Google Analytics (GA4) for access analysis.
          これにはCookieの使用が含まれます / This includes the use of cookies.
        </p>

        <h2>5. お問い合わせ / Contact</h2>
        <p>
          プライバシーに関するお問い合わせは、サービス内のフィードバックフォームよりご連絡ください。
          For privacy-related inquiries, please contact us through the feedback form in the service.
        </p>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        <Link href="/" className="text-blue-600 hover:underline">← トップに戻る / Back to Top</Link>
        <span className="mx-2">|</span>
        <Link href="/terms" className="text-blue-600 hover:underline">利用規約 / Terms</Link>
      </footer>
    </div>
  );
}
