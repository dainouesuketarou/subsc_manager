# Vercelデプロイメントガイド

## Supabase接続エラーの解決

### 問題の説明

本番環境で以下のエラーが発生する場合があります：

```
FATAL: Address not in tenant allow_list: {54, 82, 47, 142}
```

これは、Vercelのサーバーレス関数のIPアドレスがSupabaseのテナント許可リストに含まれていないために発生します。

### 解決方法

#### 1. Supabaseの設定

1. **Supabaseダッシュボード**にアクセス
2. **Settings** → **Database** に移動
3. **Connection pooling** セクションで以下を確認：
   - **Connection string** が正しく設定されている
   - **Pooler** が有効になっている

#### 2. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定してください：

```bash
# データベース接続
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

#### 3. 重要な設定ポイント

- **DATABASE_URL**: `?pgbouncer=true` パラメータを含める
- **DIRECT_URL**: 直接接続用のURL（マイグレーション用）
- **Connection pooling**: Supabaseで有効にする

#### 4. 接続プールの設定

Supabaseダッシュボードで：

1. **Settings** → **Database**
2. **Connection pooling** を有効化
3. **Pool mode** を `Transaction` に設定

#### 5. トラブルシューティング

##### エラーが続く場合：

1. **SupabaseのIP許可リストを確認**
   - Settings → Database → Connection pooling
   - 必要に応じてVercelのIP範囲を許可リストに追加

2. **接続文字列の確認**
   - `pgbouncer=true` パラメータが含まれているか確認
   - パスワードが正しいか確認

3. **環境変数の再設定**
   - Vercelダッシュボードで環境変数を再設定
   - デプロイメントを再実行

#### 6. 開発環境でのテスト

ローカル環境でテストする場合：

```bash
# .env.local ファイルを作成
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

#### 7. 監視とログ

- Vercelのダッシュボードでログを確認
- Supabaseのダッシュボードで接続状況を監視
- エラーが発生した場合は、詳細なログを確認

### 追加の最適化

#### Prisma Accelerate（オプション）

より高度な接続管理が必要な場合：

1. Prisma Accelerateを有効化
2. 接続プールの設定を最適化
3. クエリキャッシュを活用

#### エラーハンドリング

アプリケーションでは以下のエラーハンドリングが実装されています：

- データベース接続エラーの適切な処理
- ユーザーフレンドリーなエラーメッセージ
- 自動リトライ機能（必要に応じて）

### サポート

問題が解決しない場合は：

1. Supabaseのドキュメントを確認
2. Vercelのサポートに問い合わせ
3. プロジェクトのログを詳細に確認
