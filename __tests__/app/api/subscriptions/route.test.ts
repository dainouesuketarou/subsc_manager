import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedRequest } from '../../../../src/infrastructure/middleware/SupabaseAuthMiddleware';

// Supabaseの環境変数をモック
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// モジュールのモック
const mockRegisterUseCase = {
  execute: jest.fn(),
};

const mockGetSubscriptionsUseCase = {
  execute: jest.fn(),
};

const mockSupabaseAuthMiddleware = {
  withAuth: jest.fn(),
};

const mockApiResponse = {
  success: jest.fn(),
  validationError: jest.fn(),
  serverError: jest.fn(),
};

const mockValidation = {
  validateFields: jest.fn(),
};

// モックを設定
jest.mock('@prisma/client');
jest.mock('../../../../src/infrastructure/PrismaSubscriptionRepository');
jest.mock('../../../../src/infrastructure/PrismaUserRepository');
jest.mock(
  '../../../../src/application/usecase/RegisterSubscriptionUseCase',
  () => ({
    RegisterSubscriptionUseCase: jest
      .fn()
      .mockImplementation(() => mockRegisterUseCase),
  })
);
jest.mock(
  '../../../../src/application/usecase/GetSubscriptionsUseCase',
  () => ({
    GetSubscriptionsUseCase: jest
      .fn()
      .mockImplementation(() => mockGetSubscriptionsUseCase),
  })
);
jest.mock(
  '../../../../src/infrastructure/middleware/SupabaseAuthMiddleware',
  () => ({
    SupabaseAuthMiddleware: {
      withAuth: mockSupabaseAuthMiddleware.withAuth,
    },
  })
);
jest.mock('../../../../src/infrastructure/utils/ApiResponse', () => ({
  ApiResponse: {
    success: mockApiResponse.success,
    validationError: mockApiResponse.validationError,
    serverError: mockApiResponse.serverError,
  },
}));
jest.mock('../../../../src/infrastructure/utils/Validation', () => ({
  Validation: {
    validateFields: mockValidation.validateFields,
  },
}));

describe('/api/subscriptions - 基本的なAPIテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('認証されたユーザーがサブスクリプションを取得できる', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'monthly',
          category: 'entertainment',
        },
      ];

      mockGetSubscriptionsUseCase.execute.mockResolvedValue(mockSubscriptions);
      mockApiResponse.success.mockReturnValue(
        new Response(JSON.stringify({ data: mockSubscriptions }), {
          status: 200,
        })
      );

      // withAuthメソッドをモックして、認証済みリクエストを返すようにする
      mockSupabaseAuthMiddleware.withAuth.mockImplementation(handler => {
        return async (request: NextRequest) => {
          const authenticatedRequest = request as NextRequest & {
            user: { id: string; email: string };
          };
          authenticatedRequest.user = {
            id: 'user-1',
            email: 'test@example.com',
          };
          return handler(authenticatedRequest);
        };
      });

      const { GET } = await import('../../../../app/api/subscriptions/route');

      const request = new NextRequest(
        'http://localhost:3000/api/subscriptions',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-token',
          },
        }
      );

      const response = await GET(request);

      expect(mockGetSubscriptionsUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-1',
      });
      expect(mockApiResponse.success).toHaveBeenCalledWith(mockSubscriptions);
    });
  });

  describe('POST', () => {
    it('認証されたユーザーがサブスクリプションを登録できる', async () => {
      const mockSubscription = {
        id: 'sub-1',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'monthly',
        category: 'entertainment',
      };

      mockValidation.validateFields.mockReturnValue([]);
      mockRegisterUseCase.execute.mockResolvedValue(mockSubscription);
      mockApiResponse.success.mockReturnValue(
        new Response(JSON.stringify({ data: mockSubscription }), {
          status: 201,
        })
      );

      // withAuthメソッドをモックして、認証済みリクエストを返すようにする
      mockSupabaseAuthMiddleware.withAuth.mockImplementation(handler => {
        return async (request: NextRequest) => {
          const authenticatedRequest = request as NextRequest & {
            user: { id: string; email: string };
          };
          authenticatedRequest.user = {
            id: 'user-1',
            email: 'test@example.com',
          };
          return handler(authenticatedRequest);
        };
      });

      const { POST } = await import('../../../../app/api/subscriptions/route');

      const requestBody = {
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'monthly',
        category: 'entertainment',
        paymentStartDate: '2024-01-01',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/subscriptions',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
        }
      );

      const response = await POST(request);

      expect(mockValidation.validateFields).toHaveBeenCalled();
      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        userEmail: 'test@example.com',
        ...requestBody,
      });
      expect(mockApiResponse.success).toHaveBeenCalledWith(
        mockSubscription,
        201
      );
    });
  });
});
