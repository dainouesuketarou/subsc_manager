# Supabase認証への移行ガイド

このガイドでは、既存のJWT認証システムからSupabase認証への完全移行手順を説明します。

## 📋 移行概要

### 移行前

- JWT + カスタム認証
- SQLiteデータベース
- 手動でのパスワードハッシュ化

### 移行後

- Supabase認証
- PostgreSQLデータベース
- 自動パスワード管理

## 🚀 Phase 1: Supabaseプロジェクトの準備

### 1.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. 「New Project」をクリック
3. プロジェクト名を入力（例：`subsc-manager`）
4. データベースパスワードを設定
5. リージョンを選択（推奨：`Asia Pacific (Tokyo)`）

### 1.2 認証設定

1. Supabaseダッシュボードで「Authentication」→「Settings」
2. 「Email Auth」を有効化
3. 「Confirm email」を無効化（開発中）
4. 「Secure email change」を無効化（開発中）

### 1.3 環境変数の取得

1. 「Settings」→「API」
2. 以下の値をコピー：
   - Project URL
   - anon public key

## 🔧 Phase 2: 環境設定

### 2.1 環境変数の設定

`.env`ファイルを更新：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# データベース接続（Supabase PostgreSQL）
# アプリケーションからの接続用（Connection Pooler経由）
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# マイグレーション用（直接接続）
DIRECT_URL=postgresql://postgres.[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres

# ExchangeRate-API.com のAPIキー
EXCHANGE_RATE_API_KEY=your_api_key_here
```

### 2.2 データベース接続の確認

```bash
# Prismaクライアントの再生成
npx prisma generate

# データベース接続のテスト
npx prisma db push
```

## 🔄 Phase 3: 認証システムの移行

### 3.1 Supabase認証サービスの完成

既存の`SupabaseAuthService`を拡張：

```typescript
// src/infrastructure/services/SupabaseAuthService.ts
export class SupabaseAuthService {
  // 既存のメソッドに加えて以下を追加

  static async updatePassword(password: string): Promise<AuthResponse> {
    // パスワード更新の実装
  }

  static async updateEmail(email: string): Promise<AuthResponse> {
    // メールアドレス更新の実装
  }
}
```

### 3.2 認証ミドルウェアの更新

```typescript
// src/infrastructure/middleware/SupabaseAuthMiddleware.ts
export class SupabaseAuthMiddleware {
  static async authenticate(request: NextRequest) {
    // Supabaseセッションを使用した認証
  }
}
```

### 3.3 APIエンドポイントの更新

既存のJWT認証APIをSupabase認証に置き換え：

- `/api/auth/login` → Supabase認証
- `/api/auth/register` → Supabase認証
- `/api/auth/logout` → Supabase認証

## 🎨 Phase 4: フロントエンドの統合

### 4.1 認証コンテキストの統一

`AuthContext`を`SupabaseAuthContext`に置き換え：

```typescript
// src/presentation/contexts/AuthContext.tsx
// 既存のAuthContextを削除し、SupabaseAuthContextを使用
```

### 4.2 UIコンポーネントの更新

認証フォームをSupabase認証に対応：

```typescript
// src/presentation/components/auth/LoginForm.tsx
// Supabase認証を使用するように更新
```

## 📊 Phase 5: データ移行

### 5.1 既存ユーザーデータの移行

1. 既存のSQLiteデータをエクスポート
2. Supabase PostgreSQLにインポート
3. パスワードハッシュの変換（必要に応じて）

### 5.2 データベーススキーマの確認

```sql
-- Supabaseでテーブルが正しく作成されているか確認
SELECT * FROM "User";
SELECT * FROM "Subscription";
```

## 🧪 Phase 6: テストと検証

### 6.1 認証フローのテスト

1. ユーザー登録
2. ログイン
3. ログアウト
4. パスワードリセット

### 6.2 既存機能のテスト

1. サブスクリプション管理
2. カレンダー表示
3. 為替レート変換

## 🧹 Phase 7: クリーンアップ

### 7.1 不要なコードの削除

以下のファイルを削除：

- `src/infrastructure/utils/JwtTokenManager.ts`
- `src/infrastructure/utils/PasswordHasher.ts`
- 既存のJWT認証APIエンドポイント

### 7.2 依存関係の整理

```bash
# 不要なパッケージを削除
npm uninstall jsonwebtoken bcryptjs
```

## 🚨 注意事項

### 移行中の注意点

1. **段階的移行**: 一度にすべてを変更せず、段階的に移行
2. **データバックアップ**: 移行前に必ずデータをバックアップ
3. **テスト環境**: 本番環境での移行前にテスト環境で検証
4. **ロールバック計画**: 問題が発生した場合のロールバック手順を準備

### セキュリティ考慮事項

1. **環境変数**: 本番環境では適切に環境変数を管理
2. **CORS設定**: SupabaseのCORS設定を確認
3. **セッション管理**: Supabaseのセッション設定を確認

## 📞 サポート

移行中に問題が発生した場合：

1. Supabaseドキュメントを確認
2. プロジェクトのIssuesで報告
3. コミュニティフォーラムで質問

## ✅ 移行完了チェックリスト

- [ ] Supabaseプロジェクトが作成されている
- [ ] 環境変数が正しく設定されている
- [ ] データベース接続が確認されている
- [ ] 認証フローが動作している
- [ ] 既存機能が正常に動作している
- [ ] テストが通っている
- [ ] 不要なコードが削除されている
- [ ] ドキュメントが更新されている
