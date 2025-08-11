import React from 'react';
import { SubscriptionData } from '../../types/subscription';

interface SubscriptionTableProps {
  subscriptions: SubscriptionData[];
  onEdit: (subscription: SubscriptionData) => void;
  onDelete: (subscription: SubscriptionData) => void;
  getCategoryDisplayName: (category: string) => string;
  getNextPaymentDate: (subscription: SubscriptionData) => Date;
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  onEdit,
  onDelete,
  getCategoryDisplayName,
  getNextPaymentDate,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <span className="emoji-icon">📱</span>
              サービス名
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <span className="emoji-icon">💰</span>
              料金
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <span className="emoji-icon">🔄</span>
              支払いサイクル
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <span className="emoji-icon">📅</span>
              次回支払日
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <span className="emoji-icon">⚙️</span>
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscriptions.map(subscription => (
            <tr
              key={subscription.id}
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {subscription.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {subscription.price} {subscription.currency}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {subscription.paymentCycle}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {getCategoryDisplayName(subscription.category)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {getNextPaymentDate(subscription).toLocaleDateString('ja-JP')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(subscription)}
                  className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200 hover-scale"
                >
                  <span className="emoji-icon">✏️</span>
                  編集
                </button>
                <button
                  onClick={() => onDelete(subscription)}
                  className="text-red-600 hover:text-red-900 transition-colors duration-200 hover-scale"
                >
                  <span className="emoji-icon">🗑️</span>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
