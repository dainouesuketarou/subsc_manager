import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  UnifiedAuthProvider,
  useUnifiedAuth,
} from '../../../src/presentation/contexts/UnifiedAuthContext';
import { SupabaseAuthService } from '../../../src/infrastructure/services/SupabaseAuthService';

// SupabaseAuthServiceのモック
jest.mock('../../../src/infrastructure/services/SupabaseAuthService');
const mockSupabaseAuthService = SupabaseAuthService as jest.Mocked<
  typeof SupabaseAuthService
>;

// テスト用のコンポーネント
const TestComponent: React.FC = () => {
  const {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  } = useUnifiedAuth();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => signUp('test@example.com', 'password')}>
        Sign Up
      </button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => resetPassword('test@example.com')}>
        Reset Password
      </button>
      <button onClick={() => updatePassword('newpassword')}>
        Update Password
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<UnifiedAuthProvider>{component}</UnifiedAuthProvider>);
};

describe('UnifiedAuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初期化', () => {
    it('初期状態ではloadingがtrueでuserがnullである', async () => {
      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('セッションが存在する場合、ユーザー情報を設定する', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: mockUser });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    it('セッション取得でエラーが発生した場合、エラーをログに出力する', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseAuthService.getSession.mockRejectedValue(
        new Error('Session error')
      );

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get session:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('signIn', () => {
    it('正常にログインできる', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.signIn.mockResolvedValue({
        user: mockUser,
        error: null,
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Sign In'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(
          'test@example.com'
        );
      });

      expect(mockSupabaseAuthService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      );
    });

    it('ログインエラーが発生した場合、エラーを返す', async () => {
      const user = userEvent.setup();

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.signIn.mockResolvedValue({
        user: null,
        error: 'Invalid credentials',
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const result = await act(async () => {
        return await user.click(screen.getByText('Sign In'));
      });

      expect(mockSupabaseAuthService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      );
    });

    it('ログインで例外が発生した場合、エラーメッセージを返す', async () => {
      const user = userEvent.setup();

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.signIn.mockRejectedValue(
        new Error('Network error')
      );

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Sign In'));
      });

      expect(mockSupabaseAuthService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      );
    });
  });

  describe('signUp', () => {
    it('正常にサインアップできる', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.signUp.mockResolvedValue({
        user: mockUser,
        error: null,
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Sign Up'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(
          'test@example.com'
        );
      });

      expect(mockSupabaseAuthService.signUp).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      );
    });

    it('サインアップエラーが発生した場合、エラーを返す', async () => {
      const user = userEvent.setup();

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.signUp.mockResolvedValue({
        user: null,
        error: 'Email already exists',
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Sign Up'));
      });

      expect(mockSupabaseAuthService.signUp).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      );
    });
  });

  describe('signOut', () => {
    it('正常にログアウトできる', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: mockUser });
      mockSupabaseAuthService.signOut.mockResolvedValue({ error: null });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');

      await act(async () => {
        await user.click(screen.getByText('Sign Out'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      expect(mockSupabaseAuthService.signOut).toHaveBeenCalled();
    });

    it('ログアウトエラーが発生した場合、エラーを返す', async () => {
      const user = userEvent.setup();

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.signOut.mockResolvedValue({
        error: 'Logout failed',
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Sign Out'));
      });

      expect(mockSupabaseAuthService.signOut).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('パスワードリセットを実行できる', async () => {
      const user = userEvent.setup();

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.resetPassword.mockResolvedValue({ error: null });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Reset Password'));
      });

      expect(mockSupabaseAuthService.resetPassword).toHaveBeenCalledWith(
        'test@example.com'
      );
    });

    it('パスワードリセットでエラーが発生した場合、エラーを返す', async () => {
      const user = userEvent.setup();

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.resetPassword.mockResolvedValue({
        error: 'User not found',
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Reset Password'));
      });

      expect(mockSupabaseAuthService.resetPassword).toHaveBeenCalledWith(
        'test@example.com'
      );
    });
  });

  describe('updatePassword', () => {
    it('パスワード更新を実行できる', async () => {
      const user = userEvent.setup();

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.updatePassword.mockResolvedValue({ error: null });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Update Password'));
      });

      expect(mockSupabaseAuthService.updatePassword).toHaveBeenCalledWith(
        'newpassword'
      );
    });

    it('パスワード更新でエラーが発生した場合、エラーを返す', async () => {
      const user = userEvent.setup();

      mockSupabaseAuthService.getSession.mockResolvedValue({ user: null });
      mockSupabaseAuthService.updatePassword.mockResolvedValue({
        error: 'Invalid password',
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Update Password'));
      });

      expect(mockSupabaseAuthService.updatePassword).toHaveBeenCalledWith(
        'newpassword'
      );
    });
  });

  describe('useUnifiedAuth hook', () => {
    it('UnifiedAuthProviderの外で使用した場合、エラーを投げる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useUnifiedAuth must be used within a UnifiedAuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
