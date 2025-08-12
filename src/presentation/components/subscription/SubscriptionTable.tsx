import React from 'react';
import { SubscriptionData } from '../../types/subscription';
import { ExchangeRateService } from '../../../infrastructure/services/ExchangeRateService';

interface SubscriptionTableProps {
  subscriptions: SubscriptionData[];
  onEdit: (subscription: SubscriptionData) => void;
  onDelete: (subscription: SubscriptionData) => void;
  getCategoryDisplayName: (category: string) => string;
  getPaymentCycleDisplayName: (paymentCycle: string) => string;
  convertToJPY: (amount: number, currency: string) => Promise<number>;
  getNextPaymentDate: (subscription: SubscriptionData) => Date;
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  onEdit,
  onDelete,
  getCategoryDisplayName,
  getPaymentCycleDisplayName,
  getNextPaymentDate,
}) => {
  // subscriptionsがオブジェクトで、subscriptionsプロパティを持つ場合はそれを取得
  const actualSubscriptions = Array.isArray(subscriptions)
    ? subscriptions
    : (subscriptions as { subscriptions?: SubscriptionData[] })
        ?.subscriptions || [];

  const [exchangeRates, setExchangeRates] = React.useState<
    Record<string, number>
  >({});

  // 為替レートを取得
  React.useEffect(() => {
    const fetchRates = async () => {
      try {
        const rates = await ExchangeRateService.getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.warn('Failed to fetch exchange rates:', error);
      }
    };
    fetchRates();
  }, []);

  // 同期的な通貨変換（キャッシュされた為替レートを使用）
  const convertToJPYSync = React.useCallback(
    (amount: number, currency: string): number => {
      return amount * (exchangeRates[currency] || 1);
    },
    [exchangeRates]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center flex-shrink-0">
        <span className="emoji-icon">📋</span>
        サブスク一覧
      </h3>
      <div className="space-y-3 overflow-y-auto flex-1 max-h-[calc(100vh-300px)]">
        {actualSubscriptions
          .sort((a, b) => {
            // 次回請求日が近い順にソート
            const nextPaymentA = getNextPaymentDate(a);
            const nextPaymentB = getNextPaymentDate(b);
            return nextPaymentA.getTime() - nextPaymentB.getTime();
          })
          .map(subscription => {
            const jpyAmount = convertToJPYSync(
              subscription.price,
              subscription.currency
            );
            return (
              <div
                key={subscription.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {subscription.name}
                  </h4>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEdit(subscription)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                      title="編集"
                    >
                      <span className="emoji-icon text-sm">✏️</span>
                    </button>
                    <button
                      onClick={() => onDelete(subscription)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                      title="削除"
                    >
                      <span className="emoji-icon text-sm">🗑️</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <span className="emoji-icon">💰</span>
                    <span className="font-medium">
                      ¥{jpyAmount.toLocaleString()}
                    </span>
                    {subscription.currency !== 'JPY' && (
                      <span className="text-gray-400 dark:text-gray-500">
                        ({subscription.price} {subscription.currency})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="emoji-icon">🔄</span>
                    <span>
                      {getPaymentCycleDisplayName(subscription.paymentCycle)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="emoji-icon">📂</span>
                    <span>{getCategoryDisplayName(subscription.category)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="emoji-icon">📅</span>
                    <span>
                      {getNextPaymentDate(subscription).toLocaleDateString(
                        'ja-JP'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
