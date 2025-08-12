# サブスクリプション管理アプリ

サブスクリプションサービスを管理するためのWebアプリケーションです。

## 機能

- サブスクリプションの登録・編集・削除
- カレンダー表示による支払日管理
- リアルタイム為替レートによる通貨変換
- カテゴリー別の分類と色分け表示
- 月間支払額の合計表示
- レスポンシブデザイン対応
- **Supabase認証**（Email/Password）

## 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase PostgreSQL
- **認証**: Supabase Auth
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

### 3. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトURLとAPIキーを取得

### 4. 環境変数の設定

プロジェクトのルートに`.env`ファイルを作成し、以下の内容を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# データベース接続（Supabase PostgreSQL）
DATABASE_URL=your_supabase_database_url

# ExchangeRate-API.com のAPIキー
# https://www.exchangerate-api.com/ でサインアップしてAPIキーを取得してください
EXCHANGE_RATE_API_KEY=your_api_key_here
```

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

## Supabase認証への移行

### 移行手順

1. **Supabaseプロジェクトの作成**
   - Supabaseダッシュボードでプロジェクトを作成
   - Authentication > SettingsでEmail認証を有効化

2. **環境変数の設定**
   - `.env`ファイルにSupabase設定を追加

3. **データベースの移行**
   - 既存のSQLiteデータをSupabase PostgreSQLに移行

4. **認証システムの切り替え**
   - 既存のJWT認証からSupabase認証に切り替え

詳細な移行手順は[移行ガイド](./MIGRATION_GUIDE.md)を参照してください。

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
