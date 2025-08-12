'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { SubscriptionData } from '../../types/subscription';
import { ExchangeRateService } from '../../../infrastructure/services/ExchangeRateService';

interface SubscriptionCalendarProps {
  subscriptions: SubscriptionData[];
  getCategoryDisplayName?: (category: string) => string;
}

// カテゴリー別の絵文字と色分け
const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case 'VIDEO_STREAMING':
      return '📺';
    case 'MUSIC_STREAMING':
      return '🎵';
    case 'READING':
      return '📖';
    case 'GAMING':
      return '🎮';
    case 'FITNESS':
      return '💪';
    case 'EDUCATION':
      return '📚';
    case 'PRODUCTIVITY':
      return '💼';
    case 'CLOUD_STORAGE':
      return '💾';
    case 'SECURITY':
      return '🔒';
    case 'OTHER':
      return '📱';
    default:
      return '📱';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'VIDEO_STREAMING':
      return 'bg-red-100 border-red-300 text-red-700';
    case 'MUSIC_STREAMING':
      return 'bg-purple-100 border-purple-300 text-purple-700';
    case 'READING':
      return 'bg-amber-100 border-amber-300 text-amber-700';
    case 'GAMING':
      return 'bg-blue-100 border-blue-300 text-blue-700';
    case 'FITNESS':
      return 'bg-orange-100 border-orange-300 text-orange-700';
    case 'EDUCATION':
      return 'bg-indigo-100 border-indigo-300 text-indigo-700';
    case 'PRODUCTIVITY':
      return 'bg-green-100 border-green-300 text-green-700';
    case 'CLOUD_STORAGE':
      return 'bg-gray-100 border-gray-300 text-gray-700';
    case 'SECURITY':
      return 'bg-yellow-100 border-yellow-300 text-yellow-700';
    case 'OTHER':
      return 'bg-pink-100 border-pink-300 text-pink-700';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-700';
  }
};

