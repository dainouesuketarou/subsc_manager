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
  convertToJPY,
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
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="emoji-icon">📋</span>
        サブスク一覧
      </h3>
      <div className="space-y-3">
        {actualSubscriptions.map(subscription => {
          const jpyAmount = convertToJPYSync(
            subscription.price,
            subscription.currency
          );
          return (
            <div
              key={subscription.id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {subscription.name}
                </h4>
                <div className="flex space-x-1">
                  <button
                    onClick={() => onEdit(subscription)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                    title="編集"
                  >
                    <span className="emoji-icon text-sm">✏️</span>
                  </button>
                  <button
                    onClick={() => onDelete(subscription)}
                    className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                    title="削除"
                  >
                    <span className="emoji-icon text-sm">🗑️</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="emoji-icon">💰</span>
                  <span className="font-medium">
                    ¥{jpyAmount.toLocaleString()}
                  </span>
                  {subscription.currency !== 'JPY' && (
                    <span className="text-gray-400">
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
