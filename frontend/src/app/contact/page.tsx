import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← トップに戻る
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl prose prose-sm dark:prose-invert">
        <h1>お問い合わせ / Contact</h1>

        <p>
          Slide2Video に関するお問い合わせ、プライバシーに関するご相談、またはデータ削除のご依頼は、
          以下のメールアドレスまでご連絡ください。
        </p>
        <p>
          For inquiries regarding Slide2Video, privacy-related requests, or data deletion requests,
          please contact us at the email address below.
        </p>

        <ul>
          <li>
            Email:{" "}
            <a
              href="mailto:support@valueupdate.net"
              className="text-blue-600 hover:underline"
            >
              support@valueupdate.net
            </a>
          </li>
        </ul>

        <p>通常、内容を確認のうえ、必要に応じて対応いたします。</p>
        <p>We will review your inquiry and respond as appropriate.</p>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        <Link href="/" className="text-blue-600 hover:underline">
          ← トップに戻る / Back to Top
        </Link>
        <span className="mx-2">|</span>
        <Link href="/privacy/" className="text-blue-600 hover:underline">
          プライバシーポリシー / Privacy Policy
        </Link>
        <span className="mx-2">|</span>
        <Link href="/terms/" className="text-blue-600 hover:underline">
          利用規約 / Terms
        </Link>
      </footer>
    </div>
  );
}
