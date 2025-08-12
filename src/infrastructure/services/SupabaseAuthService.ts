import { supabase, AuthResponse } from '../supabase/client';

export class SupabaseAuthService {
  /**
   * Supabaseエラーメッセージを日本語に翻訳
   */
  private static translateErrorToJapanese(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials':
        'メールアドレスまたはパスワードが正しくありません',
      'Email not confirmed': 'メールアドレスが確認されていません',
      'User not found': 'ユーザーが見つかりません',
      'Too many requests':
        'リクエストが多すぎます。しばらく時間をおいて再度お試しください',
      'Invalid email': '無効なメールアドレスです',
      'Password should be at least 6 characters':
        'パスワードは6文字以上である必要があります',
      'Unable to validate email address: invalid format':
        'メールアドレスの形式が正しくありません',
      'User already registered': 'このメールアドレスは既に登録されています',
      'Signup is disabled': '新規登録は現在無効になっています',
      'Email rate limit exceeded':
        'メール送信の制限を超えました。しばらく時間をおいて再度お試しください',
      'Token expired': 'セッションが期限切れです。再度ログインしてください',
      'Invalid token': '無効なトークンです',
      'User already confirmed': 'ユーザーは既に確認済みです',
      'Password recovery email sent': 'パスワードリセットメールを送信しました',
      'Password recovery email not sent':
        'パスワードリセットメールの送信に失敗しました',
      // 追加のエラーパターン
      'Invalid password': 'パスワードが正しくありません',
      'Email already in use': 'このメールアドレスは既に使用されています',
      'Weak password':
        'パスワードが弱すぎます。より強力なパスワードを設定してください',
      'Account not found': 'アカウントが見つかりません',
      'Invalid credentials': '認証情報が正しくありません',
      'Authentication failed': '認証に失敗しました',
      'Network error':
        'ネットワークエラーが発生しました。インターネット接続を確認してください',
      'Server error':
        'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください',
      'Bad Request': 'リクエストが正しくありません',
      Unauthorized: '認証が必要です',
      Forbidden: 'アクセスが拒否されました',
      'Not Found': 'リソースが見つかりません',
      'Internal Server Error': 'サーバー内部エラーが発生しました',
    };

    // エラーメッセージに含まれる可能性のあるキーワードをチェック
    const lowerErrorMessage = errorMessage.toLowerCase();

    if (
      lowerErrorMessage.includes('invalid login credentials') ||
      lowerErrorMessage.includes('invalid credentials') ||
      lowerErrorMessage.includes('authentication failed')
    ) {
      return 'メールアドレスまたはパスワードが正しくありません';
    }

    if (
      lowerErrorMessage.includes('email not confirmed') ||
      lowerErrorMessage.includes('email not verified')
    ) {
      return 'メールアドレスが確認されていません。確認メールをチェックしてください';
    }

    if (
      lowerErrorMessage.includes('user not found') ||
      lowerErrorMessage.includes('account not found')
    ) {
      return 'ユーザーが見つかりません';
    }

    if (
      lowerErrorMessage.includes('too many requests') ||
      lowerErrorMessage.includes('rate limit')
    ) {
      return 'リクエストが多すぎます。しばらく時間をおいて再度お試しください';
    }

    if (
      lowerErrorMessage.includes('network error') ||
      lowerErrorMessage.includes('connection')
    ) {
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください';
    }

    return errorMap[errorMessage] || `エラー: ${errorMessage}`;
  }

  /**
   * メール/パスワードでサインアップ
   */
  static async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const japaneseError = this.translateErrorToJapanese(error.message);
        return { user: null, session: null, error: japaneseError };
      }

      // メール確認が必要な場合
      if (data.user && !data.session) {
        return {
          user: null,
          session: null,
          error: undefined, // エラーなし（メール確認が必要）
        };
      }

      // 即座にログインされる場合（メール確認が不要な場合）
      return {
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email!,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at!,
            }
          : null,
        session: data.session,
      };
    } catch (error) {
      console.error('SignUp error:', error);
      return {
        user: null,
        session: null,
        error:
          'アカウント作成に失敗しました。しばらく時間をおいて再度お試しください。',
      };
    }
  }

  /**
   * メール/パスワードでサインイン
   */
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const japaneseError = this.translateErrorToJapanese(error.message);
        return { user: null, session: null, error: japaneseError };
      }

      return {
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email!,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at!,
            }
          : null,
        session: data.session,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error:
          'ログインに失敗しました。しばらく時間をおいて再度お試しください。',
      };
    }
  }

  /**
   * サインアウト
   */
  static async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 現在のセッションを取得
   */
  static async getSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      return {
        user: data.session?.user
          ? {
              id: data.session.user.id,
              email: data.session.user.email!,
              created_at: data.session.user.created_at,
              updated_at: data.session.user.updated_at!,
            }
          : null,
        session: data.session,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * パスワードリセットメールを送信
   */
  static async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error: error?.message };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * パスワードを更新
   */
  static async updatePassword(password: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      return { error: error?.message };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
