export type Lang = "ja" | "en";

export const translations = {
  ja: {
    // ヘッダー
    appName: "Slide2Video",

    // メインキャッチコピー
    mainTitle: "スライドに声を、PDFに命を。",
    mainSubtitle: "AIナレーション × 自動動画生成。あなたのPDFが、プロ品質のプレゼン動画になります。",

    // ユースケース
    useCaseEducation: "教育・研修",
    useCaseEducationDesc: "授業資料をオンデマンド教材に",
    useCaseEducationScenario: "研修用PDFをアップロードするだけで、AIがナレーション付き解説動画を自動生成。受講者はいつでも繰り返し視聴でき、理解度が上がります。",
    useCaseSales: "営業・提案",
    useCaseSalesDesc: "提案書を動画で開封率アップ",
    useCaseSalesScenario: "提案書PDFを動画化してメールに添付。文字を読まなくても内容が伝わるため、商談前の理解促進・開封率向上に効果的です。",
    useCaseSNS: "SNS配信",
    useCaseSNSDesc: "縦型対応でShorts/Reelsに投稿",
    useCaseSNSScenario: "セミナー資料や会社紹介PDFを縦型動画に変換。YouTube Shorts・TikTok・Instagram Reels にそのまま投稿できます。",
    useCaseInternal: "社内共有",
    useCaseInternalDesc: "手順書や議事録を動画で伝達",
    useCaseInternalScenario: "業務マニュアルや手順書PDFを動画化。Slack・Teams で共有すれば、読まれない資料が「見てもらえるコンテンツ」に変わります。",

    // 生成ボタン
    generateButton: "動画を生成する",
    resetButton: "最初からやり直す",
    termsNotice: "「動画を生成する」を押すことで、",
    termsLink: "利用規約・免責事項",
    termsNoticeSuffix: "に同意したものとみなします。",

    // フッター
    footerTagline: "Slide2Video — スライドに声を、PDFに命を。",
    footerPrivacy: "APIキーはサーバーに保存されません。生成した動画は30分後に自動削除されます。",
    footerTerms: "利用規約・免責事項",
    footerFeedback: "フィードバック / Feedback",

    // アップロード
    uploadTitle: "PDFファイルをドラッグ＆ドロップ",
    uploadSubtitle: "またはクリックしてファイルを選択（最大50MB）",
    uploadPptxHintTitle: "PowerPoint（PPTX）をお持ちの場合",
    uploadPptxHintDesc: "PowerPoint で「ファイル」→「名前を付けて保存」→「PDF」を選択してから アップロードしてください。LibreOffice などで変換するとレイアウトが崩れる場合があります。",
    uploadPptxHintStep1: "PowerPoint でファイルを開く",
    uploadPptxHintStep2: "「ファイル」→「名前を付けて保存」をクリック",
    uploadPptxHintStep3: "ファイル形式で「PDF」を選択して保存",

    // 設定
    settingsTitle: "設定",
    aiProvider: "AI プロバイダー",
    aiModel: "モデル",
    apiKey: "API キー",
    apiKeyNote: "キーはサーバーに保存されません。リクエスト時のみ使用されます。",
    apiKeyGuide: "API キーの取得方法",
    geminiRateLimit: "無料枠のレート制限はプロジェクトにより異なります。",
    geminiRateLimitLink: "AI Studio で確認 ↗",
    openrouterUsage: "利用状況と制限は OpenRouter ダッシュボードで確認できます。",
    openrouterUsageLink: "OpenRouter Activity で確認 ↗",
    openaiUsage: "利用状況は OpenAI ダッシュボードで確認できます。",
    openaiUsageLink: "Usage で確認 ↗",
    apiKeyGuideGeminiLabel: "Google AI Studio でキーを作成",
    apiKeyGuideGeminiStep1: "上のリンクから Google AI Studio を開く",
    apiKeyGuideGeminiStep2: "Google アカウントでログイン",
    apiKeyGuideGeminiStep3: "「APIキーを作成」をクリックしてコピー",
    apiKeyGuideOpenaiLabel: "OpenAI ダッシュボードでキーを作成",
    apiKeyGuideOpenaiStep1: "上のリンクから OpenAI のダッシュボードを開く",
    apiKeyGuideOpenaiStep2: "アカウント作成後「+ Create new secret key」をクリック",
    apiKeyGuideOpenaiStep3: "表示されたキーをコピー（クレジット購入が必要です）",
    apiKeyGuideOpenrouterLabel: "OpenRouter でキーを作成",
    apiKeyGuideOpenrouterStep1: "上のリンクから OpenRouter を開く",
    apiKeyGuideOpenrouterStep2: "Google / GitHub アカウントでサインアップ",
    apiKeyGuideOpenrouterStep3: "「Create Key」をクリックしてコピー（無料クレジットあり）",
    narrationLanguage: "ナレーション言語",
    narrationLanguageNote: "PDFの言語に関係なく、選択した言語でナレーション台本を生成します。",
    ttsEngine: "音声合成エンジン",
    speaker: "話者",
    videoSettings: "動画設定",
    slideDuration: "1スライドあたりの時間",
    slideDurationNote: "AIが生成する台本の分量と動画の長さを調整します。",
    aspectRatio: "アスペクト比",

    // 進捗
    processing: "処理中...",
    errorLabel: "エラー",
    completed: "完了",

    // ダウンロード
    downloadComplete: "動画の生成が完了しました",
    downloadNote: "ダウンロードリンクは約30分間有効です",
    downloadButton: "動画をダウンロード",
    newGeneration: "新規作成",
    youtubeTransfer: "YouTube に転送する",
    youtubeTransferComingSoon: "※ 現在 Google 審査中のため、一般公開準備中です",
    youtubeTransferNote: "Google アカウントで認証するだけで、あなたの YouTube チャンネルに動画が転送されます。転送後は非公開で保管されます。タイトル・説明文・公開設定・サムネイルは YouTube Studio で自由に編集できます。",
    youtubeTransferComplete: "YouTube への転送が完了しました！",
    youtubeTransferPrivateNote: "現在は非公開で保管されています。公開する場合は YouTube Studio で公開設定を変更してください。",
    youtubeStudioButton: "YouTube Studio で編集する ↗",
    youtubeWatchButton: "YouTube で確認する ↗",
  },
  en: {
    // Header
    appName: "Slide2Video",

    // Main copy
    mainTitle: "Give voice to your slides, bring life to your PDFs.",
    mainSubtitle: "AI narration × auto video generation. Transform your PDF into a professional presentation video.",

    // Use cases
    useCaseEducation: "Education",
    useCaseEducationDesc: "Turn lecture materials into on-demand content",
    useCaseEducationScenario: "Upload your training PDF and let AI generate a narrated video automatically. Learners can watch and rewatch at their own pace, improving comprehension.",
    useCaseSales: "Sales & Proposals",
    useCaseSalesDesc: "Boost open rates with video proposals",
    useCaseSalesScenario: "Turn your proposal PDF into a video and attach it to emails. Prospects understand your pitch without reading — boosting engagement before meetings.",
    useCaseSNS: "Social Media",
    useCaseSNSDesc: "Portrait mode for Shorts / Reels",
    useCaseSNSScenario: "Convert seminar slides or company intro PDFs into portrait videos. Ready to post on YouTube Shorts, TikTok, and Instagram Reels.",
    useCaseInternal: "Internal Sharing",
    useCaseInternalDesc: "Share manuals and minutes as videos",
    useCaseInternalScenario: "Turn operation manuals and procedure PDFs into videos. Share on Slack or Teams — unread documents become content people actually watch.",

    // Buttons
    generateButton: "Generate Video",
    resetButton: "Start Over",
    termsNotice: "By clicking \"Generate Video\", you agree to our ",
    termsLink: "Terms of Service",
    termsNoticeSuffix: ".",

    // Footer
    footerTagline: "Slide2Video — Give voice to your slides, bring life to your PDFs.",
    footerPrivacy: "API keys are never stored on the server. Generated videos are auto-deleted after 30 minutes.",
    footerTerms: "Terms of Service",
    footerFeedback: "Feedback",

    // Upload
    uploadTitle: "Drag & drop your PDF here",
    uploadSubtitle: "or click to select a file (max 50MB)",
    uploadPptxHintTitle: "Have a PowerPoint (PPTX) file?",
    uploadPptxHintDesc: "Please convert it to PDF before uploading. In PowerPoint, go to File → Save As → PDF. Converting with LibreOffice may cause layout issues.",
    uploadPptxHintStep1: "Open your file in PowerPoint",
    uploadPptxHintStep2: "Click \"File\" → \"Save As\"",
    uploadPptxHintStep3: "Select \"PDF\" as the file format and save",

    // Settings
    settingsTitle: "Settings",
    aiProvider: "AI Provider",
    aiModel: "Model",
    apiKey: "API Key",
    apiKeyNote: "Your key is never stored on the server. Used only during requests.",
    apiKeyGuide: "How to get an API key",
    geminiRateLimit: "Free tier rate limits vary by project.",
    geminiRateLimitLink: "Check on AI Studio ↗",
    openrouterUsage: "View usage and limits on the OpenRouter dashboard.",
    openrouterUsageLink: "Check on OpenRouter Activity ↗",
    openaiUsage: "View usage on the OpenAI dashboard.",
    openaiUsageLink: "Check on Usage ↗",
    apiKeyGuideGeminiLabel: "Create a key in Google AI Studio",
    apiKeyGuideGeminiStep1: "Open Google AI Studio from the link above",
    apiKeyGuideGeminiStep2: "Sign in with your Google account",
    apiKeyGuideGeminiStep3: "Click \"Create API key\" and copy it",
    apiKeyGuideOpenaiLabel: "Create a key in OpenAI Dashboard",
    apiKeyGuideOpenaiStep1: "Open the OpenAI dashboard from the link above",
    apiKeyGuideOpenaiStep2: "Click \"+ Create new secret key\" after signing up",
    apiKeyGuideOpenaiStep3: "Copy the displayed key (credit purchase required)",
    apiKeyGuideOpenrouterLabel: "Create a key on OpenRouter",
    apiKeyGuideOpenrouterStep1: "Open OpenRouter from the link above",
    apiKeyGuideOpenrouterStep2: "Sign up with Google / GitHub account",
    apiKeyGuideOpenrouterStep3: "Click \"Create Key\" and copy it (free credits available)",
    narrationLanguage: "Narration Language",
    narrationLanguageNote: "The narration script will be generated in the selected language regardless of the PDF language.",
    ttsEngine: "Text-to-Speech Engine",
    speaker: "Speaker",
    videoSettings: "Video Settings",
    slideDuration: "Duration per Slide",
    slideDurationNote: "Adjusts the length of the AI-generated script and video.",
    aspectRatio: "Aspect Ratio",

    // Progress
    processing: "Processing...",
    errorLabel: "Error",
    completed: "Completed",

    // Download
    downloadComplete: "Your video is ready!",
    downloadNote: "The download link is valid for approximately 30 minutes.",
    downloadButton: "Download Video",
    newGeneration: "Create New",
    youtubeTransfer: "Transfer to YouTube",
    youtubeTransferComingSoon: "※ Currently under Google review — coming soon for all users",
    youtubeTransferNote: "Sign in with your Google account to transfer your video directly to your YouTube channel. The video will be saved as private. You can edit the title, description, visibility, and thumbnail in YouTube Studio afterward.",
    youtubeTransferComplete: "Successfully transferred to YouTube!",
    youtubeTransferPrivateNote: "Your video is currently saved as private. Go to YouTube Studio to change the visibility settings.",
    youtubeStudioButton: "Edit in YouTube Studio ↗",
    youtubeWatchButton: "View on YouTube ↗",
  },
} as const;

