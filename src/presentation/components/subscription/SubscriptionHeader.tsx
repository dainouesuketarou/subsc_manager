import React from 'react';

interface SubscriptionHeaderProps {
  user: any;
  onLogout: () => void;
  onLogin: () => void;
  onAddSubscription: () => void;
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  user,
  onLogout,
  onLogin,
  onAddSubscription,
}) => {
  return (
    <div className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="emoji-icon">📱</span>
              サブスクリプション管理
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  <span className="emoji-icon">👤</span>
                  {user.email}
                </span>
                <button
                  onClick={onAddSubscription}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
                >
                  <span className="emoji-icon">➕</span>
                  追加
                </button>
                <button
                  onClick={onLogout}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 font-semibold transition-all duration-200"
                >
                  <span className="emoji-icon">🚪</span>
                  ログアウト
                </button>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
              >
                <span className="emoji-icon">🔐</span>
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
