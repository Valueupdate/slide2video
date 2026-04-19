import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← トップに戻る
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl prose prose-sm dark:prose-invert">
        <h1>プライバシーポリシー / Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">
          最終更新日 / Last updated: 2026年4月7日
        </p>

        <p>
          Slide2Video（以下「本サービス」）は、ユーザーがアップロードしたPDFからAIナレーション付き動画を生成し、
          ユーザーが希望した場合に限り、生成された動画をユーザー本人のYouTubeアカウントへアップロードできるWebサービスです。
          本ポリシーは、本サービスがどのような情報を取得・利用・保存・共有・削除するかを説明するものです。
        </p>
        <p>
          Slide2Video ("the Service") is a web service that generates AI-narrated videos from user-uploaded PDF files and,
          only when explicitly initiated by the user, uploads the generated video to the user’s own YouTube account.
          This Privacy Policy explains what information we access, use, store, share, protect, and delete.
        </p>

        <h2>1. 収集・処理する情報 / Information We Process</h2>
        <p>
          本サービスは、動画生成およびYouTubeアップロード機能の提供に必要な範囲で、以下の情報を一時的に処理します。
        </p>
        <p>
          The Service temporarily processes the following information only as necessary to provide video generation and YouTube upload features.
        </p>

        <h3>1-1. ユーザーがアップロードするコンテンツ / User Uploaded Content</h3>
        <ul>
          <li>アップロードされたPDFファイル / Uploaded PDF files</li>
          <li>生成された音声ファイル / Generated audio files</li>
          <li>生成された動画ファイル / Generated video files</li>
        </ul>

        <h3>1-2. AIプロバイダー関連情報 / AI Provider Information</h3>
        <ul>
          <li>
            ユーザーが入力したAI APIキー（Google Gemini、OpenAI、OpenRouter等） /
            AI API keys entered by the user (such as Google Gemini, OpenAI, OpenRouter, etc.)
          </li>
        </ul>

        <h3>1-3. Google OAuth / YouTube連携情報 / Google OAuth / YouTube Integration Data</h3>
        <p>
          本サービスは、ユーザーが明示的にYouTubeアップロード機能を実行した場合に限り、
          Google OAuth を利用して YouTube への動画アップロード機能を提供します。
          この際、本サービスは Google OAuth スコープ <code>youtube.upload</code> を使用します。
        </p>
        <p>
          The Service provides optional YouTube upload functionality via Google OAuth only when explicitly initiated by the user through the YouTube upload feature.
          For this purpose, the Service requests the Google OAuth scope <code>youtube.upload</code>.
        </p>

        <h2>2. Googleユーザーデータの取得内容 / Google User Data Accessed</h2>
        <p>
          本サービスが Google API を通じてアクセスするGoogleユーザーデータは、
          YouTubeへの動画アップロードに必要な範囲に厳格に限定されます。
        </p>
        <p>
          The Google user data accessed by the Service is strictly limited to what is required to upload a video to YouTube.
        </p>

        <h3>2-1. 本サービスがアクセスするもの / What We Access</h3>
        <ul>
          <li>
            <code>youtube.upload</code> スコープに基づく、ユーザー本人のYouTubeアカウントへの動画アップロード権限 /
            Authorization required to upload a video to the user’s own YouTube account, based on the <code>youtube.upload</code> scope
          </li>
        </ul>

        <h3>2-2. 本サービスがアクセスしないもの / What We Do Not Access</h3>
        <p>本サービスは、以下のGoogleユーザーデータにはアクセスしません。</p>
        <p>The Service does not access the following Google user data:</p>
        <ul>
          <li>Gmail データ / Gmail data</li>
          <li>Google Drive データ / Google Drive data</li>
          <li>Google Calendar データ / Google Calendar data</li>
          <li>Google Contacts データ / Google Contacts data</li>
          <li>Googleプロフィール情報の恒久保存 / permanent storage of Google profile information</li>
          <li>YouTubeチャンネル情報の恒久保存 / permanent storage of YouTube channel information</li>
        </ul>

        <h2>3. 情報の利用目的 / How We Use Information</h2>
        <p>
          本サービスが収集または処理する情報は、以下の目的のためにのみ使用されます。
        </p>
        <p>
          The information we collect or process is used only for the following purposes.
        </p>

        <h3>3-1. 動画生成 / Video Generation</h3>
        <ul>
          <li>アップロードされたPDFを解析するため / To analyze uploaded PDF files</li>
          <li>AIによりナレーション台本を生成するため / To generate narration scripts using AI</li>
          <li>音声合成および動画生成を行うため / To synthesize audio and generate videos</li>
        </ul>

        <h3>3-2. YouTubeアップロード / YouTube Upload</h3>
        <ul>
          <li>
            ユーザーが明示的に実行した操作に基づき、生成された動画をユーザー本人のYouTubeアカウントへアップロードするため /
            To upload a generated video to the user’s own YouTube account, only when explicitly requested by the user
          </li>
        </ul>

        <h3>3-3. アクセス解析 / Analytics</h3>
        <ul>
          <li>
            サービス改善のため、Google Analytics（GA4）を用いてアクセス状況を把握するため /
            To understand usage patterns for service improvement through Google Analytics (GA4)
          </li>
        </ul>

        <h2>4. Googleユーザーデータの利用方法 / How We Use Google User Data</h2>
        <p>
          Google OAuth により取得した認可情報は、ユーザーが本サービス上で生成した動画を、
          ユーザーの明示的な指示に基づいてユーザー本人のYouTubeアカウントへアップロードする目的のみに使用されます。
          本サービスは、動画を自動的にYouTubeへアップロードしません。
          アップロードは、ユーザーがYouTubeアップロード機能を選択し、Google OAuth同意フローを完了した場合にのみ行われます。
          アップロードされる動画は非公開として登録されます。
        </p>
        <p>
          Authorization obtained through Google OAuth is used only to upload a video generated by the Service
          to the user’s own YouTube account, based on the user’s explicit instruction.
          The Service does not upload videos to YouTube automatically.
          Upload occurs only after the user explicitly selects the YouTube upload function and completes the Google OAuth consent flow.
          Uploaded videos are set to private.
        </p>

        <p>本サービスは、Googleユーザーデータを以下の目的では使用しません。</p>
        <p>The Service does not use Google user data for:</p>
        <ul>
          <li>広告配信 / advertising</li>
          <li>マーケティングプロファイリング / marketing profiling</li>
          <li>第三者への販売 / sale to third parties</li>
          <li>AI/機械学習モデルの学習 / AI or machine learning model training</li>
          <li>ユーザーが明示的に実行していないGoogleサービス操作 / actions on Google services not explicitly initiated by the user</li>
        </ul>

        <p>
          また、Googleユーザーデータは、セキュリティ確保、不正防止、法令遵守、またはユーザーの明示的同意がある場合を除き、
          人が内容にアクセスすることはありません。
        </p>
        <p>
          In addition, Google user data is not accessed by humans except when necessary for security, fraud prevention,
          legal compliance, or with the user’s explicit consent.
        </p>

        <h2>5. 情報の保存・保護 / Data Storage and Protection</h2>

        <h3>5-1. AI APIキー / AI API Keys</h3>
        <p>
          ユーザーが入力したAI APIキーは、動画生成リクエストの処理時にサーバーのメモリ上でのみ一時的に保持され、
          処理完了後は直ちにメモリから解放されます。
          データベース、ログファイル、またはその他の永続的なストレージに保存されることは一切ありません。
          また、当該キーは、ユーザーが選択したAIプロバイダーに対して動画生成に必要な範囲でのみ送信され、
          他の目的には使用されません。
        </p>
        <p>
          AI API keys entered by users are temporarily held in server memory only during the video generation request and are immediately released from memory upon completion.
          They are never written to any database, log file, or other persistent storage.
          These keys are transmitted only to the AI provider selected by the user and only to the extent necessary to generate scripts, audio, or video content.
          They are not used for any other purpose.
        </p>

        <h3>5-2. Google OAuth認可情報 / Google OAuth Authorization Data</h3>
        <p>
          Google OAuth により取得したアクセストークンは、以下の通り厳格に取り扱われます。
        </p>
        <ul>
          <li>アクセストークンはサーバーのメモリ上でのみ一時的に保持され、データベースやファイルに書き込まれません。</li>
          <li>YouTubeへのアップロード処理が完了した時点で、アクセストークンへの参照は即座に破棄されます。</li>
          <li>本サービスはリフレッシュトークンを取得・保存しません（OAuth認可時に <code>access_type=online</code> を指定しているため）。</li>
          <li>Googleアカウントのメールアドレス、プロフィール情報、YouTubeチャンネル情報は収集・保存しません。</li>
        </ul>
        <p>
          Google OAuth access tokens are handled as follows:
        </p>
        <ul>
          <li>Access tokens are held only in server memory and are never written to any database or file.</li>
          <li>Upon completion of the YouTube upload process, all references to the access token are immediately discarded.</li>
          <li>The Service does not obtain or store refresh tokens (the OAuth authorization specifies <code>access_type=online</code>).</li>
          <li>Google account email addresses, profile information, and YouTube channel information are not collected or stored.</li>
        </ul>

        <h3>5-3. サーバーの所在・セキュリティ / Server Location and Security</h3>
        <p>
          本サービスのバックエンドサーバーは日本国内のVPS（仮想プライベートサーバー）上で運用されています。
          通信はすべてTLS（HTTPS）により暗号化されます。
          アップロードされたPDFファイルおよび生成ファイルはサーバーの一時ディレクトリに保存され、
          ジョブ完了後30分以内に自動削除されます。
          不正アクセス、漏えい、改ざん、または不適切な利用を防止するため、ファイアウォール設定および
          定期的なセキュリティアップデートを含む合理的な安全管理措置を講じます。
        </p>
        <p>
          The Service's backend server operates on a VPS (Virtual Private Server) located in Japan.
          All communications are encrypted using TLS (HTTPS).
          Uploaded PDF files and generated files are stored in a temporary server directory and automatically deleted within 30 minutes of job completion.
          We implement reasonable security measures including firewall configuration and regular security updates to help prevent unauthorized access, disclosure, alteration, or misuse.
        </p>

        <h2>6. 第三者共有 / Data Sharing</h2>
        <p>
          本サービスは、取得した情報を第三者へ販売、貸与、提供、または共有しません。
          ただし、以下の場合を除きます。
        </p>
        <p>
          The Service does not sell, rent, provide, or share collected information with third parties, except in the following cases.
        </p>

        <h3>6-1. 例外 / Exceptions</h3>
        <ul>
          <li>
            ユーザーが明示的に選択したAIプロバイダーに対して、動画生成に必要な範囲でデータを送信する場合 /
            When data must be sent to an AI provider explicitly selected by the user, solely as necessary to generate the video
          </li>
          <li>
            ユーザーが明示的に実行した YouTube アップロードのために Google API を利用する場合 /
            When Google APIs are used solely to upload a video to YouTube at the user’s explicit request
          </li>
          <li>法令に基づき開示が必要な場合 / When disclosure is required by law</li>
        </ul>

        <p>
          Googleユーザーデータについて、本サービスは第三者への販売・共有・移転を行いません。
          Googleユーザーデータは、ユーザーが明示的に要求した YouTube アップロード機能の実行のためにのみ使用されます。
        </p>
        <p>
          With respect to Google user data, the Service does not sell, share, or transfer such data to third parties.
          Google user data is used solely for the YouTube upload function explicitly requested by the user.
        </p>

        <h2>7. 保持期間と削除 / Data Retention and Deletion</h2>

        <h3>7-1. アップロードPDF・生成ファイル / Uploaded PDFs and Generated Files</h3>
        <p>
          アップロードされたPDFファイル、生成された音声ファイルおよび動画ファイルは、一時的にサーバー上に保存され、
          ジョブ作成後おおむね30分以内を目安に自動削除されます。
          ただし、通信障害やシステム障害により削除が遅延する場合があります。
        </p>
        <p>
          Uploaded PDF files and generated audio/video files are temporarily stored on the server and are automatically deleted approximately within 30 minutes from job creation.
          Deletion may be delayed due to communication or system failures.
        </p>

        <h3>7-2. Google OAuth認可情報 / Google OAuth Authorization Data</h3>
        <p>
          Google OAuth により取得したアクセストークンは、YouTubeアップロード処理中に一時的にのみ使用され、永続的には保存されません。
        </p>
        <p>
          Access tokens obtained through Google OAuth are used temporarily during the YouTube upload process and are not permanently stored.
        </p>

        <h3>7-3. 削除依頼 / Deletion Requests</h3>
        <p>
          ユーザーが本サービスに関連するデータの削除やプライバシーに関する問い合わせを希望する場合は、
          以下の手順でご連絡ください。
        </p>
        <ol>
          <li>下記メールアドレスまたはお問い合わせページから、件名に「データ削除依頼」と記載してご連絡ください。</li>
          <li>本サービスは受信後、<strong>30日以内</strong>に内容を確認のうえ対応いたします。</li>
          <li>なお、本サービスはユーザーデータを原則として永続保存しないため、削除対象のデータが存在しない場合があります。その場合はその旨をご回答いたします。</li>
        </ol>
        <p>
          If a user wishes to request deletion of data related to the Service or has a privacy-related inquiry,
          please follow the steps below:
        </p>
        <ol>
          <li>Contact us via the email address or contact page below, with the subject line "Data Deletion Request".</li>
          <li>We will review your request and respond within <strong>30 days</strong> of receipt.</li>
          <li>Since the Service does not permanently store user data as a general rule, there may be no retained data to delete. In such cases, we will inform you accordingly.</li>
        </ol>

        <h2>8. Cookieとアクセス解析 / Cookies and Analytics</h2>
        <p>
          本サービスは、Google Analytics（GA4）を使用してアクセス解析を行っています。
          これにはCookieまたは類似技術が使用される場合があります。
          収集される情報は、サービス改善および利用状況把握のために使用されます。
        </p>
        <p>
          The Service uses Google Analytics (GA4) for traffic analysis.
          This may involve the use of cookies or similar technologies.
          Collected information is used to improve the Service and understand usage patterns.
        </p>

        <h2>9. Google API Services User Data Policy への準拠 / Compliance with Google API Services User Data Policy</h2>
        <p>
          本サービスによる Google API から受領した情報の利用および他アプリへの移転は、
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google API Services User Data Policy
          </a>
          （Limited Use 要件を含む）に従います。
        </p>
        <p>
          The Service’s use and transfer of information received from Google APIs will adhere to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>

        <h2>10. ポリシーの変更 / Changes to This Policy</h2>
        <p>
          本ポリシーは、必要に応じて予告なく改訂される場合があります。
          変更後の内容は、本ページに掲載された時点で効力を生じます。
        </p>
        <p>
          This Privacy Policy may be updated without prior notice as necessary.
          Changes take effect when posted on this page.
        </p>

        <h2>11. お問い合わせ / Contact</h2>
        <p>
          プライバシーに関するお問い合わせ、またはデータ削除に関するご相談は、
          以下の連絡先またはお問い合わせページよりご連絡ください。
        </p>
        <p>
          For privacy-related inquiries or data deletion requests, please contact us using the contact details below or via the contact page.
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
          <li>
            Contact page:{" "}
            <a
              href="https://slide2video.valueupdate.net/contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://slide2video.valueupdate.net/contact/
            </a>
          </li>
        </ul>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        <Link href="/" className="text-blue-600 hover:underline">
          ← トップに戻る / Back to Top
        </Link>
        <span className="mx-2">|</span>
        <Link href="/terms/" className="text-blue-600 hover:underline">
          利用規約 / Terms
        </Link>
      </footer>
    </div>
  );
}
