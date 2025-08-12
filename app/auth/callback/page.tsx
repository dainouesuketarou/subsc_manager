'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../src/infrastructure/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('メール確認中...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setMessage('メール確認に失敗しました。再度お試しください。');
          setIsLoading(false);
          return;
        }

        if (data.session) {
          setMessage('メール確認が完了しました！ログイン中...');
          // ホームページにリダイレクト
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setMessage('メール確認に失敗しました。再度お試しください。');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth callback exception:', error);
        setMessage('エラーが発生しました。再度お試しください。');
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">メール確認</h2>
          <p className="text-gray-600 mb-8">{message}</p>

          {isLoading && (
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-purple-500"
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
          )}

          {!isLoading && (
            <button
              onClick={() => router.push('/auth')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              ログインページに戻る
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

