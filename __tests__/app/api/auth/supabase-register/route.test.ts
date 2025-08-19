import { NextRequest } from 'next/server';

// Supabaseの環境変数をモック
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// モジュールのモック
const mockSupabaseAuthService = {
  signUp: jest.fn(),
};

const mockValidation = {
  validateFields: jest.fn(),
};

const mockApiResponse = {
  validationError: jest.fn(),
  success: jest.fn(),
  serverError: jest.fn(),
};

jest.mock(
  '../../../../../src/infrastructure/services/SupabaseAuthService',
  () => ({
    SupabaseAuthService: {
      signUp: mockSupabaseAuthService.signUp,
    },
  })
);

jest.mock('../../../../../src/infrastructure/utils/Validation', () => ({
  Validation: {
    validateFields: mockValidation.validateFields,
  },
}));

jest.mock('../../../../../src/infrastructure/utils/ApiResponse', () => ({
  ApiResponse: {
    validationError: mockApiResponse.validationError,
    success: mockApiResponse.success,
    serverError: mockApiResponse.serverError,
  },
}));

describe('/api/auth/supabase-register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('正常な登録リクエストで成功レスポンスを返す', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };

      mockValidation.validateFields.mockReturnValue([]);
      mockSupabaseAuthService.signUp.mockResolvedValue({
        user: mockUser,
        session: mockSession,
        error: null,
      });
      mockApiResponse.success.mockReturnValue(
        new Response(JSON.stringify({ success: true }), { status: 201 })
      );

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockValidation.validateFields).toHaveBeenCalledWith({
        email: { value: 'test@example.com', rules: ['required', 'email'] },
        password: { value: 'password123', rules: ['required', 'password'] },
      });
      expect(mockSupabaseAuthService.signUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(mockApiResponse.success).toHaveBeenCalledWith(
        {
          user: mockUser,
          session: mockSession,
          message: '登録が完了しました',
        },
        201
      );
    });

    it('バリデーションエラーがある場合、エラーレスポンスを返す', async () => {
      const validationError = 'メールアドレスの形式が正しくありません';
      mockValidation.validateFields.mockReturnValue([validationError]);
      mockApiResponse.validationError.mockReturnValue(
        new Response(JSON.stringify({ error: validationError }), {
          status: 400,
        })
      );

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: 'invalid-email',
        password: 'password123',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockValidation.validateFields).toHaveBeenCalled();
      expect(mockApiResponse.validationError).toHaveBeenCalledWith(
        validationError
      );
      expect(mockSupabaseAuthService.signUp).not.toHaveBeenCalled();
    });

    it('Supabase登録でエラーが発生した場合、エラーレスポンスを返す', async () => {
      const authError = 'Email already exists';
      mockValidation.validateFields.mockReturnValue([]);
      mockSupabaseAuthService.signUp.mockResolvedValue({
        user: null,
        session: null,
        error: authError,
      });
      mockApiResponse.validationError.mockReturnValue(
        new Response(JSON.stringify({ error: authError }), { status: 400 })
      );

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockApiResponse.validationError).toHaveBeenCalledWith(authError);
    });

    it('ユーザーが取得できない場合、サーバーエラーレスポンスを返す', async () => {
      mockValidation.validateFields.mockReturnValue([]);
      mockSupabaseAuthService.signUp.mockResolvedValue({
        user: null,
        session: null,
        error: null,
      });
      mockApiResponse.serverError.mockReturnValue(
        new Response(JSON.stringify({ error: '登録に失敗しました' }), {
          status: 500,
        })
      );

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockApiResponse.serverError).toHaveBeenCalledWith(
        '登録に失敗しました'
      );
    });

    it('予期しないエラーが発生した場合、サーバーエラーレスポンスを返す（開発環境）', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockValidation.validateFields.mockReturnValue([]);
      mockSupabaseAuthService.signUp.mockRejectedValue(unexpectedError);
      mockApiResponse.serverError.mockReturnValue(
        new Response(JSON.stringify({ error: 'Database connection failed' }), {
          status: 500,
        })
      );

      // 開発環境をシミュレート
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockApiResponse.serverError).toHaveBeenCalledWith(
        'Database connection failed'
      );

      // 環境変数を元に戻す
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });

    it('予期しないエラーが発生した場合、サーバーエラーレスポンスを返す（本番環境）', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockValidation.validateFields.mockReturnValue([]);
      mockSupabaseAuthService.signUp.mockRejectedValue(unexpectedError);
      mockApiResponse.serverError.mockReturnValue(
        new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
        })
      );

      // 本番環境をシミュレート
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
      });

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockApiResponse.serverError).toHaveBeenCalledWith(
        'Internal server error'
      );

      // 環境変数を元に戻す
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });

    it('リクエストボディが不正なJSONの場合、エラーレスポンスを返す', async () => {
      mockApiResponse.serverError.mockReturnValue(
        new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 500 })
      );

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: 'invalid-json',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockApiResponse.serverError).toHaveBeenCalled();
    });

    it('必須フィールドが不足している場合、バリデーションエラーを返す', async () => {
      const validationError = 'メールアドレスは必須です';
      mockValidation.validateFields.mockReturnValue([validationError]);
      mockApiResponse.validationError.mockReturnValue(
        new Response(JSON.stringify({ error: validationError }), {
          status: 400,
        })
      );

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: '',
        password: 'password123',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockApiResponse.validationError).toHaveBeenCalledWith(
        validationError
      );
    });

    it('パスワードが短すぎる場合、バリデーションエラーを返す', async () => {
      const validationError = 'パスワードは8文字以上である必要があります';
      mockValidation.validateFields.mockReturnValue([validationError]);
      mockApiResponse.validationError.mockReturnValue(
        new Response(JSON.stringify({ error: validationError }), {
          status: 400,
        })
      );

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: 'test@example.com',
        password: '123',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockApiResponse.validationError).toHaveBeenCalledWith(
        validationError
      );
    });

    it('既存のメールアドレスで登録しようとした場合、エラーレスポンスを返す', async () => {
      const authError = 'User already registered';
      mockValidation.validateFields.mockReturnValue([]);
      mockSupabaseAuthService.signUp.mockResolvedValue({
        user: null,
        session: null,
        error: authError,
      });
      mockApiResponse.validationError.mockReturnValue(
        new Response(JSON.stringify({ error: authError }), { status: 400 })
      );

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockApiResponse.validationError).toHaveBeenCalledWith(authError);
    });

    it('パスワードが弱すぎる場合、バリデーションエラーを返す', async () => {
      const validationError = 'パスワードは英数字を含む必要があります';
      mockValidation.validateFields.mockReturnValue([validationError]);
      mockApiResponse.validationError.mockReturnValue(
        new Response(JSON.stringify({ error: validationError }), {
          status: 400,
        })
      );

      const { POST } = await import(
        '../../../../../app/api/auth/supabase-register/route'
      );

      const requestBody = {
        email: 'test@example.com',
        password: 'password',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/auth/supabase-register',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      expect(mockApiResponse.validationError).toHaveBeenCalledWith(
        validationError
      );
    });
  });
});
