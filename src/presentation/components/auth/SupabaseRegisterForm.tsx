'use client';

import React, { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useUnifiedAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
        onSuccess?.();
      }
    } catch (error) {
      setError('登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            パスワード
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="6文字以上で入力"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            パスワード確認
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="パスワードを再入力"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '登録中...' : 'アカウント作成'}
        </button>

        {onSwitchToLogin && (
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              既にアカウントをお持ちの方はこちら
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
