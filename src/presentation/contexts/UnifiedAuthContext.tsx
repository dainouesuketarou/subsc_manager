'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { SupabaseAuthService } from '../../infrastructure/services/SupabaseAuthService';
import { User } from '../../infrastructure/supabase/client';

interface UnifiedAuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初期セッション取得
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: sessionUser } = await SupabaseAuthService.getSession();
        setUser(sessionUser);
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
        return { error };
      }

      setUser(authUser);
      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
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
        return { error };
      }

      setUser(authUser);
      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
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
