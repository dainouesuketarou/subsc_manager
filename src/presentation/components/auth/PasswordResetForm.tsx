'use client';

import React, { useState, useCallback } from 'react';
import { SupabaseAuthService } from '../../../infrastructure/services/SupabaseAuthService';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');

      if (!email) {
        setError('メールアドレスを入力してください');
        return;
      }

      setIsLoading(true);

      try {
        const result = await SupabaseAuthService.resetPassword(email);

        if (result.error) {
          setError(result.error);
        } else {
          setSuccessMessage(
            'パスワードリセットメールを送信しました。メールボックスを確認してください。'
          );
          // フォームをリセット
          setEmail('');
          // 5秒後に成功メッセージを消す
          setTimeout(() => {
            setSuccessMessage('');
            onSuccess?.();
          }, 5000);
        }
      } catch (error) {
        console.error('Password reset error:', error);
        setError(
          'パスワードリセットに失敗しました。しばらく時間をおいて再度お試しください。'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, onSuccess]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      setError(''); // エラーをクリア
    },
    []
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          パスワードリセット
        </h2>
        <p className="text-gray-600">
          登録済みのメールアドレスを入力してください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
          >
            <span className="emoji-icon">📧</span>
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift disabled:opacity-50"
            placeholder="example@email.com"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 wiggle">
            <div className="text-sm text-red-700 font-medium flex items-center">
              <span className="emoji-icon">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="text-sm text-green-700 font-medium flex items-center">
              <span className="emoji-icon">✅</span>
              {successMessage}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 border border-transparent rounded-lg text-sm font-semibold text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="emoji-icon">⏳</span>
              送信中...
            </div>
          ) : (
            <>
              <span className="emoji-icon">📧</span>
              リセットメールを送信
            </>
          )}
        </button>

        {onSwitchToLogin && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onSwitchToLogin}
              disabled={isLoading}
              className="text-purple-600 hover:text-purple-500 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              <span className="emoji-icon">🔙</span>
              ログインに戻る
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
