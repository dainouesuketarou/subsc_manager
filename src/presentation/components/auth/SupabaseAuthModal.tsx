'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SupabaseLoginForm } from './SupabaseLoginForm';
import { SupabaseRegisterForm } from './SupabaseRegisterForm';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const handleSuccess = () => {
    onClose();
    // ページをリロードして認証状態を更新
    window.location.reload();
  };

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'ログイン' : 'アカウント作成'}
    >
      <div className="w-full">
        {mode === 'login' ? (
          <SupabaseLoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <SupabaseRegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </div>
    </Modal>
  );
};
