import React from 'react';
import { ThemeToggle } from '../common/ThemeToggle';
import Image from 'next/image';

interface SubscriptionHeaderProps {
  user: { email: string } | null;
  onLogout: () => void;
  onLogin: () => void;
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  user,
  onLogout,
  onLogin,
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-500/80 via-blue-500/80 to-indigo-500/80 backdrop-blur-md shadow-lg border-b border-purple-400/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 shadow-md">
                <Image
                  src="/subtrack_icon.png"
                  alt="SubscManager"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-black tracking-tight drop-shadow-lg relative">
                  <span className="bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
                    サブスクリプション管理
                  </span>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 rounded-full opacity-60"></div>
                </h1>
                <p className="text-purple-100 text-xs md:text-sm font-medium tracking-wide mt-1">
                  <span className="bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                    あなたのサブスクをスマートに管理
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-white text-sm font-medium">
                    <span className="emoji-icon">👤</span>
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-white/20 backdrop-blur-sm text-white py-2 px-3 rounded-lg hover:bg-white/30 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm border border-white/30 min-w-[60px] sm:min-w-0"
                >
                  <span className="emoji-icon">🚪</span>
                  <span className="ml-1">ログアウト</span>
                </button>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="bg-white text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm whitespace-nowrap min-w-[60px] sm:min-w-0"
              >
                <span className="emoji-icon">🔐</span>
                <span className="ml-1">ログイン</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
