'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div
        className="flex items-center justify-center min-h-screen p-4 modal-backdrop"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onClose}
      >
        {/* モーダルコンテンツ */}
        <div
          className="inline-block bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all max-w-md w-full relative z-[9999] animate-in fade-in-0 zoom-in-95 duration-300 hover-lift"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-gradient-to-br from-white to-gray-50 px-6 pt-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                <span className="emoji-icon">🎯</span>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full p-1 transition-all duration-200 hover-scale"
              >
                <span className="emoji-icon">❌</span>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
