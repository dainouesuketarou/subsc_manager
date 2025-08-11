'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

type AuthView = 'login' | 'register' | 'forgot-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const switchToLogin = () => setCurrentView('login');
  const switchToRegister = () => setCurrentView('register');
  const switchToForgotPassword = () => setCurrentView('forgot-password');

  const handleClose = () => {
    setCurrentView('login'); // モーダルを閉じる際にログイン画面にリセット
    onClose();
  };

  const getTitle = () => {
    switch (currentView) {
      case 'login':
        return 'ログイン';
      case 'register':
        return '新規登録';
      case 'forgot-password':
        return 'パスワードリセット';
      default:
        return '認証';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      <div className="max-w-md mx-auto">
        {currentView === 'login' && (
          <LoginForm
            onSwitchToRegister={switchToRegister}
            onSwitchToForgotPassword={switchToForgotPassword}
          />
        )}
        {currentView === 'register' && (
          <RegisterForm onSwitchToLogin={switchToLogin} />
        )}
        {currentView === 'forgot-password' && (
          <ForgotPasswordForm onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </Modal>
  );
};
