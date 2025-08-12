'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { SubscriptionData } from '../../types/subscription';
import { ExchangeRateService } from '../../../infrastructure/services/ExchangeRateService';

interface SubscriptionCalendarProps {
  subscriptions: SubscriptionData[];
  getCategoryDisplayName?: (category: string) => string;
  onDateClick?: (date: Date) => void;
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
  onDateClick,
}) => {
  // subscriptionsがオブジェクトで、subscriptionsプロパティを持つ場合はそれを取得
  const actualSubscriptions = Array.isArray(subscriptions)
    ? subscriptions
    : (subscriptions as { subscriptions?: SubscriptionData[] })
        ?.subscriptions || [];

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
    [actualSubscriptions]
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
  }, [currentDate, lastDayOfMonth, getPaymentsForDate, convertToJPY]);

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
  }, [currentDate, lastDayOfMonth, getPaymentsForDate, convertToJPY]);

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
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

        <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </h2>

        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
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
      <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700 flex-shrink-0">
        <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
          今月の支払予定額
        </div>
        <div className="text-lg md:text-xl font-bold text-blue-900 dark:text-blue-100">
          {formatCurrency(monthlyTotal, 'JPY')}
        </div>
      </div>

      {/* カテゴリー別支払額 */}
      {Object.keys(monthlyTotalByCategory).length > 0 && (
        <div className="mb-3 flex-shrink-0">
          <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
            カテゴリー別支払額
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(monthlyTotalByCategory)
              .sort(([, a], [, b]) => b - a) // 金額が高い順にソート
              .map(([category, total]) => (
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
      <div className="grid grid-cols-7 gap-1 mb-1 flex-shrink-0">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-700 dark:text-gray-300 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto">
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
                min-h-[60px] p-1 border border-gray-200 dark:border-gray-600 rounded-md text-xs cursor-pointer
                ${isToday(date) ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600' : ''}
                ${!isCurrentMonth(date) ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}
                ${payments.length > 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' : ''}
                hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200
                active:scale-95
              `}
              onClick={() => onDateClick?.(date)}
              title="クリックしてサブスクを追加"
            >
              <div className="text-xs font-semibold mb-1">{date.getDate()}</div>

              {payments.length > 0 && (
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-green-800 dark:text-green-300">
                    ¥{totalPayment.toLocaleString()}
                  </div>
                  {payments.slice(0, 1).map(payment => (
                    <div
                      key={payment.id}
                      className={`text-xs p-0.5 rounded ${getCategoryColor(payment.category)}`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{getCategoryEmoji(payment.category)}</span>
                        <span className="truncate text-xs font-medium">
                          {payment.name}
                        </span>
                      </div>
                    </div>
                  ))}
                  {payments.length > 1 && (
                    <div className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
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
