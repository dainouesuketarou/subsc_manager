import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGuestSubscriptions } from '../contexts/GuestSubscriptionContext';
import { SubscriptionData } from '../types/subscription';
import { ExchangeRateService } from '../../infrastructure/services/ExchangeRateService';

export const useSubscriptionManager = () => {
  const { user, token, logout } = useAuth();
  const {
    subscriptions: guestSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  } = useGuestSubscriptions();

  const [currentSubscriptions, setCurrentSubscriptions] = useState<
    SubscriptionData[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );

  // 為替レートを取得
  const fetchExchangeRates = useCallback(async () => {
    try {
      const rates = await ExchangeRateService.getExchangeRates();
      setExchangeRates(rates);
    } catch (error) {
      console.warn('Failed to fetch exchange rates:', error);
    }
  }, []);

  // 初期化時に為替レートを取得
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  // サブスクリプションを取得
  const fetchSubscriptions = useCallback(async () => {
    if (!user || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      // APIレスポンスが { subscriptions: [...] } の形式の場合、subscriptionsプロパティを取得
      const subscriptions = Array.isArray(data)
        ? data
        : data.subscriptions || [];
      setCurrentSubscriptions(subscriptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  // サブスクリプションを削除
  const deleteSubscriptionHandler = useCallback(
    async (subscription: SubscriptionData) => {
      if (!user || !token) {
        // ゲストユーザーの場合
        deleteSubscription(subscription.id);
        return;
      }

      try {
        const response = await fetch(`/api/subscriptions/${subscription.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete subscription');
        }

        await fetchSubscriptions();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    },
    [user, token, fetchSubscriptions, deleteSubscription]
  );

  // 現在のサブスクリプションを更新
  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      setCurrentSubscriptions(guestSubscriptions);
    }
  }, [user, guestSubscriptions, fetchSubscriptions]);

  // カテゴリーの表示名を取得
  const getCategoryDisplayName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      VIDEO_STREAMING: '動画配信',
      MUSIC_STREAMING: '音楽配信',
      READING: '読書',
      GAMING: 'ゲーム',
      FITNESS: 'フィットネス',
      EDUCATION: '教育',
      PRODUCTIVITY: '生産性',
      CLOUD_STORAGE: 'クラウドストレージ',
      SECURITY: 'セキュリティ',
      OTHER: 'その他',
    };
    return categoryMap[category] || category;
  };

  // 支払いサイクルの表示名を取得
  const getPaymentCycleDisplayName = (paymentCycle: string): string => {
    const cycleMap: Record<string, string> = {
      DAILY: '日払い',
      WEEKLY: '週払い',
      MONTHLY: '月払い',
      SEMI_ANNUALLY: '半年払い',
      ANNUALLY: '年払い',
    };
    return cycleMap[paymentCycle] || paymentCycle;
  };

  // 通貨を円に変換する関数（リアルタイム為替レート使用）
  const convertToJPY = useCallback(
    async (amount: number, currency: string): Promise<number> => {
      try {
        return await ExchangeRateService.convertToJPY(amount, currency);
      } catch (error) {
        console.warn('Failed to convert currency, using fallback:', error);
        // フォールバック用の固定レート
        const fallbackRates: Record<string, number> = {
          JPY: 1,
          USD: 150,
          EUR: 160,
          GBP: 190,
          CAD: 110,
          AUD: 100,
          CHF: 170,
          CNY: 21,
          KRW: 0.11,
          SGD: 110,
        };
        return amount * (fallbackRates[currency] || 1);
      }
    },
    []
  );

  // 同期的な通貨変換（キャッシュされた為替レートを使用）
  const convertToJPYSync = useCallback(
    (amount: number, currency: string): number => {
      return amount * (exchangeRates[currency] || 1);
    },
    [exchangeRates]
  );

  // 次回支払日を計算
  const getNextPaymentDate = useCallback(
    (subscription: SubscriptionData): Date => {
      const startDate = new Date(subscription.paymentStartDate);
      const now = new Date();

      // 支払いサイクルに基づいて次回支払日を計算
      const getDaysInCycle = (cycle: string): number => {
        switch (cycle) {
          case 'DAILY':
            return 1;
          case 'WEEKLY':
            return 7;
          case 'MONTHLY':
            return 30;
          case 'SEMI_ANNUALLY':
            return 180;
          case 'ANNUALLY':
            return 365;
          default:
            return 30;
        }
      };

      const daysInCycle = getDaysInCycle(subscription.paymentCycle);
      const daysSinceStart = Math.floor(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const cyclesPassed = Math.floor(daysSinceStart / daysInCycle);
      const nextPaymentDays = (cyclesPassed + 1) * daysInCycle;

      const nextPaymentDate = new Date(startDate);
      nextPaymentDate.setDate(startDate.getDate() + nextPaymentDays);

      return nextPaymentDate;
    },
    []
  );

  return {
    user,
    token,
    logout,
    currentSubscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    deleteSubscription: deleteSubscriptionHandler,
    getCategoryDisplayName,
    getPaymentCycleDisplayName,
    convertToJPY,
    convertToJPYSync,
    getNextPaymentDate,
    fetchExchangeRates,
  };
};
