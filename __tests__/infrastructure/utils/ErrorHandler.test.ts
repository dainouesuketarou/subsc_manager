import { ErrorHandler } from '../../../src/infrastructure/utils/ErrorHandler';
import { ApiResponse } from '../../../src/infrastructure/utils/ApiResponse';

// ApiResponseのモック
jest.mock('../../../src/infrastructure/utils/ApiResponse', () => ({
  ApiResponse: {
    validationError: jest.fn(),
    notFound: jest.fn(),
    unauthorized: jest.fn(),
    serverError: jest.fn(),
  },
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 環境変数をリセット
    delete process.env.NODE_ENV;
  });

  describe('handleApiError', () => {
    it('バリデーションエラーを適切に処理する', () => {
      const mockResponse = new Response('Validation error', { status: 400 });
      (ApiResponse.validationError as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('Invalid payment cycle');
      const result = ErrorHandler.handleApiError(error, 'test-context');

      expect(ApiResponse.validationError).toHaveBeenCalledWith(
        'Invalid payment cycle'
      );
      expect(result).toBe(mockResponse);
    });

    it('異なるバリデーションエラーパターンを処理する', () => {
      const mockResponse = new Response('Validation error', { status: 400 });
      (ApiResponse.validationError as jest.Mock).mockReturnValue(mockResponse);

      const testCases = [
        'Invalid payment cycle',
        'Invalid currency',
        'Invalid email',
        'Password must be at least 6 characters',
      ];

      testCases.forEach(errorMessage => {
        const error = new Error(errorMessage);
        const result = ErrorHandler.handleApiError(error, 'test-context');

        expect(ApiResponse.validationError).toHaveBeenCalledWith(errorMessage);
        expect(result).toBe(mockResponse);
      });
    });

    it('NotFoundエラーを適切に処理する', () => {
      const mockResponse = new Response('Not found', { status: 404 });
      (ApiResponse.notFound as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('User not found');
      const result = ErrorHandler.handleApiError(error, 'test-context');

      expect(ApiResponse.notFound).toHaveBeenCalledWith('User not found');
      expect(result).toBe(mockResponse);
    });

    it('異なるNotFoundエラーパターンを処理する', () => {
      const mockResponse = new Response('Not found', { status: 404 });
      (ApiResponse.notFound as jest.Mock).mockReturnValue(mockResponse);

      const testCases = ['User not found', 'Subscription not found'];

      testCases.forEach(errorMessage => {
        const error = new Error(errorMessage);
        const result = ErrorHandler.handleApiError(error, 'test-context');

        expect(ApiResponse.notFound).toHaveBeenCalledWith(errorMessage);
        expect(result).toBe(mockResponse);
      });
    });

    it('認証エラーを適切に処理する', () => {
      const mockResponse = new Response('Unauthorized', { status: 401 });
      (ApiResponse.unauthorized as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('Unauthorized');
      const result = ErrorHandler.handleApiError(error, 'test-context');

      expect(ApiResponse.unauthorized).toHaveBeenCalledWith('Unauthorized');
      expect(result).toBe(mockResponse);
    });

    it('異なる認証エラーパターンを処理する', () => {
      const mockResponse = new Response('Unauthorized', { status: 401 });
      (ApiResponse.unauthorized as jest.Mock).mockReturnValue(mockResponse);

      const testCases = ['Unauthorized', 'Authentication failed'];

      testCases.forEach(errorMessage => {
        const error = new Error(errorMessage);
        const result = ErrorHandler.handleApiError(error, 'test-context');

        expect(ApiResponse.unauthorized).toHaveBeenCalledWith(errorMessage);
        expect(result).toBe(mockResponse);
      });
    });

    it('開発環境で一般的なエラーを処理する', () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('Database connection failed');
      const result = ErrorHandler.handleApiError(error, 'test-context');

      expect(ApiResponse.serverError).toHaveBeenCalledWith(
        'Database connection failed'
      );
      expect(result).toBe(mockResponse);
    });

    it('本番環境で一般的なエラーを処理する', () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('Database connection failed');
      const result = ErrorHandler.handleApiError(error, 'test-context');

      expect(ApiResponse.serverError).toHaveBeenCalledWith(
        'Internal server error'
      );
      expect(result).toBe(mockResponse);
    });

    it('未知のエラータイプを処理する', () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const unknownError = 'Unknown error type';
      const result = ErrorHandler.handleApiError(unknownError, 'test-context');

      expect(ApiResponse.serverError).toHaveBeenCalledWith(
        'Unknown error occurred'
      );
      expect(result).toBe(mockResponse);
    });

    it('本番環境で未知のエラータイプを処理する', () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const unknownError = 'Unknown error type';
      const result = ErrorHandler.handleApiError(unknownError, 'test-context');

      expect(ApiResponse.serverError).toHaveBeenCalledWith(
        'Internal server error'
      );
      expect(result).toBe(mockResponse);
    });

    it('nullエラーを処理する', () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const result = ErrorHandler.handleApiError(null, 'test-context');

      expect(ApiResponse.serverError).toHaveBeenCalledWith(
        'Unknown error occurred'
      );
      expect(result).toBe(mockResponse);
    });

    it('undefinedエラーを処理する', () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const result = ErrorHandler.handleApiError(undefined, 'test-context');

      expect(ApiResponse.serverError).toHaveBeenCalledWith(
        'Unknown error occurred'
      );
      expect(result).toBe(mockResponse);
    });

    it('エラーログが出力される', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('Test error');
      ErrorHandler.handleApiError(error, 'test-context');

      expect(consoleSpy).toHaveBeenCalledWith('Error in test-context:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('withErrorHandling', () => {
    it('正常に実行される関数の結果を返す', async () => {
      const mockFunction = jest.fn().mockResolvedValue('success result');
      const result = await ErrorHandler.withErrorHandling(
        mockFunction,
        'test-context'
      );

      expect(mockFunction).toHaveBeenCalled();
      expect(result).toBe('success result');
    });

    it('エラーが発生した場合、エラーハンドラーを呼び出す', async () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('Test error');
      const mockFunction = jest.fn().mockRejectedValue(error);

      const result = await ErrorHandler.withErrorHandling(
        mockFunction,
        'test-context'
      );

      expect(mockFunction).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it('非同期エラーを適切に処理する', async () => {
      const mockResponse = new Response('Validation error', { status: 400 });
      (ApiResponse.validationError as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('Invalid email');
      const mockFunction = jest.fn().mockRejectedValue(error);

      const result = await ErrorHandler.withErrorHandling(
        mockFunction,
        'test-context'
      );

      expect(result).toBe(mockResponse);
      expect(ApiResponse.validationError).toHaveBeenCalledWith('Invalid email');
    });

    it('複雑なエラーシナリオを処理する', async () => {
      const testCases = [
        {
          error: new Error('User not found'),
          expectedMethod: 'notFound',
          expectedMessage: 'User not found',
        },
        {
          error: new Error('Unauthorized access'),
          expectedMethod: 'unauthorized',
          expectedMessage: 'Unauthorized access',
        },
        {
          error: new Error('Database connection failed'),
          expectedMethod: 'serverError',
          expectedMessage: 'Database connection failed',
        },
      ];

      for (const { error, expectedMethod, expectedMessage } of testCases) {
        const mockResponse = new Response('Error', { status: 500 });
        (
          ApiResponse[expectedMethod as keyof typeof ApiResponse] as jest.Mock
        ).mockReturnValue(mockResponse);

        const mockFunction = jest.fn().mockRejectedValue(error);
        const result = await ErrorHandler.withErrorHandling(
          mockFunction,
          'test-context'
        );

        expect(result).toBe(mockResponse);
        expect(
          ApiResponse[expectedMethod as keyof typeof ApiResponse]
        ).toHaveBeenCalledWith(expectedMessage);
      }
    });

    it('本番環境でのエラーハンドリング', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('Sensitive error message');
      const mockFunction = jest.fn().mockRejectedValue(error);

      const result = await ErrorHandler.withErrorHandling(
        mockFunction,
        'test-context'
      );

      expect(result).toBe(mockResponse);
      expect(ApiResponse.serverError).toHaveBeenCalledWith(
        'Internal server error'
      );
    });

    it('複数のエラーが連続して発生する場合の処理', async () => {
      const mockResponse1 = new Response('Validation error', { status: 400 });
      const mockResponse2 = new Response('Not found', { status: 404 });

      (ApiResponse.validationError as jest.Mock).mockReturnValue(mockResponse1);
      (ApiResponse.notFound as jest.Mock).mockReturnValue(mockResponse2);

      const error1 = new Error('Invalid payment cycle');
      const error2 = new Error('User not found');

      const mockFunction1 = jest.fn().mockRejectedValue(error1);
      const mockFunction2 = jest.fn().mockRejectedValue(error2);

      const result1 = await ErrorHandler.withErrorHandling(
        mockFunction1,
        'test-context-1'
      );
      const result2 = await ErrorHandler.withErrorHandling(
        mockFunction2,
        'test-context-2'
      );

      expect(result1).toBe(mockResponse1);
      expect(result2).toBe(mockResponse2);
      expect(ApiResponse.validationError).toHaveBeenCalledWith(
        'Invalid payment cycle'
      );
      expect(ApiResponse.notFound).toHaveBeenCalledWith('User not found');
    });
  });

  describe('エッジケース', () => {
    it('空のエラーメッセージを処理する', () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const error = new Error('');
      const result = ErrorHandler.handleApiError(error, 'test-context');

      expect(ApiResponse.serverError).toHaveBeenCalledWith('');
      expect(result).toBe(mockResponse);
    });

    it('非常に長いエラーメッセージを処理する', () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const longMessage = 'a'.repeat(10000);
      const error = new Error(longMessage);
      const result = ErrorHandler.handleApiError(error, 'test-context');

      expect(ApiResponse.serverError).toHaveBeenCalledWith(longMessage);
      expect(result).toBe(mockResponse);
    });

    it('特殊文字を含むエラーメッセージを処理する', () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (ApiResponse.serverError as jest.Mock).mockReturnValue(mockResponse);

      const specialMessage =
        'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      const error = new Error(specialMessage);
      const result = ErrorHandler.handleApiError(error, 'test-context');

      expect(ApiResponse.serverError).toHaveBeenCalledWith(specialMessage);
      expect(result).toBe(mockResponse);
    });

    it('非同期関数がnullを返す場合', async () => {
      const mockFunction = jest.fn().mockResolvedValue(null);
      const result = await ErrorHandler.withErrorHandling(
        mockFunction,
        'test-context'
      );

      expect(result).toBeNull();
    });

    it('非同期関数がundefinedを返す場合', async () => {
      const mockFunction = jest.fn().mockResolvedValue(undefined);
      const result = await ErrorHandler.withErrorHandling(
        mockFunction,
        'test-context'
      );

      expect(result).toBeUndefined();
    });
  });
});
