'use client';

import React, { useState } from 'react';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'パスワードリセット要求に失敗しました'
        );
      }

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'パスワードリセット要求に失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            パスワードリセット
          </h2>
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">
              パスワードリセット用のメールを送信しました。
              <br />
              メールの指示に従ってパスワードをリセットしてください。
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-4xl mb-4 bounce">🤔</div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          パスワードを忘れた場合
        </h2>
        <p className="text-gray-600">
          登録したメールアドレスを入力してください
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
          >
            <span className="emoji-icon">📧</span>
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
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

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                <span className="emoji-icon">📤</span>
                リセットメールを送信
              </>
            )}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200 hover-scale"
          >
            <span className="emoji-icon">🔙</span>
            ログイン画面に戻る
          </button>
        </div>
      </form>
    </div>
  );
};