export type TranslationKey = keyof typeof translations.ja;
export type Translations = typeof translations.ja | typeof translations.en;

export const SLIDE_DURATION_OPTIONS_I18N = {
  ja: [
    { label: "自動（AI台本に合わせる）", value: "0" },
    { label: "約15秒 / スライド", value: "15" },
    { label: "約30秒 / スライド", value: "30" },
    { label: "約45秒 / スライド", value: "45" },
    { label: "約60秒 / スライド", value: "60" },
  ],
  en: [
    { label: "Auto (match AI script)", value: "0" },
    { label: "~15 sec / slide", value: "15" },
    { label: "~30 sec / slide", value: "30" },
    { label: "~45 sec / slide", value: "45" },
    { label: "~60 sec / slide", value: "60" },
  ],
};

export const ASPECT_RATIO_OPTIONS_I18N = {
  ja: [
    { label: "横型 16:9（YouTube / PC）", value: "16:9" },
    { label: "縦型 9:16（Shorts / TikTok / Reels）", value: "9:16" },
    { label: "正方形 1:1（Instagram / SNS）", value: "1:1" },
  ],
  en: [
    { label: "Landscape 16:9 (YouTube / PC)", value: "16:9" },
    { label: "Portrait 9:16 (Shorts / TikTok / Reels)", value: "9:16" },
    { label: "Square 1:1 (Instagram / SNS)", value: "1:1" },
  ],
};

