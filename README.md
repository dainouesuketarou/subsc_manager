# サブスクリプション管理アプリ

サブスクリプションサービスを管理するためのWebアプリケーションです。

## 機能

- サブスクリプションの登録・編集・削除
- カレンダー表示による支払日管理
- リアルタイム為替レートによる通貨変換
- カテゴリー別の分類と色分け表示
- 月間支払額の合計表示
- レスポンシブデザイン対応

## 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Prisma, SQLite
- **認証**: JWT
- **為替レート**: ExchangeRate-API.com

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd subsc-manager
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

プロジェクトのルートに`.env`ファイルを作成し、以下の内容を設定してください：

```env
# ExchangeRate-API.com のAPIキー
# https://www.exchangerate-api.com/ でサインアップしてAPIキーを取得してください
EXCHANGE_RATE_API_KEY=your_api_key_here

# データベース接続情報
DATABASE_URL="file:./dev.db"

# JWT シークレット
JWT_SECRET=your_jwt_secret_here

# パスワードリセットトークンのシークレット
PASSWORD_RESET_SECRET=your_password_reset_secret_here
```

### 4. ExchangeRate-API.comのAPIキー取得

1. [ExchangeRate-API.com](https://www.exchangerate-api.com/)にアクセス
2. アカウントを作成
3. 無料プランでAPIキーを取得
4. `.env`ファイルの`EXCHANGE_RATE_API_KEY`に設定

### 5. データベースのセットアップ

```bash
npx prisma generate
npx prisma db push
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 使用方法

### サブスクリプションの登録

1. 「サブスクを追加」ボタンをクリック
2. サービス名、料金、通貨、支払いサイクル、カテゴリーを入力
3. 支払い開始日を設定
4. 登録ボタンをクリック

### カレンダー表示

- カレンダーには支払日がハイライト表示されます
- 月の合計支払額が上部に表示されます
- カテゴリー別の支払額が表示されます

### 為替レート機能

- 全ての通貨が円（JPY）に自動変換されます
- リアルタイムの為替レートを使用（APIキー設定時）
- APIキー未設定時は固定レートを使用

## テスト

```bash
# 全テストの実行
npm test

# 特定のテストファイルの実行
npm test -- --testPathPatterns="ExchangeRateService"
```

## デプロイ

### Vercel

1. Vercelにプロジェクトを接続
2. 環境変数を設定
3. デプロイ

### その他のプラットフォーム

- Railway
- Netlify
- AWS Amplify

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。
