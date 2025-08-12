'use client';

import React, { useState, useCallback } from 'react';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';

interface SupabaseRegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const SupabaseRegisterForm: React.FC<SupabaseRegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useUnifiedAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');

      // パスワード確認
      if (password !== confirmPassword) {
        setError('パスワードが一致しません');
        return;
      }

      // パスワード強度チェック
      if (password.length < 6) {
        setError('パスワードは6文字以上で入力してください');
        return;
      }

      setIsLoading(true);

      try {
        const result = await signUp(email, password);

        if (result.error) {
          setError(result.error);
        } else {
          setSuccessMessage(
            'アカウントが正常に作成されました！確認メールをチェックしてください。'
          );
          // フォームをリセット
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          // 5秒後に成功メッセージを消す
          setTimeout(() => {
            setSuccessMessage('');
            onSuccess?.();
          }, 5000);
        }
      } catch (error) {
        console.error('Registration error:', error);
        setError(
          '登録に失敗しました。しばらく時間をおいて再度お試しください。'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, confirmPassword, signUp, onSuccess]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      setError(''); // エラーをクリア
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      setError(''); // エラーをクリア
    },
    []
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value);
      setError(''); // エラーをクリア
    },
    []
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          アカウント作成
        </h2>
        <p className="text-gray-600">新しいアカウントを作成してください</p>
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

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
          >
            <span className="emoji-icon">🔒</span>
            パスワード
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift disabled:opacity-50"
              placeholder="6文字以上で入力"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={isLoading}
            >
              {showPassword ? (
                <span className="emoji-icon text-lg">🙈</span>
              ) : (
                <span className="emoji-icon text-lg">👁️</span>
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
          >
            <span className="emoji-icon">🔐</span>
            パスワード確認
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift disabled:opacity-50"
              placeholder="パスワードを再入力"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <span className="emoji-icon text-lg">🙈</span>
              ) : (
                <span className="emoji-icon text-lg">👁️</span>
              )}
            </button>
          </div>
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
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 border border-transparent rounded-lg text-sm font-semibold text-white hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
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
              登録中...
            </div>
          ) : (
            <>
              <span className="emoji-icon">✨</span>
              アカウント作成
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
              <span className="emoji-icon">🔑</span>
              既にアカウントをお持ちの方はこちら
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
