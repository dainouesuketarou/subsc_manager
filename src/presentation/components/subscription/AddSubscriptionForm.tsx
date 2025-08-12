'use client';

import React, { useState } from 'react';
import { useGuestSubscriptions } from '../../contexts/GuestSubscriptionContext';
import { useLoading } from '../../contexts/LoadingContext';

interface AddSubscriptionFormProps {
  onClose: () => void;
  isGuest: boolean;
  onSuccess?: () => void;
  initialDate?: Date;
}

export const AddSubscriptionForm: React.FC<AddSubscriptionFormProps> = ({
  onClose,
  isGuest,
  onSuccess,
  initialDate,
}) => {
  // 日付をYYYY-MM-DD形式の文字列に変換する関数
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // YYYY-MM-DD形式の文字列をDateオブジェクトに変換する関数
  const parseDateFromYYYYMMDD = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('JPY');
  const [paymentCycle, setPaymentCycle] = useState('MONTHLY');
  const [category, setCategory] = useState('OTHER');
  const [paymentStartDate, setPaymentStartDate] = useState(
    initialDate
      ? formatDateToYYYYMMDD(initialDate)
      : formatDateToYYYYMMDD(new Date())
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addSubscription } = useGuestSubscriptions();
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !price) {
      setError('サービス名と料金は必須です');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('有効な料金を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      if (isGuest) {
        // ゲストユーザーの場合、ローカルストレージに保存
        addSubscription({
          name,
          price: priceNum,
          currency,
          paymentCycle,
          category,
          paymentStartDate: parseDateFromYYYYMMDD(paymentStartDate),
        });
        onClose();
        if (onSuccess) onSuccess();
      } else {
        // ログインユーザーの場合、APIを呼び出し
        showLoading('サブスクリプションを追加中...');

        // Supabaseクライアントからセッションを取得
        const { supabase } = await import(
          '../../../infrastructure/supabase/client'
        );

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('認証セッションが見つかりません');
        }

        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name,
            price: priceNum,
            currency,
            paymentCycle,
            category,
            paymentStartDate,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || 'サブスクリプションの追加に失敗しました'
          );
        }

        await response.json();

        // 成功時は即座にモーダルを閉じる
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Add subscription error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'サブスクリプションの追加に失敗しました'
      );
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
        >
          <span className="emoji-icon">📱</span>
          サービス名 *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift"
          placeholder="Netflix, Spotify, etc."
          required
        />
      </div>

      <div>
        <label
          htmlFor="price"
          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
        >
          <span className="emoji-icon">💰</span>
          料金 *
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift"
          placeholder="1000"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <label
          htmlFor="currency"
          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
        >
          <span className="emoji-icon">💱</span>
          通貨
        </label>
        <select
          id="currency"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift"
        >
          <option value="JPY">円 (JPY)</option>
          <option value="USD">ドル (USD)</option>
          <option value="EUR">ユーロ (EUR)</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
        >
          <span className="emoji-icon">🏷️</span>
          カテゴリ
        </label>
        <select
          id="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift"
        >
          <option value="VIDEO_STREAMING">動画配信</option>
          <option value="MUSIC_STREAMING">音楽配信</option>
          <option value="READING">読書</option>
          <option value="GAMING">ゲーム</option>
          <option value="FITNESS">フィットネス</option>
          <option value="EDUCATION">教育</option>
          <option value="PRODUCTIVITY">生産性</option>
          <option value="CLOUD_STORAGE">クラウドストレージ</option>
          <option value="SECURITY">セキュリティ</option>
          <option value="OTHER">その他</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="paymentCycle"
          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
        >
          <span className="emoji-icon">🔄</span>
          支払い周期
        </label>
        <select
          id="paymentCycle"
          value={paymentCycle}
          onChange={e => setPaymentCycle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift"
        >
          <option value="MONTHLY">月額</option>
          <option value="SEMI_ANNUALLY">半年払い</option>
          <option value="ANNUALLY">年額</option>
          <option value="WEEKLY">週額</option>
          <option value="DAILY">日額</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="paymentStartDate"
          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
        >
          <span className="emoji-icon">📅</span>
          支払い開始日
        </label>
        <input
          type="date"
          id="paymentStartDate"
          value={paymentStartDate}
          onChange={e => setPaymentStartDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black font-medium hover-lift"
          required
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

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 hover-lift"
        >
          <span className="emoji-icon">❌</span>
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 border border-transparent rounded-lg text-sm font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
        >
          {isLoading ? (
            <div className="flex items-center">
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
              追加中...
            </div>
          ) : (
            <>
              <span className="emoji-icon">✨</span>
              追加
            </>
          )}
        </button>
      </div>
    </form>
  );
};
