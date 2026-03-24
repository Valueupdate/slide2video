import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← トップに戻る
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl prose prose-sm dark:prose-invert">
        <h1>利用規約・免責事項</h1>
        <p className="text-muted-foreground text-sm">最終更新日: 2026年3月22日</p>

        <h2>1. サービス概要</h2>
        <p>
          Slide2Video（以下「本サービス」）は、PDFファイルからAIナレーション付きプレゼンテーション動画を
          自動生成する実験的なWebサービスです。本サービスは現状有姿（as-is）で提供され、
          動作の完全性・正確性・継続性を保証するものではありません。
        </p>

        <h2>2. APIキーの取り扱い</h2>
        <p>
          本サービスの利用にはユーザー自身のAI APIキー（Google Gemini、OpenAI、OpenRouter等）が必要です。
          入力されたAPIキーはサーバーに保存されず、動画生成リクエスト時の通信にのみ使用されます。
          APIキーの管理・漏洩防止はユーザー自身の責任とします。
          APIキーの利用に伴う料金はすべてユーザーの負担となります。
        </p>

        <h2>3. アップロードコンテンツの著作権</h2>
        <p>
          ユーザーがアップロードするPDFファイルの著作権・知的財産権に関する責任はユーザーに帰属します。
          第三者の著作物を許諾なくアップロードし動画を生成する行為は禁止します。
          本サービスはアップロードされたコンテンツの権利関係を確認する義務を負いません。
        </p>

        <h2>4. AI生成コンテンツについて</h2>
        <p>
          AIが生成する台本・ナレーションの内容は、元のスライドに基づいて自動生成されたものであり、
          正確性・適切性を保証するものではありません。
          生成されたコンテンツの利用に関する責任はユーザーに帰属します。
          商用利用する場合は、利用する各AIプロバイダーの利用規約もご確認ください。
        </p>

        <h2>5. ボイスクローン機能について</h2>
        <p>
          ボイスクローン機能を使用する場合、アップロードする音声サンプルは
          ユーザー本人の声、または権利者から明示的な許諾を得た声に限定してください。
          他人の声（声優、有名人等）を無断で複製・使用することは法律で禁止されている場合があります。
          音声の権利に関するトラブルについて、本サービスは一切の責任を負いません。
        </p>

        <h2>6. 各プロバイダーの利用規約</h2>
        <p>
          本サービスは以下の外部サービスを利用しています。
          ユーザーは各サービスの利用規約に従う責任があります。
        </p>
        <ul>
          <li><a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Gemini API 利用規約</a></li>
          <li><a href="https://openai.com/policies/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI 利用規約</a></li>
          <li><a href="https://openrouter.ai/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenRouter 利用規約</a></li>
          <li><a href="https://elevenlabs.io/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ElevenLabs 利用規約</a></li>
          <li><a href="https://azure.microsoft.com/en-us/support/legal/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Azure 利用規約</a></li>
          <li><a href="https://cloud.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud 利用規約</a></li>
          <li><a href="https://www.alibabacloud.com/help/en/legal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Alibaba Cloud（DashScope）利用規約</a></li>
        </ul>

        <h2>7. データの保持と削除</h2>
        <p>
          アップロードされたPDFファイル、生成された音声・動画ファイルは一時的にサーバーに保存されますが、
          生成完了後30分以内に自動削除されます。
          ただし、通信障害やシステム障害により削除が遅延する場合があります。
        </p>

        <h2>8. 免責事項</h2>
        <p>
          本サービスの利用により生じたいかなる損害（APIキーの不正利用、著作権侵害、
          生成コンテンツによる損害等を含むがこれに限定されない）についても、
          本サービスの運営者は一切の責任を負いません。
        </p>

        <h2>9. 規約の変更</h2>
        <p>
          本規約は予告なく変更される場合があります。
          変更後の規約は本ページに掲載された時点で効力を生じます。
        </p>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        <Link href="/" className="text-blue-600 hover:underline">← トップに戻る</Link>
      </footer>
    </div>
  );
}
