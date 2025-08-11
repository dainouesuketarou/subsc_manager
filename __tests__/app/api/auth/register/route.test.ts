import { NextRequest } from 'next/server';

// モジュールのモック
jest.mock('@prisma/client');
jest.mock('../../../../../src/infrastructure/PrismaUserRepository');
jest.mock('../../../../../src/application/usecase/RegisterUserUseCase');

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('必須フィールドが不足している場合、エラーを返す', async () => {
      // 動的インポートでモジュールを取得
      const { POST } = await import('@app/api/auth/register/route');

      const requestBody = {
        email: 'test@example.com',
        // passwordが不足
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });
  });
});
