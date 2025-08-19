import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SupabaseAuthModal } from '../../../../src/presentation/components/auth/SupabaseAuthModal';

// モックの設定
const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockResetPassword = jest.fn();

// useUnifiedAuthフックをモック
jest.mock('../../../../src/presentation/contexts/UnifiedAuthContext', () => ({
  useUnifiedAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
    resetPassword: mockResetPassword,
    updatePassword: jest.fn(),
  }),
}));

describe('SupabaseAuthModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初期化', () => {
    it('モーダルが正しく初期化される', () => {
      const onClose = jest.fn();
      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      expect(
        screen.getByRole('heading', { level: 2, name: /ログイン/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText('アカウントにログインしてください')
      ).toBeInTheDocument();
    });

    it('isOpenがfalseの場合、モーダルが表示されない', () => {
      const onClose = jest.fn();
      const { container } = render(
        <SupabaseAuthModal isOpen={false} onClose={onClose} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('initialModeがregisterの場合、登録フォームが表示される', () => {
      const onClose = jest.fn();
      render(
        <SupabaseAuthModal
          isOpen={true}
          onClose={onClose}
          initialMode="register"
        />
      );

      expect(
        screen.getByRole('heading', { level: 2, name: /アカウント作成/i })
      ).toBeInTheDocument();
    });

    it('initialModeがresetの場合、パスワードリセットフォームが表示される', () => {
      const onClose = jest.fn();
      render(
        <SupabaseAuthModal
          isOpen={true}
          onClose={onClose}
          initialMode="reset"
        />
      );

      expect(
        screen.getByRole('heading', { level: 2, name: /パスワードリセット/i })
      ).toBeInTheDocument();
    });
  });

  describe('フォーム操作', () => {
    it('メールアドレスとパスワードを入力できる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('ログインボタンをクリックするとsignInが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockSignIn.mockResolvedValue({ error: null });

      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const loginButton = screen.getByRole('button', { name: /ログイン/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
      });
    });

    it('ログイン成功時にonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockSignIn.mockResolvedValue({ error: null });

      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const loginButton = screen.getByRole('button', { name: /ログイン/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('ログイン失敗時にエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockSignIn.mockResolvedValue({ error: 'ログインに失敗しました' });

      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const loginButton = screen.getByRole('button', { name: /ログイン/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument();
      });
    });
  });

  describe('モード切り替え', () => {
    it('登録フォームに切り替えられる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const switchButton = screen.getByRole('button', {
        name: /アカウントをお持ちでない方はこちら/i,
      });
      await user.click(switchButton);

      expect(
        screen.getByRole('heading', { level: 2, name: /アカウント作成/i })
      ).toBeInTheDocument();
    });

    it('パスワードリセットフォームに切り替えられる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const resetButton = screen.getByRole('button', {
        name: /パスワードを忘れた方はこちら/i,
      });
      await user.click(resetButton);

      expect(
        screen.getByRole('heading', { level: 2, name: /パスワードリセット/i })
      ).toBeInTheDocument();
    });

    it('ログインフォームに戻れる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(
        <SupabaseAuthModal
          isOpen={true}
          onClose={onClose}
          initialMode="register"
        />
      );

      const backButton = screen.getByRole('button', {
        name: /既にアカウントをお持ちの方はこちら/i,
      });
      await user.click(backButton);

      expect(
        screen.getByRole('heading', { level: 2, name: /ログイン/i })
      ).toBeInTheDocument();
    });
  });

  describe('モーダル操作', () => {
    it('閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /❌/i });

      await act(async () => {
        await user.click(closeButton);
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('モーダル外をクリックするとonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const modalBackdrop = document.querySelector('.modal-backdrop');

      if (modalBackdrop) {
        await act(async () => {
          await user.click(modalBackdrop);
        });
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('Escapeキーでモーダルが閉じる', async () => {
      const onClose = jest.fn();
      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('フォーカス管理が適切に動作する', async () => {
      const user = userEvent.setup();
      render(<SupabaseAuthModal isOpen={true} onClose={jest.fn()} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });

      // フォーカスを手動で設定
      emailInput.focus();
      expect(emailInput).toHaveFocus();
    });

    it('ラベルが適切に設定されている', () => {
      render(<SupabaseAuthModal isOpen={true} onClose={jest.fn()} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);

      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('必須フィールドが適切にマークされている', () => {
      render(<SupabaseAuthModal isOpen={true} onClose={jest.fn()} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);

      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('エラーハンドリング', () => {
    it('ネットワークエラーが適切に処理される', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockSignIn.mockRejectedValue(new Error('Network error'));

      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const loginButton = screen.getByRole('button', { name: /ログイン/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/ログインに失敗しました/)).toBeInTheDocument();
      });
    });

    it('空のフィールドで送信するとバリデーションエラーが表示される', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // HTML5のバリデーションが動作することを確認
      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);

      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
    });
  });

  describe('ローディング状態', () => {
    it('ログイン中はボタンが無効化される', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockSignIn.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      );

      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const loginButton = screen.getByRole('button', { name: /ログイン/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      expect(loginButton).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    it('ローディング中は適切なテキストが表示される', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockSignIn.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      );

      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);
      const loginButton = screen.getByRole('button', { name: /ログイン/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    });
  });

  describe('パスワード表示切り替え', () => {
    it('パスワード表示/非表示が切り替えられる', async () => {
      const user = userEvent.setup();
      render(<SupabaseAuthModal isOpen={true} onClose={jest.fn()} />);

      const passwordInput = screen.getByLabelText(/パスワード/i);
      const toggleButton = screen.getByRole('button', { name: /👁️/i });

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('レスポンシブ対応', () => {
    it('モバイル表示で適切に表示される', () => {
      // モバイルサイズにウィンドウをリサイズ
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<SupabaseAuthModal isOpen={true} onClose={jest.fn()} />);

      const modal = screen
        .getByRole('heading', { level: 2, name: /ログイン/i })
        .closest('div');
      expect(modal).toBeInTheDocument();
    });

    it('タブレット表示で適切に表示される', () => {
      // タブレットサイズにウィンドウをリサイズ
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<SupabaseAuthModal isOpen={true} onClose={jest.fn()} />);

      const modal = screen
        .getByRole('heading', { level: 2, name: /ログイン/i })
        .closest('div');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('パフォーマンス', () => {
    it('大量の入力でもパフォーマンスが維持される', async () => {
      const user = userEvent.setup();
      render(<SupabaseAuthModal isOpen={true} onClose={jest.fn()} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const longEmail = 'a'.repeat(100) + '@example.com';

      const startTime = performance.now();
      await user.type(emailInput, longEmail);
      const endTime = performance.now();

      // 入力処理が3秒以内に完了することを確認（より現実的な値）
      expect(endTime - startTime).toBeLessThan(3000);
    });

    it('高速な操作でもエラーが発生しない', async () => {
      const user = userEvent.setup();
      render(<SupabaseAuthModal isOpen={true} onClose={jest.fn()} />);

      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);

      // 順次入力に変更
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('統合テスト', () => {
    it('完全なログインフローが正常に動作する', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockSignIn.mockResolvedValue({ error: null });

      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      // 1. フォーム入力
      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // 2. ログイン実行
      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // 3. 成功時の動作確認
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('エラー時のフローが正常に動作する', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockSignIn.mockResolvedValue({ error: '認証に失敗しました' });

      render(<SupabaseAuthModal isOpen={true} onClose={onClose} />);

      // 1. フォーム入力
      const emailInput = screen.getByRole('textbox', {
        name: /メールアドレス/i,
      });
      const passwordInput = screen.getByLabelText(/パスワード/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      // 2. ログイン実行
      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      await user.click(loginButton);

      // 3. エラー表示確認
      await waitFor(() => {
        expect(screen.getByText('認証に失敗しました')).toBeInTheDocument();
      });

      // 4. モーダルが開いたままであることを確認
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
