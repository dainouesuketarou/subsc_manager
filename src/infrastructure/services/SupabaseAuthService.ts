import { supabase, AuthResponse } from '../supabase/client';

export class SupabaseAuthService {
  /**
   * メール/パスワードでサインアップ
   */
  static async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error: error.message };
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        return { user: null, session: null, error: error.message };
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
