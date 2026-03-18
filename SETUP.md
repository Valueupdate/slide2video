# Slide2Video - 環境構築・起動ガイド

Google Antigravity を使った開発環境のセットアップと起動手順です。

---

## 前提条件

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Google Antigravity | 最新版 | AI IDE（エディタ） |
| Python | 3.10 以上 | バックエンド実行 |
| Node.js | 18 以上 | フロントエンド実行 |
| FFmpeg | 6.x 以上 | 動画生成 |
| Git | 最新版 | バージョン管理 |

---

## 1. ツールのインストール

### 1-1. Google Antigravity

1. https://antigravity.google/download からインストーラをダウンロード
2. インストーラを実行し、セットアップウィザードを完了
3. 初回起動時の設定で「Planning」モードを選択（推奨）

### 1-2. Python

Windows の場合:

    python --version

バージョンが表示されない場合は https://www.python.org/downloads/ からインストールしてください。インストール時に「Add Python to PATH」にチェックを入れてください。

### 1-3. Node.js

    node --version
    npm --version

バージョンが表示されない場合は https://nodejs.org/ から LTS 版をインストールしてください。

### 1-4. FFmpeg

Windows の場合:

    ffmpeg -version

バージョンが表示されない場合は https://www.gyan.dev/ffmpeg/builds/ から「ffmpeg-release-essentials.zip」をダウンロードし、展開後 bin フォルダを PATH に追加してください。

macOS の場合:

    brew install ffmpeg

---

## 2. プロジェクトのセットアップ

### 2-1. リポジトリのクローン

    git clone <リポジトリURL>
    cd slide2video

### 2-2. Antigravity でプロジェクトを開く

1. Antigravity を起動
2. 「Open Folder」から slide2video フォルダを選択
3. プロジェクトが読み込まれたら、Agent Manager またはエディタが表示される

### 2-3. Antigravity の推奨設定

プロジェクトルートに Antigravity 用のルールファイルを配置します。

ファイル: `.agents/rules/project-rules.md`

    # Slide2Video プロジェクトルール

    ## 技術スタック
    - バックエンド: Python 3.10+, FastAPI, PyMuPDF, edge-tts, FFmpeg
    - フロントエンド: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
    - AI: Google Gemini API, OpenAI API（ユーザー提供のキーを使用）

    ## コーディング規約
    - Python は PEP 8 に準拠
    - TypeScript は ESLint 設定に準拠
    - コメントは日本語で記述可
    - 関数には docstring / JSDoc を付ける

    ## セキュリティ
    - API キーをソースコードやコミットに含めないこと
    - ユーザーの API キーはリクエストヘッダーで受け渡し、サーバーに保存しない

    ## ディレクトリ構成
    - backend/ : FastAPI アプリケーション
    - frontend/ : Next.js アプリケーション
    - docs/ : 設計ドキュメント

---

## 3. バックエンドの起動

### 3-1. 仮想環境の作成と依存パッケージのインストール

Antigravity のターミナル（Ctrl + `）を開いて実行:

    cd backend
    python -m venv venv

Windows:

    venv\Scripts\activate

macOS / Linux:

    source venv/bin/activate

依存パッケージのインストール:

    pip install -r requirements.txt

### 3-2. 環境変数の設定

    cp .env.example .env

.env ファイルはバックエンド自体が API キーを持つ必要がないため、基本的にデフォルトのままで動作します。

.env の内容:

    DEBUG=true
    PORT=8000

### 3-3. バックエンドの起動

    python -m uvicorn main:app --reload --port 8000

起動確認:

    curl http://localhost:8000/health

以下のレスポンスが返れば成功です:

    {"status": "ok", "version": "1.0.0"}

---

## 4. フロントエンドの起動

### 4-1. 依存パッケージのインストール

新しいターミナルを開いて:

    cd frontend
    npm install

### 4-2. 環境変数の設定

    cp .env.example .env.local

.env.local の内容:

    NEXT_PUBLIC_API_URL=http://localhost:8000

### 4-3. フロントエンドの起動

    npm run dev

ブラウザで http://localhost:3000 にアクセスすると、Slide2Video の画面が表示されます。

---

## 5. 動作確認

1. ブラウザで http://localhost:3000 を開く
2. AI プロバイダー（Gemini または OpenAI）を選択
3. 自分の API キーを入力
4. テスト用の PDF をアップロード
5. 「動画を生成」ボタンをクリック
6. 進捗バーが表示され、完了後に動画をダウンロード

---

## 6. Antigravity での開発フロー

### Agent Manager を使う場合

Agent Manager（左上のアイコン）から「Start Conversation」を選択し、以下のように指示できます:

    backend/services/ai_service.py のリトライ処理を改善して

### エディタのインラインチャットを使う場合

コード上で Cmd + I（Mac）/ Ctrl + I（Windows）でインラインチャットを起動し、その場で修正指示を出せます。

### ワークフローの活用

`.agents/workflows/` にワークフロー定義を置くことで、繰り返しのタスクを自動化できます。

ファイル: `.agents/workflows/run-tests.md`

    # テスト実行ワークフロー
    1. backend/ ディレクトリに移動
    2. venv を有効化
    3. pytest を実行
    4. テスト結果を報告

Antigravity のチャットで `/run-tests` と入力すると、このワークフローが実行されます。

---

## トラブルシューティング

### FFmpeg が見つからない

「ffmpeg: command not found」エラーが出る場合は、FFmpeg の bin ディレクトリが PATH に含まれているか確認してください。

    # Windows（PowerShell）
    $env:PATH += ";C:\ffmpeg\bin"

    # macOS / Linux
    export PATH="/usr/local/bin:$PATH"

### edge-tts のインストールエラー

Python 3.12 以降で edge-tts のインストールに失敗する場合:

    pip install edge-tts --pre

### ポートが使用中

8000 番ポートが使用中の場合:

    # 別のポートで起動
    python -m uvicorn main:app --reload --port 8001

フロントエンドの .env.local も合わせて変更してください:

    NEXT_PUBLIC_API_URL=http://localhost:8001

### Antigravity のブラウザが開かない

Antigravity 専用の Chrome が起動しない場合は、Antigravity Settings > Browser から設定を確認してください。通常の開発ではシステムブラウザで http://localhost:3000 にアクセスすれば十分です。
