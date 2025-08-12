import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = '処理中...',
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9998] overflow-y-auto">
      <div
        className="flex items-center justify-center min-h-screen p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      >
        <div className="inline-block bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all max-w-sm w-full relative z-[9999] animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="bg-gradient-to-br from-white to-gray-50 px-6 py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* ローディングスピナー */}
              <div className="relative">
                <svg
                  className="animate-spin h-12 w-12 text-purple-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>

              {/* メッセージ */}
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 flex items-center justify-center">
                  <span className="emoji-icon">⏳</span>
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
