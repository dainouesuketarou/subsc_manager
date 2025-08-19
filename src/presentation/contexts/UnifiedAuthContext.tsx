'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { SupabaseAuthService } from '../../infrastructure/services/SupabaseAuthService';
import { AuthUser } from '../../types/auth';

interface UnifiedAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(
  undefined
);

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

interface UnifiedAuthProviderProps {
  children: ReactNode;
}

export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 初期セッション取得
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: sessionUser } = await SupabaseAuthService.getSession();
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email,
            createdAt: new Date(sessionUser.created_at),
            updatedAt: new Date(sessionUser.updated_at),
          });
        }
      } catch (error) {
        console.error('Failed to get session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user: authUser, error } = await SupabaseAuthService.signIn(
        email,
        password
      );

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          createdAt: new Date(authUser.created_at),
          updatedAt: new Date(authUser.updated_at),
        });
        return {};
      } else {
        return { error: 'ログインに失敗しました' };
      }
    } catch (error) {
      console.error('Sign in exception:', error);
      return {
        error:
          'ログインに失敗しました。しばらく時間をおいて再度お試しください。',
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { user: authUser, error } = await SupabaseAuthService.signUp(
        email,
        password
      );

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      // メール確認が必要な場合（userがnullでerrorがundefined）
      if (!authUser) {
        return {}; // 成功（メール確認が必要）
      }

      // 即座にログインされる場合
      setUser({
        id: authUser.id,
        email: authUser.email,
        createdAt: new Date(authUser.created_at),
        updatedAt: new Date(authUser.updated_at),
      });
      return {};
    } catch (error) {
      console.error('Sign up exception:', error);
      return {
        error:
          'アカウント作成に失敗しました。しばらく時間をおいて再度お試しください。',
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await SupabaseAuthService.signOut();
      setUser(null);
      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      return await SupabaseAuthService.resetPassword(email);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      return await SupabaseAuthService.updatePassword(password);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const value: UnifiedAuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};
