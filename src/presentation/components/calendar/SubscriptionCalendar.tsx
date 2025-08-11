'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { SubscriptionData } from '../../types/subscription';

interface SubscriptionCalendarProps {
  subscriptions: SubscriptionData[];
}

export const SubscriptionCalendar: React.FC<SubscriptionCalendarProps> = ({
  subscriptions,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
      // デバッグ用ログ
      console.log('Checking payments for date:', date.toDateString());
      console.log('Subscriptions:', subscriptions);

      return subscriptions.filter(subscription => {
        // paymentStartDateが文字列の場合はDateオブジェクトに変換
        const startDate =
          subscription.paymentStartDate instanceof Date
            ? subscription.paymentStartDate
            : new Date(subscription.paymentStartDate);

        // Invalid Dateの場合はスキップ
        if (isNaN(startDate.getTime())) {
          console.warn(
            'Invalid paymentStartDate:',
            subscription.paymentStartDate
          );
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
          console.log(
            `${subscription.name}: Date ${dateOnly.toDateString()} is before start date ${startDateOnly.toDateString()}`
          );
          return false;
        }

        // 支払い開始日は必ず支払い日
        if (dateOnly.getTime() === startDateOnly.getTime()) {
          console.log(
            `${subscription.name}: Date ${dateOnly.toDateString()} is the start date`
          );
          return true;
        }

        const result = (() => {
          switch (subscription.paymentCycle) {
            case 'DAILY':
              return true;
            case 'MONTHLY': {
              // 支払い開始日以降の同じ日付が支払い日
              const isPaymentDay = date.getDate() === startDate.getDate();
              console.log(
                `Monthly check for ${subscription.name}: date=${date.getDate()}, startDate=${startDate.getDate()}, result=${isPaymentDay}`
              );
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
              console.log(
                `Semi-annually check for ${subscription.name}: monthsDiff=${monthsDiff}, date=${date.getDate()}, startDate=${startDate.getDate()}, result=${isPaymentDay}`
              );
              return isPaymentDay;
            }
            case 'ANNUALLY': {
              // 支払い開始日以降の毎年の同じ月日が支払い日
              const yearsDiff = date.getFullYear() - startDate.getFullYear();
              const isPaymentDay =
                yearsDiff >= 0 &&
                date.getDate() === startDate.getDate() &&
                date.getMonth() === startDate.getMonth();
              console.log(
                `Annually check for ${subscription.name}: yearsDiff=${yearsDiff}, date=${date.getDate()}, startDate=${startDate.getDate()}, result=${isPaymentDay}`
              );
              return isPaymentDay;
            }
            default:
              return false;
          }
        })();

        console.log(`Final result for ${subscription.name}: ${result}`);
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
      total += payments.reduce((sum, sub) => sum + sub.price, 0);
    }

    return total;
  }, [subscriptions, currentDate, lastDayOfMonth, getPaymentsForDate]);

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
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded-md"
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

        <h2 className="text-lg font-semibold text-gray-900">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </h2>

        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded-md"
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
      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-600 font-medium">
          今月の支払予定額
        </div>
        <div className="text-lg font-bold text-blue-900">
          {formatCurrency(monthlyTotal, 'JPY')}
        </div>
      </div>

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
            (sum, sub) => sum + sub.price,
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
              `}
            >
              <div className="text-xs font-medium mb-1">{date.getDate()}</div>

              {payments.length > 0 && (
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-green-700">
                    {formatCurrency(totalPayment, 'JPY')}
                  </div>
                  {payments.slice(0, 2).map(payment => (
                    <div
                      key={payment.id}
                      className="text-xs text-green-600 truncate"
                    >
                      {payment.name}
                    </div>
                  ))}
                  {payments.length > 2 && (
                    <div className="text-xs text-green-500">
                      +{payments.length - 2}件
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
