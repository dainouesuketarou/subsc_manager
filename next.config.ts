import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 本番環境でのエラーハンドリング
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
