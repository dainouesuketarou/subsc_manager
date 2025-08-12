'use client';

import React, { useState, useEffect } from 'react';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { SubscriptionHeader } from './SubscriptionHeader';
import { SubscriptionTable } from './SubscriptionTable';
import { SubscriptionCalendar } from '../calendar/SubscriptionCalendar';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Modal } from '../common/Modal';
import { SupabaseAuthModal } from '../auth/SupabaseAuthModal';
import { AddSubscriptionForm } from './AddSubscriptionForm';
import { EditSubscriptionForm } from './EditSubscriptionForm';
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SubscriptionHeader
        user={user}
        onLogout={handleLogout}
        onLogin={() => setIsAuthModalOpen(true)}
        onAddSubscription={() => setIsAddModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* サブスク追加ボタン */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span>➕</span>
            サブスクを追加
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {currentSubscriptions.length === 0 ? (
              <EmptyState
                user={user}
                onAddSubscription={() => setIsAddModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* カレンダー - 2/3の幅 */}
                <div className="lg:col-span-2">
                  <SubscriptionCalendar
                    subscriptions={currentSubscriptions}
                    getCategoryDisplayName={getCategoryDisplayName}
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
        />
      </Modal>

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
            onSuccess={handleEditSuccess}
          />
        </Modal>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        subscription={deletingSubscription}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingSubscription(null);
        }}
        onConfirm={confirmDeleteSubscription}
      />
    </div>
  );
};
