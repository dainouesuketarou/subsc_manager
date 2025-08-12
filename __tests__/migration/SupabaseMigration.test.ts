// テスト用のモック設定
jest.mock('@/infrastructure/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));

// windowオブジェクトをモック
Object.defineProperty(global, 'window', {
  value: {
    location: { origin: 'http://localhost:3000' },
  },
  writable: true,
});

import { SupabaseAuthService } from '@/infrastructure/services/SupabaseAuthService';
const { supabase } = require('@/infrastructure/supabase/client');

describe('Supabase Migration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // console.errorをモック
    console.error = jest.fn();
  });

  describe('SupabaseAuthService', () => {
    it('should sign up a new user successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      };

      const mockResponse = {
        data: { user: mockUser, session: mockSession },
        error: null,
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signUp(
        'test@example.com',
        'password123'
      );

      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      });
      expect(result.error).toBeUndefined();
    });

    it('should sign in a user successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      };

      const mockResponse = {
        data: { user: mockUser, session: mockSession },
        error: null,
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const result = await SupabaseAuthService.signIn(
        'test@example.com',
        'password123'
      );

      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      });
      expect(result.error).toBeUndefined();
    });

    it('should handle sign up error', async () => {
      const mockError = { message: 'User already registered' };
      const mockResponse = {
        data: { user: null, session: null },
        error: mockError,
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signUp(
        'existing@example.com',
        'password123'
      );

      expect(result.user).toBeNull();
      expect(result.error).toBe('このメールアドレスは既に登録されています');
    });

    it('should handle sign in error', async () => {
      const mockError = { message: 'Invalid login credentials' };
      const mockResponse = {
        data: { user: null, session: null },
        error: mockError,
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const result = await SupabaseAuthService.signIn(
        'test@example.com',
        'wrongpassword'
      );

      expect(result.user).toBeNull();
      expect(result.error).toBe(
        'メールアドレスまたはパスワードが正しくありません'
      );
    });

    it('should sign out successfully', async () => {
      const mockResponse = { error: null };
      (supabase.auth.signOut as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signOut();

      expect(result.error).toBeUndefined();
    });

    it('should get session successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: { session: { user: mockUser } },
        error: null,
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.getSession();

      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      });
      expect(result.error).toBeUndefined();
    });

    it('should reset password successfully', async () => {
      const mockResponse = { error: null };
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const result =
        await SupabaseAuthService.resetPassword('test@example.com');

      expect(result.error).toBeUndefined();
    });

    it('should update password successfully', async () => {
      const mockResponse = { error: null };
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.updatePassword('newpassword123');

      expect(result.error).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await SupabaseAuthService.signIn(
        'test@example.com',
        'password123'
      );

      expect(result.user).toBeNull();
      expect(result.error).toBe(
        'ログインに失敗しました。しばらく時間をおいて再度お試しください。'
      );
    });

    it('should handle unknown errors', async () => {
      (supabase.auth.signUp as jest.Mock).mockRejectedValue('Unknown error');

      const result = await SupabaseAuthService.signUp(
        'test@example.com',
        'password123'
      );

      expect(result.user).toBeNull();
      expect(result.error).toBe(
        'アカウント作成に失敗しました。しばらく時間をおいて再度お試しください。'
      );
    });
  });
});
