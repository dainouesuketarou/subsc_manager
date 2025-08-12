import React from 'react';

interface SubscriptionHeaderProps {
  user: { email: string } | null;
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
        <div className="flex justify-between items-center py-4 md:py-6">
          <div className="flex items-center">
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 whitespace-nowrap">
              <span className="emoji-icon">📱</span>
              サブスクリプション管理
            </h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-600">
                  <span className="emoji-icon">👤</span>
                  {user.email}
                </span>
                <button
                  onClick={onAddSubscription}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-1 md:py-2 px-2 md:px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover-lift text-xs md:text-sm"
                >
                  <span className="emoji-icon">➕</span>
                  <span className="hidden sm:inline">追加</span>
                </button>
                <button
                  onClick={onLogout}
                  className="bg-gray-500 text-white py-1 md:py-2 px-2 md:px-4 rounded-lg hover:bg-gray-600 font-semibold transition-all duration-200 text-xs md:text-sm"
                >
                  <span className="emoji-icon">🚪</span>
                  <span className="hidden sm:inline">ログアウト</span>
                </button>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-1 md:py-2 px-2 md:px-4 rounded-lg hover:from-green-600 hover:to-blue-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover-lift text-xs md:text-sm"
              >
                <span className="emoji-icon">🔐</span>
                <span className="hidden sm:inline">ログイン</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
