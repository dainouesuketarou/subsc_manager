import { SupabaseAuthService } from '../../../src/infrastructure/services/SupabaseAuthService';
import { supabase } from '../../../src/infrastructure/supabase/client';

// Supabaseクライアントのモック
jest.mock('../../../src/infrastructure/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

// window.locationのモックはjest.setup.tsで設定済み

describe('SupabaseAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('translateErrorToJapanese', () => {
    it('既知のエラーメッセージを正しく翻訳する', () => {
      const testCases = [
        {
          input: 'Invalid login credentials',
          expected: 'メールアドレスまたはパスワードが正しくありません',
        },
        {
          input: 'Email not confirmed',
          expected:
            'メールアドレスが確認されていません。確認メールをチェックしてください',
        },
        {
          input: 'User not found',
          expected: 'ユーザーが見つかりません',
        },
        {
          input: 'Too many requests',
          expected:
            'リクエストが多すぎます。しばらく時間をおいて再度お試しください',
        },
        {
          input: 'Invalid email',
          expected: '無効なメールアドレスです',
        },
        {
          input: 'Password should be at least 6 characters',
          expected: 'パスワードは6文字以上である必要があります',
        },
        {
          input: 'User already registered',
          expected: 'このメールアドレスは既に登録されています',
        },
        {
          input: 'Token expired',
          expected: 'セッションが期限切れです。再度ログインしてください',
        },
      ];

      testCases.forEach(({ input, expected }) => {
        // プライベートメソッドをテストするため、実際のエラーケースでテスト
        const result = SupabaseAuthService['translateErrorToJapanese'](input);
        expect(result).toBe(expected);
      });
    });

    it('未知のエラーメッセージに対してデフォルト形式を返す', () => {
      const unknownError = 'Unknown error message';
      const result =
        SupabaseAuthService['translateErrorToJapanese'](unknownError);
      expect(result).toBe(`エラー: ${unknownError}`);
    });

    it('キーワードを含むエラーメッセージを正しく翻訳する', () => {
      const testCases = [
        {
          input: 'Authentication failed due to invalid credentials',
          expected: 'メールアドレスまたはパスワードが正しくありません',
        },
        {
          input: 'Email not verified yet',
          expected:
            'メールアドレスが確認されていません。確認メールをチェックしてください',
        },
        {
          input: 'Account not found in database',
          expected: 'ユーザーが見つかりません',
        },
        {
          input: 'Rate limit exceeded for this IP',
          expected:
            'リクエストが多すぎます。しばらく時間をおいて再度お試しください',
        },
        {
          input: 'Network connection failed',
          expected:
            'ネットワークエラーが発生しました。インターネット接続を確認してください',
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = SupabaseAuthService['translateErrorToJapanese'](input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('signUp', () => {
    it('正常にサインアップが完了する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await SupabaseAuthService.signUp(
        'test@example.com',
        'password123'
      );

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost/auth/callback',
        },
      });
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
      expect(result.session).toBe(mockSession);
      expect(result.error).toBeUndefined();
    });

    it('メール確認が必要な場合の処理', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await SupabaseAuthService.signUp(
        'test@example.com',
        'password123'
      );

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('Supabaseエラーを適切に処理する', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid email' },
      });

      const result = await SupabaseAuthService.signUp(
        'invalid-email',
        'password123'
      );

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe('無効なメールアドレスです');
    });

    it('例外を適切に処理する', async () => {
      (supabase.auth.signUp as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await SupabaseAuthService.signUp(
        'test@example.com',
        'password123'
      );

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe(
        'アカウント作成に失敗しました。しばらく時間をおいて再度お試しください。'
      );
    });
  });

  describe('signIn', () => {
    it('正常にサインインが完了する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await SupabaseAuthService.signIn(
        'test@example.com',
        'password123'
      );

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
      expect(result.session).toBe(mockSession);
      expect(result.error).toBeUndefined();
    });

    it('Supabaseエラーを適切に処理する', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const result = await SupabaseAuthService.signIn(
        'test@example.com',
        'wrongpassword'
      );

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe(
        'メールアドレスまたはパスワードが正しくありません'
      );
    });

    it('例外を適切に処理する', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await SupabaseAuthService.signIn(
        'test@example.com',
        'password123'
      );

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe(
        'ログインに失敗しました。しばらく時間をおいて再度お試しください。'
      );
    });
  });

  describe('signOut', () => {
    it('正常にサインアウトが完了する', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await SupabaseAuthService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeUndefined();
    });

    it('Supabaseエラーを適切に処理する', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      const result = await SupabaseAuthService.signOut();

      expect(result.error).toBe('Sign out failed');
    });

    it('例外を適切に処理する', async () => {
      (supabase.auth.signOut as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await SupabaseAuthService.signOut();

      expect(result.error).toBe('Network error');
    });
  });

  describe('getSession', () => {
    it('正常にセッションを取得する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockSession = {
        user: mockUser,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await SupabaseAuthService.getSession();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
      expect(result.session).toBe(mockSession);
      expect(result.error).toBeUndefined();
    });

    it('セッションが存在しない場合の処理', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await SupabaseAuthService.getSession();

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('Supabaseエラーを適切に処理する', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      });

      const result = await SupabaseAuthService.getSession();

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe('Session error');
    });
  });

  describe('resetPassword', () => {
    it('正常にパスワードリセットメールを送信する', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result =
        await SupabaseAuthService.resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost/auth/reset-password',
        }
      );
      expect(result.error).toBeUndefined();
    });

    it('Supabaseエラーを適切に処理する', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: { message: 'Email not found' },
      });

      const result = await SupabaseAuthService.resetPassword(
        'nonexistent@example.com'
      );

      expect(result.error).toBe('Email not found');
    });
  });

  describe('updatePassword', () => {
    it('正常にパスワードを更新する', async () => {
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await SupabaseAuthService.updatePassword('newpassword123');

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
      expect(result.error).toBeUndefined();
    });

    it('Supabaseエラーを適切に処理する', async () => {
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        error: { message: 'Weak password' },
      });

      const result = await SupabaseAuthService.updatePassword('weak');

      expect(result.error).toBe('Weak password');
    });
  });

  describe('convertToUser', () => {
    it('SupabaseUserをUserエンティティに正しく変換する', () => {
      const mockSupabaseUser = {
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = SupabaseAuthService['convertToUser'](mockSupabaseUser);

      expect(result).toBeInstanceOf(Object);
      expect(result.toDTO().id).toBe('user-1');
      expect(result.toDTO().email.value).toBe('test@example.com');
      expect(result.toDTO().supabaseUserId).toBe('user-1');
    });
  });
});
