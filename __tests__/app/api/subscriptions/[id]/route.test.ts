import { NextRequest } from 'next/server';

// Supabaseの環境変数をモック
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// モジュールのモック
const mockDeleteSubscriptionUseCase = {
  execute: jest.fn(),
};

const mockUpdateSubscriptionUseCase = {
  execute: jest.fn(),
};

const mockSupabaseAuthMiddleware = {
  authenticate: jest.fn(),
};

const mockApiResponse = {
  success: jest.fn(),
  validationError: jest.fn(),
  serverError: jest.fn(),
};

const mockValidation = {
  validateFields: jest.fn(),
};

jest.mock('@prisma/client');
jest.mock('../../../../../src/infrastructure/PrismaSubscriptionRepository');
jest.mock('../../../../../src/infrastructure/PrismaUserRepository');
jest.mock(
  '../../../../../src/application/usecase/DeleteSubscriptionUseCase',
  () => ({
    DeleteSubscriptionUseCase: jest
      .fn()
      .mockImplementation(() => mockDeleteSubscriptionUseCase),
  })
);
jest.mock(
  '../../../../../src/application/usecase/UpdateSubscriptionUseCase',
  () => ({
    UpdateSubscriptionUseCase: jest
      .fn()
      .mockImplementation(() => mockUpdateSubscriptionUseCase),
  })
);
jest.mock(
  '../../../../../src/infrastructure/middleware/SupabaseAuthMiddleware',
  () => ({
    SupabaseAuthMiddleware: {
      authenticate: mockSupabaseAuthMiddleware.authenticate,
    },
  })
);
jest.mock('../../../../../src/infrastructure/utils/ApiResponse', () => ({
  ApiResponse: {
    success: mockApiResponse.success,
    validationError: mockApiResponse.validationError,
    serverError: mockApiResponse.serverError,
  },
}));
jest.mock('../../../../../src/infrastructure/utils/Validation', () => ({
  Validation: {
    validateFields: mockValidation.validateFields,
  },
}));

describe('/api/subscriptions/[id] - 基本的なAPIテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE', () => {
    it('認証されたユーザーがサブスクリプションを削除できる', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockSupabaseAuthMiddleware.authenticate.mockResolvedValue({
        user: mockUser,
      });

      mockDeleteSubscriptionUseCase.execute.mockResolvedValue(undefined);
      mockApiResponse.success.mockReturnValue(
        new Response(
          JSON.stringify({ message: 'サブスクリプションが削除されました' }),
          { status: 200 }
        )
      );

      const { DELETE } = await import(
        '../../../../../app/api/subscriptions/[id]/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/subscriptions/123',
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer test-token',
          },
        }
      );
      const params = Promise.resolve({ id: '123' });

      const response = await DELETE(request, { params });

      expect(mockDeleteSubscriptionUseCase.execute).toHaveBeenCalledWith({
        subscriptionId: '123',
        userId: 'user-1',
      });
      expect(mockApiResponse.success).toHaveBeenCalledWith({
        message: 'サブスクリプションが削除されました',
      });
    });
  });

  describe('PUT', () => {
    it('認証されたユーザーがサブスクリプションを更新できる', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockSupabaseAuthMiddleware.authenticate.mockResolvedValue({
        user: mockUser,
      });

      mockValidation.validateFields.mockReturnValue([]);
      mockUpdateSubscriptionUseCase.execute.mockResolvedValue(undefined);
      mockApiResponse.success.mockReturnValue(
        new Response(
          JSON.stringify({ message: 'サブスクリプションが更新されました' }),
          { status: 200 }
        )
      );

      const { PUT } = await import(
        '../../../../../app/api/subscriptions/[id]/route'
      );

      const requestBody = {
        name: 'Updated Netflix',
        price: 1200,
        currency: 'JPY',
        paymentCycle: 'monthly',
        category: 'entertainment',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/subscriptions/123',
        {
          method: 'PUT',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
        }
      );
      const params = Promise.resolve({ id: '123' });

      const response = await PUT(request, { params });

      expect(mockValidation.validateFields).toHaveBeenCalled();
      expect(mockUpdateSubscriptionUseCase.execute).toHaveBeenCalledWith({
        id: '123',
        userId: 'user-1',
        ...requestBody,
      });
      expect(mockApiResponse.success).toHaveBeenCalledWith({
        message: 'サブスクリプションが更新されました',
      });
    });
  });
});
