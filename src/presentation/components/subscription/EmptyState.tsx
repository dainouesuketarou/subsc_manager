import React from 'react';

interface EmptyStateProps {
  user: { email: string } | null;
  onAddSubscription: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onAddSubscription,
}) => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">
          <span className="emoji-icon">📱</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          サブスクリプションがありません
        </h3>
        <p className="text-gray-500 mb-6">
          ゲストでもサブスクリプションを管理できます。ログインするとデータが永続化されます。
        </p>

        <div className="space-y-4">
          <button
            onClick={onAddSubscription}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
          >
            <span className="emoji-icon">✨</span>
            サブスクリプションを追加
          </button>
          <p className="text-sm text-gray-500">
            <span className="emoji-icon">💾</span>
            ゲストモードでは、データはブラウザに保存されます
          </p>
        </div>
      </div>
    </div>
  );
};
