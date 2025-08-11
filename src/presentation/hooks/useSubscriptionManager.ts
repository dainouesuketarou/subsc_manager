import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGuestSubscriptions } from '../contexts/GuestSubscriptionContext';
import { SubscriptionData } from '../types/subscription';

export const useSubscriptionManager = () => {
  const { user, token, logout } = useAuth();
  const {
    subscriptions: guestSubscriptions,
    deleteSubscription: deleteGuestSubscription,
  } = useGuestSubscriptions();

  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      if (!user || !token) {
        setSubscriptions([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('サブスクリプションの取得に失敗しました');
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  const deleteSubscription = async (subscription: SubscriptionData) => {
    if (user) {
      try {
        const response = await fetch(`/api/subscriptions/${subscription.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('削除に失敗しました');
        }

        await fetchSubscriptions();
      } catch (error) {
        setError(error instanceof Error ? error.message : '削除に失敗しました');
      }
    } else {
      deleteGuestSubscription(subscription.id);
    }
  };

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

  const getNextPaymentDate = (subscription: SubscriptionData): Date => {
    const startDate = new Date(subscription.paymentStartDate);
    const today = new Date();

    switch (subscription.paymentCycle) {
      case 'DAILY':
        return new Date(today.getTime() + 24 * 60 * 60 * 1000);
      case 'MONTHLY':
        return new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          startDate.getDate()
        );
      case 'SEMI_ANNUALLY':
        return new Date(
          today.getFullYear(),
          today.getMonth() + 6,
          startDate.getDate()
        );
      case 'ANNUALLY':
        const thisYearPayment = new Date(
          today.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );

        if (thisYearPayment > today) {
          return thisYearPayment;
        } else {
          return new Date(
            today.getFullYear() + 1,
            startDate.getMonth(),
            startDate.getDate()
          );
        }
      default:
        return startDate;
    }
  };

  const currentSubscriptions = user ? subscriptions : guestSubscriptions;

  return {
    user,
    token,
    logout,
    currentSubscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    deleteSubscription,
    getCategoryDisplayName,
    getNextPaymentDate,
  };
};
