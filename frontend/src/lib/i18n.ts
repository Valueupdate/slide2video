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
    useCaseSales: "営業・提案",
    useCaseSalesDesc: "提案書を動画で開封率アップ",
    useCaseSNS: "SNS配信",
    useCaseSNSDesc: "縦型対応でShorts/Reelsに投稿",
    useCaseInternal: "社内共有",
    useCaseInternalDesc: "手順書や議事録を動画で伝達",

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

    // 設定
    settingsTitle: "設定",
    aiProvider: "AI プロバイダー",
    aiModel: "モデル",
    apiKey: "API キー",
    apiKeyNote: "キーはサーバーに保存されません。リクエスト時のみ使用されます。",
    apiKeyGuide: "API キーの取得方法",
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
    useCaseSales: "Sales & Proposals",
    useCaseSalesDesc: "Boost open rates with video proposals",
    useCaseSNS: "Social Media",
    useCaseSNSDesc: "Portrait mode for Shorts / Reels",
    useCaseInternal: "Internal Sharing",
    useCaseInternalDesc: "Share manuals and minutes as videos",

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

    // Settings
    settingsTitle: "Settings",
    aiProvider: "AI Provider",
    aiModel: "Model",
    apiKey: "API Key",
    apiKeyNote: "Your key is never stored on the server. Used only during requests.",
    apiKeyGuide: "How to get an API key",
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
