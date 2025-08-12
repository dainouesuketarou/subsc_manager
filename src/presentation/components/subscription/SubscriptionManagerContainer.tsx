'use client';

import React, { useState, useEffect } from 'react';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { SubscriptionHeader } from './SubscriptionHeader';
import { SubscriptionTable } from './SubscriptionTable';
import { SubscriptionCalendar } from '../calendar/SubscriptionCalendar';
import { EmptyState } from './EmptyState';
import { SupabaseAuthModal } from '../auth/SupabaseAuthModal';
import { AddSubscriptionForm } from './AddSubscriptionForm';
import { EditSubscriptionForm } from './EditSubscriptionForm';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Modal } from '../common/Modal';
import { SubscriptionData } from '../../types/subscription';

export const SubscriptionManagerContainer: React.FC = () => {
  const {
    user,
    logout,
    currentSubscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    deleteSubscription,
    getCategoryDisplayName,
    getPaymentCycleDisplayName,
    convertToJPY,
    getNextPaymentDate,
  } = useSubscriptionManager();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<SubscriptionData | null>(null);
  const [deletingSubscription, setDeletingSubscription] =
    useState<SubscriptionData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ログイン済みユーザーが認証ページにアクセスした場合のリダイレクト
  useEffect(() => {
    if (user && window.location.pathname === '/auth') {
      window.location.href = '/';
    }
  }, [user]);

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

    await deleteSubscription(deletingSubscription);
    setIsDeleteModalOpen(false);
    setDeletingSubscription(null);
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    setSelectedDate(null);
    if (user) {
      fetchSubscriptions();
    }
    // ゲストユーザーの場合は、GuestSubscriptionContextが自動的に更新される
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingSubscription(null);
    if (user) {
      fetchSubscriptions();
    }
    // ゲストユーザーの場合は、GuestSubscriptionContextが自動的に更新される
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddModalOpen(true);
  };

  const handleAddSubscriptionClick = () => {
    setSelectedDate(null);
    setIsAddModalOpen(true);
  };

  // 初期ローディング時のみLoadingSpinnerを表示
  if (isLoading && currentSubscriptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SubscriptionHeader
        user={user}
        onLogout={handleLogout}
        onLogin={() => setIsAuthModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* サブスク追加ボタン */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleAddSubscriptionClick}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span>➕</span>
            サブスクを追加
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
                {error}
              </div>
            )}

            {currentSubscriptions.length === 0 ? (
              <EmptyState
                user={user}
                onAddSubscription={handleAddSubscriptionClick}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* カレンダー - 2/3の幅 */}
                <div className="lg:col-span-2">
                  <SubscriptionCalendar
                    subscriptions={currentSubscriptions}
                    getCategoryDisplayName={getCategoryDisplayName}
                    onDateClick={handleDateClick}
                  />
                </div>
                {/* サブスク一覧 - 1/3の幅 */}
                <div className="lg:col-span-1">
                  <SubscriptionTable
                    subscriptions={currentSubscriptions}
                    onEdit={handleEditSubscription}
                    onDelete={handleDeleteSubscription}
                    getCategoryDisplayName={getCategoryDisplayName}
                    getPaymentCycleDisplayName={getPaymentCycleDisplayName}
                    convertToJPY={convertToJPY}
                    getNextPaymentDate={getNextPaymentDate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* モーダル */}
      <SupabaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="サブスクリプションを追加"
      >
        <AddSubscriptionForm
          onClose={() => setIsAddModalOpen(false)}
          isGuest={!user}
          onSuccess={handleAddSuccess}
          initialDate={selectedDate || undefined}
        />
      </Modal>

      {editingSubscription && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="サブスクリプションを編集"
        >
          <EditSubscriptionForm
            subscription={editingSubscription}
            onClose={() => setIsEditModalOpen(false)}
            isGuest={!user}
            onSuccess={handleEditSuccess}
          />
        </Modal>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteSubscription}
        subscription={deletingSubscription}
      />
    </div>
  );
};
