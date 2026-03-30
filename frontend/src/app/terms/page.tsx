import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← トップに戻る / Back to Top
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl prose prose-sm dark:prose-invert">
        <h1>利用規約・免責事項 / Terms of Service</h1>
        <p className="text-muted-foreground text-sm">
          最終更新日 / Last updated: 2026年3月30日
        </p>

        <h2>1. サービス概要 / Service Overview</h2>
        <p>
          Slide2Video（以下「本サービス」）は、PDFファイルからAIナレーション付きプレゼンテーション動画を自動生成する実験的なWebサービスです。本サービスは現状有姿（as-is）で提供され、動作の完全性・正確性・継続性を保証するものではありません。
        </p>
        <p>
          Slide2Video (the "Service") is an experimental web service that automatically generates AI-narrated presentation videos from PDF files. The Service is provided "as-is" without any warranty of completeness, accuracy, or continuity.
        </p>

        <h2>2. APIキーの取り扱い / API Key Handling</h2>
        <p>
          本サービスの利用にはユーザー自身のAI APIキー（Google Gemini、OpenAI、OpenRouter等）が必要です。入力されたAPIキーはサーバーに保存されず、動画生成リクエスト時の通信にのみ使用されます。APIキーの管理・漏洩防止はユーザー自身の責任とします。APIキーの利用に伴う料金はすべてユーザーの負担となります。
        </p>
        <p>
          Use of the Service requires the user's own AI API key (Google Gemini, OpenAI, OpenRouter, etc.). Entered API keys are never stored on the server and are used solely during video generation requests. Users are solely responsible for managing and protecting their API keys. All charges incurred through API key usage are the user's responsibility.
        </p>

        <h2>3. アップロードコンテンツの著作権 / Copyright of Uploaded Content</h2>
        <p>
          ユーザーがアップロードするPDFファイルの著作権・知的財産権に関する責任はユーザーに帰属します。第三者の著作物を許諾なくアップロードし動画を生成する行為は禁止します。本サービスはアップロードされたコンテンツの権利関係を確認する義務を負いません。
        </p>
        <p>
          Users are solely responsible for the copyright and intellectual property rights of uploaded PDF files. Uploading third-party copyrighted material without permission is prohibited. The Service has no obligation to verify the rights status of uploaded content.
        </p>

        <h2>4. AI生成コンテンツについて / AI-Generated Content</h2>
        <p>
          AIが生成する台本・ナレーションの内容は、元のスライドに基づいて自動生成されたものであり、正確性・適切性を保証するものではありません。生成されたコンテンツの利用に関する責任はユーザーに帰属します。商用利用する場合は、利用する各AIプロバイダーの利用規約もご確認ください。
        </p>
        <p>
          AI-generated scripts and narration are automatically created based on the original slides, and their accuracy or appropriateness is not guaranteed. Users are solely responsible for how they use generated content. For commercial use, please also review the terms of service of each AI provider used.
        </p>

        <h2>5. ボイスクローン機能について / Voice Clone Feature</h2>
        <p>
          ボイスクローン機能を使用する場合、アップロードする音声サンプルはユーザー本人の声、または権利者から明示的な許諾を得た声に限定してください。他人の声（声優、有名人等）を無断で複製・使用することは法律で禁止されている場合があります。音声の権利に関するトラブルについて、本サービスは一切の責任を負いません。
        </p>
        <p>
          When using the voice clone feature, uploaded audio samples must be the user's own voice or a voice for which explicit permission has been obtained from the rights holder. Unauthorized cloning or use of another person's voice (e.g., voice actors, celebrities) may be prohibited by law. The Service accepts no liability for any disputes related to voice rights.
        </p>

        <h2>6. YouTubeへの転送について / YouTube Transfer</h2>
        <p>
          本サービスはGoogle OAuthを通じてYouTubeへの動画転送機能を提供します。転送された動画は非公開として保存されます。YouTubeの利用規約および著作権ポリシーに従ってご利用ください。
        </p>
        <p>
          The Service provides YouTube video transfer functionality through Google OAuth. Transferred videos are saved as private. Please comply with YouTube's Terms of Service and copyright policies.
        </p>

        <h2>7. 各プロバイダーの利用規約 / Third-Party Terms</h2>
        <p>
          本サービスは以下の外部サービスを利用しています。ユーザーは各サービスの利用規約に従う責任があります。
          The Service uses the following external services. Users are responsible for complying with each service's terms.
        </p>
        <ul>
          <li><a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Gemini API Terms</a></li>
          <li><a href="https://openai.com/policies/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Terms of Use</a></li>
          <li><a href="https://openrouter.ai/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenRouter Terms</a></li>
          <li><a href="https://elevenlabs.io/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ElevenLabs Terms of Service</a></li>
          <li><a href="https://azure.microsoft.com/en-us/support/legal/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Azure Terms</a></li>
          <li><a href="https://cloud.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Terms</a></li>
          <li><a href="https://www.alibabacloud.com/help/en/legal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Alibaba Cloud (DashScope) Terms</a></li>
          <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">YouTube Terms of Service</a></li>
        </ul>

        <h2>8. データの保持と削除 / Data Retention and Deletion</h2>
        <p>
          アップロードされたPDFファイル、生成された音声・動画ファイルは一時的にサーバーに保存されますが、生成完了後30分以内に自動削除されます。ただし、通信障害やシステム障害により削除が遅延する場合があります。
        </p>
        <p>
          Uploaded PDF files and generated audio/video files are temporarily stored on the server but are automatically deleted within 30 minutes after generation. Deletion may be delayed due to communication or system failures.
        </p>

        <h2>9. 免責事項 / Disclaimer</h2>
        <p>
          本サービスの利用により生じたいかなる損害（APIキーの不正利用、著作権侵害、生成コンテンツによる損害等を含むがこれに限定されない）についても、本サービスの運営者は一切の責任を負いません。
        </p>
        <p>
          The operator of the Service accepts no liability for any damages arising from use of the Service, including but not limited to unauthorized use of API keys, copyright infringement, or damages caused by generated content.
        </p>

        <h2>10. 規約の変更 / Changes to Terms</h2>
        <p>
          本規約は予告なく変更される場合があります。変更後の規約は本ページに掲載された時点で効力を生じます。
        </p>
        <p>
          These terms may be changed without notice. Updated terms take effect when posted on this page.
        </p>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border space-y-1">
        <div>
          <Link href="/" className="text-blue-600 hover:underline">← トップに戻る / Back to Top</Link>
          <span className="mx-2">|</span>
          <Link href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー / Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