export const TTS_PROVIDER_OPTIONS_I18N = {
  ja: [
    { label: "Edge-TTS（無料）", value: "edge-tts" },
    { label: "OpenAI TTS（有料・高品質）", value: "openai" },
    { label: "ElevenLabs（高品質・多言語）", value: "elevenlabs" },
    { label: "Azure Speech（Microsoft・無料枠大）", value: "azure" },
    { label: "Google Cloud TTS（Google・無料枠大）", value: "google-cloud" },
    { label: "ボイスクローン（自分の声で読み上げ）", value: "qwen-clone" },
  ],
  en: [
    { label: "Edge-TTS (Free)", value: "edge-tts" },
    { label: "OpenAI TTS (Paid, High Quality)", value: "openai" },
    { label: "ElevenLabs (High Quality, Multilingual)", value: "elevenlabs" },
    { label: "Azure Speech (Microsoft, Large Free Tier)", value: "azure" },
    { label: "Google Cloud TTS (Large Free Tier)", value: "google-cloud" },
    { label: "Voice Clone (Your own voice)", value: "qwen-clone" },
  ],
};

export const AI_PROVIDER_OPTIONS_I18N = {
  ja: [
    { label: "Google Gemini", value: "gemini" },
    { label: "OpenAI", value: "openai" },
    { label: "OpenRouter（複数モデル対応）", value: "openrouter" },
  ],
  en: [
    { label: "Google Gemini", value: "gemini" },
    { label: "OpenAI", value: "openai" },
    { label: "OpenRouter (Multiple Models)", value: "openrouter" },
  ],
};
