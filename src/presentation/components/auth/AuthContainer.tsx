'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

type AuthView = 'login' | 'register' | 'forgot-password';

export const AuthContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const { user, token } = useAuth();

  const switchToLogin = () => setCurrentView('login');
  const switchToRegister = () => setCurrentView('register');
  const switchToForgotPassword = () => setCurrentView('forgot-password');

  // ログイン済みユーザーが認証ページにアクセスした場合のリダイレクト
  useEffect(() => {
    if (user && token && window.location.pathname === '/auth') {
      window.location.href = '/';
    }
  }, [user, token]);

  switch (currentView) {
    case 'login':
      return (
        <LoginForm
          onSwitchToRegister={switchToRegister}
          onSwitchToForgotPassword={switchToForgotPassword}
        />
      );
    case 'register':
      return <RegisterForm onSwitchToLogin={switchToLogin} />;
    case 'forgot-password':
      return <ForgotPasswordForm onSwitchToLogin={switchToLogin} />;
    default:
      return (
        <LoginForm
          onSwitchToRegister={switchToRegister}
          onSwitchToForgotPassword={switchToForgotPassword}
        />
      );
  }
};
