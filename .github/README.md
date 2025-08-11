# GitHub Actions CI/CD Pipeline

このディレクトリには、サブスクリプション管理アプリのCI/CDパイプライン設定が含まれています。

## 📋 ワークフロー概要

### 1. `ci.yml` - メインCI/CDパイプライン
**トリガー**: `main`、`develop`ブランチへのプッシュ、プルリクエスト

**実行内容**:
- ✅ **Setup**: 依存関係のインストールとキャッシュ
- 🔍 **Lint**: ESLintとPrettierによるコード品質チェック
- 🔧 **Type Check**: TypeScript型チェック
- 🧪 **Test**: Jestによるテスト実行（PostgreSQL使用）
- 🏗️ **Build**: Next.jsアプリケーションのビルド
- 🔒 **Security**: npm auditとSnykによるセキュリティチェック
- 🚀 **Deploy**: Vercelへの自動デプロイ（mainブランチのみ）
- 📢 **Notify**: デプロイ結果の通知

### 2. `pull-request.yml` - プルリクエストチェック
**トリガー**: `main`、`develop`ブランチへのプルリクエスト

**実行内容**:
- 🔍 **Code Review**: コードレビュー用の品質チェック
- 🧪 **Test**: テスト実行とカバレッジレポート
- 🏗️ **Build**: ビルドテスト
- 🔒 **Security**: セキュリティチェック
- 📊 **Performance**: パフォーマンスチェック
- 🏷️ **PR Labels**: プルリクエストのラベルと説明チェック

### 3. `security.yml` - セキュリティスキャン
**トリガー**: 毎週月曜日午前9時、mainブランチへのプッシュ、プルリクエスト

**実行内容**:
- 🔍 **Dependency Scan**: npm auditによる依存関係の脆弱性チェック
- 🛡️ **Snyk Scan**: Snykによる包括的なセキュリティスキャン
- 🔐 **Code Security**: ハードコードされたシークレット、SQLインジェクション、XSSのチェック
- 📦 **Dependency Updates**: 古いパッケージのチェック
- 📋 **Security Report**: セキュリティレポートの生成

## 🔧 必要な環境変数

GitHubリポジトリのSettings > Secrets and variables > Actionsで以下のシークレットを設定してください：

### 必須シークレット
- `DATABASE_URL`: 本番データベースの接続URL
- `VERCEL_TOKEN`: Vercelのデプロイトークン
- `VERCEL_ORG_ID`: Vercelの組織ID
- `VERCEL_PROJECT_ID`: VercelのプロジェクトID

### オプションシークレット
- `SNYK_TOKEN`: SnykのAPIトークン（セキュリティスキャン用）

## 🚀 使用方法

### 1. プルリクエストの作成
```bash
# 新しいブランチを作成
git checkout -b feature/new-feature

# 変更をコミット
git add .
git commit -m "feat: add new feature"

# プッシュしてプルリクエストを作成
git push origin feature/new-feature
```

### 2. 自動チェック
プルリクエストを作成すると、以下のチェックが自動実行されます：
- ✅ コード品質チェック
- ✅ テスト実行
- ✅ ビルドテスト
- ✅ セキュリティチェック

### 3. デプロイ
`main`ブランチにマージすると、自動的にVercelにデプロイされます。

## 📊 カバレッジレポート

テストカバレッジレポートは以下の場所で確認できます：
- GitHub Actionsのアーティファクト
- Codecov（設定済みの場合）

## 🔒 セキュリティ

### 自動チェック項目
- 依存関係の脆弱性
- ハードコードされたシークレット
- SQLインジェクション脆弱性
- XSS脆弱性
- ライセンス問題

### 推奨事項
1. 定期的に依存関係を更新
2. セキュリティレポートを確認
3. 高/クリティカルレベルの脆弱性を優先的に修正

## 🛠️ トラブルシューティング

### よくある問題

#### 1. テストが失敗する
```bash
# ローカルでテストを実行
npm test

# カバレッジ付きでテストを実行
npm run test:coverage
```

#### 2. ビルドが失敗する
```bash
# ローカルでビルドを実行
npm run build

# TypeScript型チェック
npm run type-check
```

#### 3. セキュリティチェックが失敗する
```bash
# 依存関係の脆弱性をチェック
npm audit

# 古いパッケージを確認
npm outdated
```

## 📈 パフォーマンス最適化

### キャッシュ戦略
- npm依存関係のキャッシュ
- Prismaクライアントのキャッシュ
- ビルドアーティファクトのキャッシュ

### 並列実行
- 独立したジョブの並列実行
- 依存関係の最適化

## 🔄 ワークフローの更新

ワークフローを更新する場合は、以下の点に注意してください：

1. **後方互換性**: 既存のジョブに影響を与えない
2. **テスト**: ローカルでワークフローをテスト
3. **ドキュメント**: 変更内容をドキュメント化

## 📞 サポート

問題が発生した場合は、以下を確認してください：
1. GitHub Actionsのログ
2. 環境変数の設定
3. 依存関係のバージョン
4. セキュリティシークレットの設定