export const SubscriptionCalendar: React.FC<SubscriptionCalendarProps> = ({
  subscriptions,
  getCategoryDisplayName,
}) => {
  // subscriptionsがオブジェクトで、subscriptionsプロパティを持つ場合はそれを取得
  const actualSubscriptions = Array.isArray(subscriptions)
    ? subscriptions
    : (subscriptions as { subscriptions?: SubscriptionData[] })
        ?.subscriptions || [];

  // デバッグ用：subscriptionsの型と内容を確認
  console.log('SubscriptionCalendar - subscriptions:', {
    type: typeof subscriptions,
    isArray: Array.isArray(subscriptions),
    length: Array.isArray(subscriptions) ? subscriptions.length : 'N/A',
    value: subscriptions,
    actualSubscriptions,
  });

  const [currentDate, setCurrentDate] = useState(new Date());
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
  React.useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  // 通貨を円に変換する関数（キャッシュされた為替レートを使用）
  const convertToJPY = useCallback(
    (amount: number, currency: string): number => {
      return amount * (exchangeRates[currency] || 1);
    },
    [exchangeRates]
  );

  // 現在の月の最初の日と最後の日を取得
  const firstDayOfMonth = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    [currentDate]
  );

  const lastDayOfMonth = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    [currentDate]
  );

  const startDate = useMemo(() => {
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() - firstDayOfMonth.getDay());
    return date;
  }, [firstDayOfMonth]);

  // カレンダーに表示する日付の配列を生成
  const calendarDays = useMemo(() => {
    const days = [];
    const current = new Date(startDate);

    while (current <= lastDayOfMonth || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [startDate, lastDayOfMonth]);

  // 指定された日の支払い予定を計算
  const getPaymentsForDate = useCallback(
    (date: Date): SubscriptionData[] => {
      return actualSubscriptions.filter(subscription => {
        // paymentStartDateが文字列の場合はDateオブジェクトに変換
        const startDate =
          subscription.paymentStartDate instanceof Date
            ? subscription.paymentStartDate
            : new Date(subscription.paymentStartDate);

        // Invalid Dateの場合はスキップ
        if (isNaN(startDate.getTime())) {
          return false;
        }

        // 日付のみで比較するため、時間部分を除去
        const dateOnly = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const startDateOnly = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );

        // 支払い開始日より前の場合は支払いなし
        if (dateOnly < startDateOnly) {
          return false;
        }

        // 支払い開始日は必ず支払い日
        if (dateOnly.getTime() === startDateOnly.getTime()) {
          return true;
        }

        const result = (() => {
          switch (subscription.paymentCycle) {
            case 'DAILY':
              return true;
            case 'MONTHLY': {
              // 支払い開始日以降の同じ日付が支払い日
              const isPaymentDay = date.getDate() === startDate.getDate();
              return isPaymentDay;
            }
            case 'SEMI_ANNUALLY': {
              // 支払い開始日以降の6ヶ月ごとの同じ日付が支払い日
              const monthsDiff =
                (date.getFullYear() - startDate.getFullYear()) * 12 +
                (date.getMonth() - startDate.getMonth());
              const isPaymentDay =
                monthsDiff >= 0 &&
                date.getDate() === startDate.getDate() &&
                monthsDiff % 6 === 0;
              return isPaymentDay;
            }
            case 'ANNUALLY': {
              // 支払い開始日以降の毎年の同じ月日が支払い日
              const yearsDiff = date.getFullYear() - startDate.getFullYear();
              const isPaymentDay =
                yearsDiff >= 0 &&
                date.getDate() === startDate.getDate() &&
                date.getMonth() === startDate.getMonth();
              return isPaymentDay;
            }
            default:
              return false;
          }
        })();

        return result;
      });
    },
    [subscriptions]
  );

  // 月の合計支払額を計算
  const monthlyTotal = useMemo(() => {
    let total = 0;
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const payments = getPaymentsForDate(date);
      total += payments.reduce(
        (sum, sub) => sum + convertToJPY(sub.price, sub.currency),
        0
      );
    }

    return total;
  }, [
    actualSubscriptions,
    currentDate,
    lastDayOfMonth,
    getPaymentsForDate,
    convertToJPY,
  ]);

  // カテゴリー別の月間支払額を計算
  const monthlyTotalByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const payments = getPaymentsForDate(date);

      payments.forEach(payment => {
        const category = payment.category;
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += convertToJPY(
          payment.price,
          payment.currency
        );
      });
    }

    return categoryTotals;
  }, [
    actualSubscriptions,
    currentDate,
    lastDayOfMonth,
    getPaymentsForDate,
    convertToJPY,
  ]);

  // 前月・次月に移動
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // 今日の日付かどうかを判定
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 現在の月の日付かどうかを判定
  const isCurrentMonth = (date: Date) => {
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-base md:text-lg font-semibold text-gray-900">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </h2>

        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* 月の合計支払額 */}
      <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-600 font-medium mb-1">
          今月の支払予定額
        </div>
        <div className="text-lg md:text-xl font-bold text-blue-900">
          {formatCurrency(monthlyTotal, 'JPY')}
        </div>
      </div>

      {/* カテゴリー別支払額 */}
      {Object.keys(monthlyTotalByCategory).length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-700 mb-1">
            カテゴリー別支払額
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
            {Object.entries(monthlyTotalByCategory).map(([category, total]) => (
              <div
                key={category}
                className={`p-1 rounded border text-xs ${getCategoryColor(category)}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span>{getCategoryEmoji(category)}</span>
                  <span className="font-medium truncate">
                    {getCategoryDisplayName
                      ? getCategoryDisplayName(category)
                      : category}
                  </span>
                </div>
                <div className="font-bold text-xs">
                  {formatCurrency(total, 'JPY')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const payments = getPaymentsForDate(date);
          const totalPayment = payments.reduce(
            (sum, sub) => sum + convertToJPY(sub.price, sub.currency),
            0
          );

          return (
            <div
              key={index}
              className={`
                min-h-[60px] p-1 border border-gray-200 rounded-md text-xs
                ${isToday(date) ? 'bg-yellow-50 border-yellow-300' : ''}
                ${!isCurrentMonth(date) ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                ${payments.length > 0 ? 'bg-green-50 border-green-300' : ''}
                hover:shadow-md transition-shadow
              `}
            >
              <div className="text-xs font-medium mb-1">{date.getDate()}</div>

              {payments.length > 0 && (
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-green-700">
                    ¥{totalPayment.toLocaleString()}
                  </div>
                  {payments.slice(0, 1).map(payment => (
                    <div
                      key={payment.id}
                      className={`text-xs p-0.5 rounded ${getCategoryColor(payment.category)}`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{getCategoryEmoji(payment.category)}</span>
                        <span className="truncate text-xs">{payment.name}</span>
                      </div>
                    </div>
                  ))}
                  {payments.length > 1 && (
                    <div className="text-xs text-green-500 text-center">
                      +{payments.length - 1}件
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
