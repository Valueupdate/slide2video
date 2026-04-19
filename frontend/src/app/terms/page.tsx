"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* ヘッダー */}
        <div className="mb-10">
          <a
            href="/"
            className="text-blue-600 hover:underline text-sm mb-4 inline-block"
          >
            ← ホームに戻る
          </a>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">利用規約</h1>
          <p className="text-gray-500 mt-2 text-sm">最終更新日：2026年3月</p>
        </div>

        {/* 前文 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <p className="text-gray-700 leading-relaxed">
            本利用規約（以下「本規約」）は、Slide2Video（以下「本サービス」）の利用条件を定めるものです。
            ユーザーは本規約に同意した上で本サービスを利用するものとします。
          </p>
        </div>

        {/* 各条項 */}
        <div className="space-y-6">

          {/* 第1条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              著作権・権利関係
            </h2>
            <p className="text-gray-700 leading-relaxed">
              ユーザーがアップロードするPDFファイルおよびその内容に関する著作権はユーザー自身に帰属します。
              ユーザーは、アップロードするコンテンツについて適切な権利・許可を有していることを保証するものとします。
              本サービスによって生成された動画の著作権は、利用したAIサービスおよびTTSサービスの利用規約に従います。
            </p>
          </section>

          {/* 第2条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              AIによる生成コンテンツについて
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本サービスはAIを使用してナレーション原稿・音声・動画を生成します。
              生成されたコンテンツの正確性・完全性・適法性については保証しません。
              生成コンテンツの利用はユーザーの責任において行ってください。
            </p>
          </section>

          {/* 第3条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              APIキーの利用と費用
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本サービスはユーザー自身が取得したAPIキー（Google Gemini、OpenAI、ElevenLabsなど）を使用します。
              APIキーの利用に伴う費用はすべてユーザーの負担となります。
              本サービスはAPIキーをサーバーに長期保存しません（セッション中のみ使用）。
            </p>
          </section>

          {/* 第4条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              音声クローンの利用
            </h2>
            <p className="text-gray-700 leading-relaxed">
              音声クローン機能を使用する場合、ユーザーは自分自身の音声または適切な許可を得た音声のみを使用するものとします。
              第三者の音声を無断で使用することは禁止します。
            </p>
          </section>

          {/* 第5条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
              YouTubeへのアップロード
            </h2>
            <p className="text-gray-700 leading-relaxed">
              YouTube連携機能を使用する場合、ユーザーはYouTubeの利用規約に従う責任を負います。
              本サービスはユーザーの指示に基づいてのみ動画をアップロードします。
              アップロードされた動画の内容に関する責任はユーザーにあります。
            </p>
          </section>

          {/* 第6条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
              データの保持について
            </h2>
            <p className="text-gray-700 leading-relaxed">
              アップロードされたPDFファイル、生成された音声ファイル、動画ファイルは一時的に保存され、
              生成完了後約30分で自動削除されます。
              障害等により削除が遅延する場合があります。
            </p>
          </section>

          {/* 第7条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
              処理時間とサービス可用性
            </h2>
            <p className="text-gray-700 leading-relaxed">
              動画生成には通常3〜15分かかります。スライド数が多い場合やサーバー負荷が高い場合はさらに時間がかかることがあります。
              処理中にブラウザを閉じると生成が中断される場合があります。
              本サービスはメンテナンスや障害により予告なく停止する場合があります。
            </p>
          </section>

          {/* 第8条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">8</span>
              商用利用
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本サービスで生成したコンテンツの商用利用は可能ですが、利用したAIプロバイダー（Google Gemini、OpenAIなど）および
              音声合成エンジン（ElevenLabs、Azure Speech、Google Cloud TTSなど）の利用規約に従う必要があります。
              プロバイダーによっては商用利用に追加ライセンスが必要な場合があります。
            </p>
          </section>

          {/* 第9条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">9</span>
              禁止事項
            </h2>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                他者を誹謗中傷・差別・脅迫するコンテンツの生成
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                フェイクニュース・虚偽情報・なりすましコンテンツの作成
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                政治的な虚偽情報や選挙干渉を目的とした利用
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                未成年者に有害なコンテンツの生成
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                APIキーの不正利用・転売
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                サービスへの不正アクセス・サーバーへの過剰負荷
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                その他、法律または公序良俗に反する行為
              </li>
            </ul>
          </section>

          {/* 第10条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">10</span>
              未成年者の利用
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本サービスは主に18歳以上の方を対象としています。
              18歳未満の方が利用する場合は、保護者または法定代理人の同意を得てください。
            </p>
          </section>

          {/* 第11条 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">11</span>
              準拠法・管轄裁判所
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本規約は日本法に準拠するものとします。
              本サービスに関する紛争については、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

        </div>

        {/* フッター */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex gap-6 text-sm text-gray-500">
          <a href="/" className="hover:text-gray-700">ホーム</a>
          <a href="/privacy" className="hover:text-gray-700">プライバシーポリシー</a>
        </div>
      </div>
    </div>
  );
}
