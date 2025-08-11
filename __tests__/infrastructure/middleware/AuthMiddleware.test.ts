import { NextRequest } from 'next/server';

// モジュールのモック
jest.mock('@prisma/client');
jest.mock('../../../src/infrastructure/utils/JwtTokenManager');
jest.mock('../../../src/infrastructure/PrismaUserRepository');

describe('AuthMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('Authorizationヘッダーがない場合、エラーを返す', async () => {
      // 動的インポートでモジュールを取得
      const { AuthMiddleware } = await import(
        '../../../src/infrastructure/middleware/AuthMiddleware'
      );

      const request = new NextRequest('http://localhost:3000/api/test');

      const result = await AuthMiddleware.authenticate(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      const data = await response.json();
      expect(data.error).toBe('Authorization header is required');
      expect(response.status).toBe(401);
    });

    it('無効なトークン形式の場合、エラーを返す', async () => {
      // 動的インポートでモジュールを取得
      const { AuthMiddleware } = await import(
        '../../../src/infrastructure/middleware/AuthMiddleware'
      );

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'InvalidFormat token',
        },
      });

      const result = await AuthMiddleware.authenticate(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      const data = await response.json();
      expect(data.error).toBe('Authorization header is required');
      expect(response.status).toBe(401);
    });
  });
});
