'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGuestSubscriptions } from '../../contexts/GuestSubscriptionContext';
import { Modal } from '../common/Modal';
import { AuthModal } from '../auth/AuthModal';
import { AddSubscriptionForm } from './AddSubscriptionForm';
import { EditSubscriptionForm } from './EditSubscriptionForm';
import { SubscriptionCalendar } from '../calendar/SubscriptionCalendar';
import { SubscriptionData } from '../../types/subscription';

export const SubscriptionManager: React.FC = () => {
  const { user, token, logout } = useAuth();
  const {
    subscriptions: guestSubscriptions,
    deleteSubscription: deleteGuestSubscription,
  } = useGuestSubscriptions();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<SubscriptionData | null>(null);
  const [deletingSubscription, setDeletingSubscription] =
    useState<SubscriptionData | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [user, token]);

  // ログイン済みユーザーが認証ページにアクセスした場合のリダイレクト
  useEffect(() => {
    if (user && token && window.location.pathname === '/auth') {
      window.location.href = '/';
    }
  }, [user, token]);

  const fetchSubscriptions = async () => {
    try {
      if (!user || !token) {
        // ログインしていない場合は空の配列を設定
        setSubscriptions([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('サブスクリプションの取得に失敗しました');
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleEditSubscription = (subscription: SubscriptionData) => {
    setEditingSubscription(subscription);
    setIsEditModalOpen(true);
  };

  const handleDeleteSubscription = (subscription: SubscriptionData) => {
    setDeletingSubscription(subscription);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSubscription = async () => {
    if (!deletingSubscription) return;

    if (user) {
      // ログインユーザーの場合、APIを呼び出し
      try {
        const response = await fetch(
          `/api/subscriptions/${deletingSubscription.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('サブスクリプションの削除に失敗しました');
        }

        // サブスクリプション一覧を再取得
        fetchSubscriptions();
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'エラーが発生しました'
        );
      }
    } else {
      // ゲストユーザーの場合、ローカルストレージから削除
      deleteGuestSubscription(deletingSubscription.id);
    }

    setIsDeleteModalOpen(false);
    setDeletingSubscription(null);
  };

  // 次回支払日を計算する関数
  const getCategoryDisplayName = (category: string): string => {
    const displayNames: Record<string, string> = {
      VIDEO_STREAMING: '動画配信',
      MUSIC_STREAMING: '音楽配信',
      READING: '読書',
      GAMING: 'ゲーム',
      FITNESS: 'フィットネス',
      EDUCATION: '教育',
      PRODUCTIVITY: '生産性',
      CLOUD_STORAGE: 'クラウドストレージ',
      SECURITY: 'セキュリティ',
      OTHER: 'その他',
    };
    return displayNames[category] || category;
  };

  const getNextPaymentDate = (subscription: SubscriptionData): Date => {
    // paymentStartDateが文字列の場合はDateオブジェクトに変換
    const startDate =
      subscription.paymentStartDate instanceof Date
        ? subscription.paymentStartDate
        : new Date(subscription.paymentStartDate);

    // Invalid Dateの場合は今日の日付を返す
    if (isNaN(startDate.getTime())) {
      console.warn('Invalid paymentStartDate:', subscription.paymentStartDate);
      return new Date();
    }

    const today = new Date();

    // 今日が支払い開始日より前の場合は開始日を返す
    if (today < startDate) {
      return startDate;
    }

    switch (subscription.paymentCycle) {
      case 'DAILY':
        return new Date(today.getTime() + 24 * 60 * 60 * 1000); // 明日
      case 'MONTHLY': {
        // 今月の支払日を計算
        const thisMonthPayment = new Date(
          today.getFullYear(),
          today.getMonth(),
          startDate.getDate()
        );

        // 今月の支払日が今日より後なら今月、そうでなければ来月
        if (thisMonthPayment > today) {
          return thisMonthPayment;
        } else {
          const nextMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            startDate.getDate()
          );
          return nextMonth;
        }
      }
      case 'SEMI_ANNUALLY': {
        // 支払い開始日から6ヶ月ごとの支払日を計算
        const monthsSinceStart =
          (today.getFullYear() - startDate.getFullYear()) * 12 +
          (today.getMonth() - startDate.getMonth());
        const nextPaymentMonth =
          startDate.getMonth() + Math.ceil((monthsSinceStart + 1) / 6) * 6;
        const nextPaymentYear =
          startDate.getFullYear() + Math.floor(nextPaymentMonth / 12);
        const nextPaymentMonthAdjusted = nextPaymentMonth % 12;

        return new Date(
          nextPaymentYear,
          nextPaymentMonthAdjusted,
          startDate.getDate()
        );
      }
      case 'ANNUALLY': {
        // 今年の支払日を計算
        const thisYearPayment = new Date(
          today.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );

        // 今年の支払日が今日より後なら今年、そうでなければ来年
        if (thisYearPayment > today) {
          return thisYearPayment;
        } else {
          return new Date(
            today.getFullYear() + 1,
            startDate.getMonth(),
            startDate.getDate()
          );
        }
      }
      default:
        return startDate;
    }
  };

  const currentSubscriptions = user ? subscriptions : guestSubscriptions;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  // モーダルを早期リターンの前に配置
  const modalElements = (
    <>
      {/* 認証モーダル */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* サブスクリプション追加モーダル */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="サブスクリプションを追加"
      >
        <AddSubscriptionForm
          onClose={() => setIsAddModalOpen(false)}
          isGuest={!user}
          onSuccess={() => {
            if (user) {
              fetchSubscriptions();
            }
          }}
        />
      </Modal>

      {/* サブスクリプション編集モーダル */}
      {editingSubscription && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSubscription(null);
          }}
          title="サブスクリプションを編集"
        >
          <EditSubscriptionForm
            subscription={editingSubscription}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingSubscription(null);
            }}
            isGuest={!user}
            onSuccess={() => {
              if (user) {
                fetchSubscriptions();
              }
            }}
          />
        </Modal>
      )}

      {/* 削除確認モーダル */}
      {deletingSubscription && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingSubscription(null);
          }}
          title="削除の確認"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              「{deletingSubscription.name}」を削除してもよろしいですか？
            </p>
            <p className="text-sm text-gray-500">
              この操作は取り消すことができません。
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingSubscription(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDeleteSubscription}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
              >
                削除
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );

  if (!user) {
    return (
      <>
        {modalElements}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <span className="emoji-icon">📱</span>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    サブスク管理アプリ
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full border border-yellow-200">
                    <span className="emoji-icon">👤</span>
                    ゲストユーザー
                  </span>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium hover-lift"
                  >
                    <span className="emoji-icon">➕</span>
                    サブスク追加
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium hover-lift"
                  >
                    <span className="emoji-icon">🔐</span>
                    ログイン / 登録
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 wiggle">
                  <div className="text-sm text-red-700 font-medium">
                    <span className="emoji-icon">⚠️</span>
                    {error}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* カレンダー表示 */}
                {currentSubscriptions.length > 0 && (
                  <div className="lg:col-span-1">
                    <SubscriptionCalendar
                      subscriptions={currentSubscriptions}
                    />
                  </div>
                )}

                {/* サブスクリプション一覧 */}
                <div
                  className={`bg-white shadow-lg rounded-xl border border-gray-200 hover-lift ${currentSubscriptions.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}
                >
                  <div className="px-6 py-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="emoji-icon">📊</span>
                      サブスク管理（ゲストモード）
                    </h2>

                    {currentSubscriptions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mb-8">
                          <div className="text-6xl mb-4 bounce">🎉</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            サブスク管理を始めましょう！
                          </h3>
                          <p className="text-gray-600 mb-6 text-lg">
                            ゲストでもサブスクリプションを管理できます。ログインするとデータが永続化されます。
                          </p>
                        </div>

                        <div className="space-y-4">
                          <button
                            onClick={() => setIsAddModalOpen(true)}
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
                    ) : (
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
                            {currentSubscriptions.map(subscription => (
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
                                  {getCategoryDisplayName(
                                    subscription.category
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {getNextPaymentDate(
                                    subscription
                                  ).toLocaleDateString('ja-JP')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() =>
                                      handleEditSubscription(subscription)
                                    }
                                    className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200 hover-scale"
                                  >
                                    <span className="emoji-icon">✏️</span>
                                    編集
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteSubscription(subscription)
                                    }
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      {modalElements}
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <span className="emoji-icon">📱</span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  サブスク管理
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 bg-gradient-to-r from-green-100 to-blue-100 px-3 py-1 rounded-full border border-green-200">
                  <span className="emoji-icon">👤</span>
                  {user.email}
                </span>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium hover-lift"
                >
                  <span className="emoji-icon">➕</span>
                  サブスク追加
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium hover-lift"
                >
                  <span className="emoji-icon">🚪</span>
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 wiggle">
                <div className="text-sm text-red-700 font-medium">
                  <span className="emoji-icon">⚠️</span>
                  {error}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* カレンダー表示 */}
              {currentSubscriptions.length > 0 && (
                <div className="lg:col-span-1">
                  <SubscriptionCalendar subscriptions={currentSubscriptions} />
                </div>
              )}

              {/* サブスクリプション一覧 */}
              <div
                className={`bg-white shadow-lg rounded-xl border border-gray-200 hover-lift ${currentSubscriptions.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}
              >
                <div className="px-6 py-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="emoji-icon">📊</span>
                    サブスクリプション一覧
                  </h2>

                  {currentSubscriptions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4 bounce">🎯</div>
                      <p className="text-gray-600 text-lg mb-6">
                        サブスクリプションが登録されていません
                      </p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
                      >
                        <span className="emoji-icon">✨</span>
                        新しいサブスクリプションを追加
                      </button>
                    </div>
                  ) : (
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
                              <span className="emoji-icon">🏷️</span>
                              カテゴリー
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
                          {currentSubscriptions.map(subscription => (
                            <tr
                              key={subscription.id}
                              className="hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-200"
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
                                {getNextPaymentDate(
                                  subscription
                                ).toLocaleDateString('ja-JP')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() =>
                                    handleEditSubscription(subscription)
                                  }
                                  className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200 hover-scale"
                                >
                                  <span className="emoji-icon">✏️</span>
                                  編集
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSubscription(subscription)
                                  }
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
