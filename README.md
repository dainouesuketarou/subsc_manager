# サブスクリプション管理アプリケーション

## プロジェクト概要

このプロジェクトは、ユーザーがサブスクリプションサービスを管理できるWebアプリケーションです。クリーンアーキテクチャの原則に従って設計されており、保守性と拡張性を重視しています。

## アーキテクチャ

### レイヤー構造

```
src/
├── types/              # 共通型定義（全レイヤーで使用）
│   ├── common.ts       # 共通型定義
│   ├── subscription.ts # サブスクリプション関連型定義
│   ├── auth.ts         # 認証関連型定義
│   └── api.ts          # API関連型定義
├── domain/             # ドメイン層（ビジネスロジック）
│   ├── entities/       # エンティティ
│   ├── value-objects/  # バリューオブジェクト
│   └── repositories/   # リポジトリインターフェース
├── application/        # アプリケーション層（ユースケース）
│   ├── usecase/        # ユースケース
│   └── dto/            # DTO（Data Transfer Objects）
├── infrastructure/     # インフラストラクチャ層（外部依存）
│   ├── services/       # 外部サービス
│   ├── middleware/     # ミドルウェア
│   ├── repositories/   # リポジトリ実装
│   ├── utils/          # ユーティリティ
│   └── supabase/       # Supabase設定
└── presentation/       # プレゼンテーション層（UI）
    ├── components/     # Reactコンポーネント
    ├── contexts/       # Reactコンテキスト
    └── hooks/          # カスタムフック
```

## 主要な改善点

### 1. 共通型定義の統合

- **`src/types/`**: 全レイヤーで使用できる共通型定義
- **型安全性の向上**: 一貫した型定義による開発効率の向上
- **重複の排除**: 重複した型定義の削除

### 2. DTOの導入

- **`src/application/dto/`**: データ転送オブジェクトの専用ディレクトリ
- **レイヤー間の境界**: 明確なデータ転送の境界
- **型安全性**: アプリケーション層での型安全なデータ処理

### 3. 共通ユーティリティの導入

- **ApiResponse**: APIレスポンスの統一化
- **Validation**: バリデーションロジックの共通化
- **ErrorHandler**: エラーハンドリングの統一化
- **PrismaClient**: シングルトンインスタンスの管理

### 4. 認証ロジックの簡素化

- SupabaseAuthMiddlewareの簡素化
- 共通のSupabaseクライアントの使用
- エラーハンドリングの統一

### 5. APIルートの改善

- 共通ユーティリティの活用
- バリデーションの統一
- エラーレスポンスの一貫性

### 6. プレゼンテーション層の整理

- 型定義の統一
- コンテキストの型安全性向上
- フックの型安全性向上

## 技術スタック

- **フレームワーク**: Next.js 14
- **データベース**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **認証**: Supabase Auth
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS

## 開発環境のセットアップ

1. 依存関係のインストール

```bash
npm install
```

2. 環境変数の設定

```bash
cp .env.example .env.local
```

3. データベースのセットアップ

```bash
npx prisma generate
npx prisma db push
```

4. 開発サーバーの起動

```bash
npm run dev
```

## テスト

```bash
npm test
```

## ビルド

```bash
npm run build
```

## デプロイ

```bash
npm run start
```

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
