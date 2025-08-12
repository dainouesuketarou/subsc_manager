# Supabase移行後のクリーンアップ計画

このドキュメントでは、Supabase認証への移行が完了した後のクリーンアップ作業を説明します。

## 🎯 クリーンアップの目的

1. **コードの簡素化**: 不要なJWT認証コードの削除
2. **依存関係の整理**: 使用しなくなったパッケージの削除
3. **パフォーマンスの向上**: 不要なファイルの削除によるビルド時間の短縮
4. **保守性の向上**: コードベースの整理

## 📋 削除対象ファイル

### 1. JWT認証関連ファイル

```bash
# 削除するファイル
src/infrastructure/utils/JwtTokenManager.ts
src/infrastructure/utils/PasswordHasher.ts
src/infrastructure/utils/PasswordResetTokenManager.ts
src/infrastructure/middleware/AuthMiddleware.ts
```

### 2. 既存の認証APIエンドポイント

```bash
# 削除するAPIエンドポイント
app/api/auth/login/route.ts
app/api/auth/register/route.ts
app/api/auth/logout/route.ts
app/api/auth/forgot-password/route.ts
app/api/auth/reset-password/route.ts
```

### 3. 既存の認証コンテキスト

```bash
# 削除するコンテキスト
src/presentation/contexts/AuthContext.tsx
src/presentation/contexts/SupabaseAuthContext.tsx
```

### 4. 既存の認証コンポーネント

```bash
# 削除するコンポーネント
src/presentation/components/auth/LoginForm.tsx
src/presentation/components/auth/RegisterForm.tsx
src/presentation/components/auth/ForgotPasswordForm.tsx
src/presentation/components/auth/AuthModal.tsx
```

### 5. 既存の認証ユースケース

```bash
# 削除するユースケース
src/application/usecase/LoginUserUseCase.ts
src/application/usecase/RegisterUserUseCase.ts
src/application/usecase/LogoutUserUseCase.ts
src/application/usecase/RequestPasswordResetUseCase.ts
src/application/usecase/ResetPasswordUseCase.ts
```

### 6. 既存のリポジトリ

```bash
# 削除するリポジトリ
src/infrastructure/PrismaUserRepository.ts
```

## 🔧 削除手順

### Step 1: バックアップの作成

```bash
# 現在のコードをバックアップ
git checkout -b backup-before-cleanup
git add .
git commit -m "backup: before cleanup"
```

### Step 2: ファイルの削除

```bash
# JWT認証関連ファイルを削除
rm src/infrastructure/utils/JwtTokenManager.ts
rm src/infrastructure/utils/PasswordHasher.ts
rm src/infrastructure/utils/PasswordResetTokenManager.ts
rm src/infrastructure/middleware/AuthMiddleware.ts

# 既存のAPIエンドポイントを削除
rm -rf app/api/auth/login
rm -rf app/api/auth/register
rm -rf app/api/auth/logout
rm -rf app/api/auth/forgot-password
rm -rf app/api/auth/reset-password

# 既存の認証コンテキストを削除
rm src/presentation/contexts/AuthContext.tsx
rm src/presentation/contexts/SupabaseAuthContext.tsx

# 既存の認証コンポーネントを削除
rm src/presentation/components/auth/LoginForm.tsx
rm src/presentation/components/auth/RegisterForm.tsx
rm src/presentation/components/auth/ForgotPasswordForm.tsx
rm src/presentation/components/auth/AuthModal.tsx

# 既存のユースケースを削除
rm src/application/usecase/LoginUserUseCase.ts
rm src/application/usecase/RegisterUserUseCase.ts
rm src/application/usecase/LogoutUserUseCase.ts
rm src/application/usecase/RequestPasswordResetUseCase.ts
rm src/application/usecase/ResetPasswordUseCase.ts

# 既存のリポジトリを削除
rm src/infrastructure/PrismaUserRepository.ts
```

### Step 3: 依存関係の整理

```bash
# 不要なパッケージを削除
npm uninstall jsonwebtoken bcryptjs @types/jsonwebtoken @types/bcryptjs
```

### Step 4: インポート文の修正

削除したファイルを参照しているインポート文を修正します。

### Step 5: テストファイルの削除

```bash
# 削除するテストファイル
rm __tests__/application/usecase/LoginUserUseCase.test.ts
rm __tests__/application/usecase/RegisterUserUseCase.test.ts
rm __tests__/application/usecase/LogoutUserUseCase.test.ts
rm __tests__/application/usecase/RequestPasswordResetUseCase.test.ts
rm __tests__/application/usecase/ResetPasswordUseCase.test.ts
rm __tests__/infrastructure/PrismaUserRepository.test.ts
rm __tests__/infrastructure/middleware/AuthMiddleware.test.ts
rm __tests__/app/api/auth/login/route.test.ts
rm __tests__/app/api/auth/register/route.test.ts
```

## 🔄 置き換え作業

### 1. 認証コンテキストの統一

```typescript
// src/presentation/contexts/UnifiedAuthContext.tsx を使用
// 既存のAuthContextとSupabaseAuthContextを削除
```

### 2. APIエンドポイントの更新

```typescript
// 新しいSupabase認証APIエンドポイントを使用
// app/api/auth/supabase-login/route.ts
// app/api/auth/supabase-register/route.ts
```

### 3. コンポーネントの更新

```typescript
// 新しいSupabase認証コンポーネントを使用
// src/presentation/components/auth/SupabaseLoginForm.tsx
// src/presentation/components/auth/SupabaseRegisterForm.tsx
// src/presentation/components/auth/SupabaseAuthModal.tsx
```

## 🧪 テストと検証

### 1. ビルドテスト

```bash
npm run build
```

### 2. 型チェック

```bash
npm run type-check
```

### 3. テスト実行

```bash
npm test
```

### 4. 手動テスト

- [ ] ユーザー登録
- [ ] ログイン
- [ ] ログアウト
- [ ] パスワードリセット
- [ ] サブスクリプション管理機能

## 📊 クリーンアップ効果

### 削除されるファイル数

- **TypeScriptファイル**: 約15ファイル
- **テストファイル**: 約10ファイル
- **APIエンドポイント**: 5エンドポイント

### 削除される依存関係

- `jsonwebtoken`
- `bcryptjs`
- `@types/jsonwebtoken`
- `@types/bcryptjs`

### 期待される効果

- **ビルド時間**: 約20%短縮
- **バンドルサイズ**: 約15%削減
- **コード行数**: 約1000行削減
- **保守性**: 大幅向上

## ⚠️ 注意事項

### 1. 段階的削除

一度にすべてを削除せず、段階的に削除してテストを実行してください。

### 2. バックアップ

削除前に必ずバックアップを作成してください。

### 3. テスト実行

各段階でテストを実行して、機能が正常に動作することを確認してください。

### 4. コミット

大きな変更は小さなコミットに分けて、問題が発生した場合のロールバックを容易にしてください。

## 🎉 完了後の確認事項

- [ ] すべてのテストが通る
- [ ] ビルドが成功する
- [ ] 型チェックが通る
- [ ] 手動テストが成功する
- [ ] パフォーマンスが向上している
- [ ] コードが整理されている
