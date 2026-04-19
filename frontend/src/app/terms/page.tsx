"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* ヘッダー */}
        <div className="mb-10">
          <a
            href="/"
            className="text-blue-400 hover:underline text-sm mb-4 inline-block"
          >
            ← ホームに戻る / Back to Home
          </a>
          <h1 className="text-3xl font-bold text-white mt-2">
            利用規約 <span className="text-gray-400 text-2xl font-normal">/ Terms of Service</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">最終更新日 / Last Updated：2026年3月 / March 2026</p>
        </div>

        {/* 前文 */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-8">
          <p className="text-gray-300 leading-relaxed mb-3">
            本利用規約（以下「本規約」）は、Slide2Video（以下「本サービス」）の利用条件を定めるものです。
            ユーザーは本規約に同意した上で本サービスを利用するものとします。
          </p>
          <p className="text-gray-500 leading-relaxed text-sm">
            These Terms of Service ("Terms") govern the use of Slide2Video ("the Service").
            By using the Service, users agree to these Terms.
          </p>
        </div>

        {/* 各条項 */}
        <div className="space-y-6">

          {/* 第1条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              著作権・権利関係 <span className="text-gray-500 font-normal text-base">/ Copyright & Rights</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              ユーザーがアップロードするPDFファイルおよびその内容に関する著作権はユーザー自身に帰属します。
              ユーザーは、アップロードするコンテンツについて適切な権利・許可を有していることを保証するものとします。
              本サービスによって生成された動画の著作権は、利用したAIサービスおよびTTSサービスの利用規約に従います。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              Copyright of uploaded PDF files and their contents remains with the user.
              Users warrant that they have appropriate rights and permissions for all uploaded content.
              Copyright of generated videos follows the terms of the AI and TTS services used.
            </p>
          </section>

          {/* 第2条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              AIによる生成コンテンツについて <span className="text-gray-500 font-normal text-base">/ AI-Generated Content</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              本サービスはAIを使用してナレーション原稿・音声・動画を生成します。
              生成されたコンテンツの正確性・完全性・適法性については保証しません。
              生成コンテンツの利用はユーザーの責任において行ってください。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              The Service uses AI to generate narration scripts, audio, and videos.
              We make no warranties regarding the accuracy, completeness, or legality of generated content.
              Use of generated content is at the user's own responsibility.
            </p>
          </section>

          {/* 第3条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              APIキーの利用と費用 <span className="text-gray-500 font-normal text-base">/ API Key Usage & Fees</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              本サービスはユーザー自身が取得したAPIキー（Google Gemini、OpenAI、ElevenLabsなど）を使用します。
              APIキーの利用に伴う費用はすべてユーザーの負担となります。
              本サービスはAPIキーをサーバーに長期保存しません（セッション中のみ使用）。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              The Service uses API keys obtained by the user (Google Gemini, OpenAI, ElevenLabs, etc.).
              All costs associated with API key usage are the user's responsibility.
              API keys are not stored long-term on our servers (used during the session only).
            </p>
          </section>

          {/* 第4条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              音声クローンの利用 <span className="text-gray-500 font-normal text-base">/ Voice Cloning</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              音声クローン機能を使用する場合、ユーザーは自分自身の音声または適切な許可を得た音声のみを使用するものとします。
              第三者の音声を無断で使用することは禁止します。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              When using the voice cloning feature, users may only use their own voice or recordings for which proper permission has been obtained.
              Unauthorized use of third-party voices is strictly prohibited.
            </p>
          </section>

          {/* 第5条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
              YouTubeへのアップロード <span className="text-gray-500 font-normal text-base">/ YouTube Upload</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              YouTube連携機能を使用する場合、ユーザーはYouTubeの利用規約に従う責任を負います。
              本サービスはユーザーの指示に基づいてのみ動画をアップロードします。
              アップロードされた動画の内容に関する責任はユーザーにあります。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              When using the YouTube integration feature, users are responsible for complying with YouTube's Terms of Service.
              The Service uploads videos only upon the user's explicit instruction.
              Users are solely responsible for the content of uploaded videos.
            </p>
          </section>

          {/* 第6条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
              データの保持について <span className="text-gray-500 font-normal text-base">/ Data Retention</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              アップロードされたPDFファイル、生成された音声ファイル、動画ファイルは一時的に保存され、
              生成完了後約30分で自動削除されます。
              障害等により削除が遅延する場合があります。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              Uploaded PDF files, generated audio files, and video files are stored temporarily and automatically deleted approximately 30 minutes after generation is complete.
              Deletion may be delayed due to system failures or other issues.
            </p>
          </section>

          {/* 第7条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
              処理時間とサービス可用性 <span className="text-gray-500 font-normal text-base">/ Processing Time & Availability</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              動画生成には通常3〜15分かかります。スライド数が多い場合やサーバー負荷が高い場合はさらに時間がかかることがあります。
              処理中にブラウザを閉じると生成が中断される場合があります。
              本サービスはメンテナンスや障害により予告なく停止する場合があります。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              Video generation typically takes 3–15 minutes. Processing time may increase with a higher number of slides or heavy server load.
              Closing the browser during processing may interrupt generation.
              The Service may be suspended without notice due to maintenance or system failures.
            </p>
          </section>

          {/* 第8条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">8</span>
              商用利用 <span className="text-gray-500 font-normal text-base">/ Commercial Use</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              本サービスで生成したコンテンツの商用利用は可能ですが、利用したAIプロバイダー（Google Gemini、OpenAIなど）および
              音声合成エンジン（ElevenLabs、Azure Speech、Google Cloud TTSなど）の利用規約に従う必要があります。
              プロバイダーによっては商用利用に追加ライセンスが必要な場合があります。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              Commercial use of content generated by the Service is permitted, but users must comply with the terms of the AI providers (Google Gemini, OpenAI, etc.) and TTS engines (ElevenLabs, Azure Speech, Google Cloud TTS, etc.) used.
              Some providers may require additional licenses for commercial use.
            </p>
          </section>

          {/* 第9条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">9</span>
              禁止事項 <span className="text-gray-500 font-normal text-base">/ Prohibited Activities</span>
            </h2>
            <ul className="space-y-3">
              {[
                ["他者を誹謗中傷・差別・脅迫するコンテンツの生成", "Generating content that defames, discriminates against, or threatens others"],
                ["フェイクニュース・虚偽情報・なりすましコンテンツの作成", "Creating fake news, false information, or impersonation content"],
                ["政治的な虚偽情報や選挙干渉を目的とした利用", "Using the Service for political misinformation or election interference"],
                ["未成年者に有害なコンテンツの生成", "Generating content harmful to minors"],
                ["APIキーの不正利用・転売", "Unauthorized use or resale of API keys"],
                ["サービスへの不正アクセス・サーバーへの過剰負荷", "Unauthorized access to the Service or excessive server load"],
                ["その他、法律または公序良俗に反する行為", "Any other activity violating laws or public morality"],
              ].map(([ja, en]) => (
                <li key={ja} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                  <span>
                    <span className="text-gray-300">{ja}</span>
                    <br />
                    <span className="text-gray-500 text-sm">{en}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 第10条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">10</span>
              未成年者の利用 <span className="text-gray-500 font-normal text-base">/ Minor Users</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              本サービスは主に18歳以上の方を対象としています。
              18歳未満の方が利用する場合は、保護者または法定代理人の同意を得てください。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              The Service is primarily intended for users aged 18 and over.
              Users under the age of 18 must obtain consent from a parent or legal guardian before using the Service.
            </p>
          </section>

          {/* 第11条 */}
          <section className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">11</span>
              準拠法・管轄裁判所 <span className="text-gray-500 font-normal text-base">/ Governing Law & Jurisdiction</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              本規約は日本法に準拠するものとします。
              本サービスに関する紛争については、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              These Terms shall be governed by and construed in accordance with the laws of Japan.
              Any disputes arising in connection with the Service shall be subject to the exclusive jurisdiction of the court having jurisdiction over the operator's location.
            </p>
          </section>

        </div>

        {/* フッター */}
        <div className="mt-10 pt-6 border-t border-gray-700 flex gap-6 text-sm text-gray-500">
          <a href="/" className="hover:text-gray-300">ホーム / Home</a>
          <a href="/privacy" className="hover:text-gray-300">プライバシーポリシー / Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
