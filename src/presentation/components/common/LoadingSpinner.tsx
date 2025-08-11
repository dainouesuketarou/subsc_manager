import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">読み込み中...</div>
    </div>
  );
};
