import { NextRequest } from 'next/server';

// モジュールのモック
jest.mock('@prisma/client');
jest.mock('../../../../src/infrastructure/PrismaSubscriptionRepository');
jest.mock('../../../../src/application/usecase/RegisterSubscriptionUseCase');
jest.mock('../../../../src/application/usecase/GetSubscriptionsUseCase');

describe('/api/subscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('認証ヘッダーがない場合、エラーを返す', async () => {
      // 動的インポートでモジュールを取得
      const { GET } = await import('@app/api/subscriptions/route');

      const url = new URL('http://localhost:3000/api/subscriptions');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authorization header is required');
    });
  });

  describe('POST', () => {
    it('認証ヘッダーがない場合、エラーを返す', async () => {
      // 動的インポートでモジュールを取得
      const { POST } = await import('@app/api/subscriptions/route');

      const requestBody = {
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        categoryId: 'category-1',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/subscriptions',
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

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authorization header is required');
    });
  });
});
