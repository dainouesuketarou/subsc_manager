'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SupabaseLoginForm } from './SupabaseLoginForm';
import { SupabaseRegisterForm } from './SupabaseRegisterForm';
import { PasswordResetForm } from './PasswordResetForm';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'reset';
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);

  const handleSuccess = () => {
    onClose();
    // ページリロードを削除して、コンテキストの更新に依存
  };

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');
  const switchToReset = () => setMode('reset');

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'ログイン';
      case 'register':
        return 'アカウント作成';
      case 'reset':
        return 'パスワードリセット';
      default:
        return 'ログイン';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <div className="w-full">
        {mode === 'login' ? (
          <SupabaseLoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={switchToRegister}
            onSwitchToReset={switchToReset}
          />
        ) : mode === 'register' ? (
          <SupabaseRegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={switchToLogin}
          />
        ) : (
          <PasswordResetForm
            onSuccess={handleSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </div>
    </Modal>
  );
};
