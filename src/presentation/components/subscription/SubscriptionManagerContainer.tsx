'use client';

import React, { useState, useEffect } from 'react';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { SubscriptionHeader } from './SubscriptionHeader';
import { SubscriptionTable } from './SubscriptionTable';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Modal } from '../common/Modal';
import { AuthModal } from '../auth/AuthModal';
import { AddSubscriptionForm } from './AddSubscriptionForm';
import { EditSubscriptionForm } from './EditSubscriptionForm';
import { SubscriptionData } from '../../types/subscription';

export const SubscriptionManagerContainer: React.FC = () => {
  const {
    user,
    token,
    logout,
    currentSubscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    deleteSubscription,
    getCategoryDisplayName,
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
    if (user && token && window.location.pathname === '/auth') {
      window.location.href = '/';
    }
  }, [user, token]);

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
    if (user) {
      fetchSubscriptions();
    }
  };

  const handleEditSuccess = () => {
    if (user) {
      fetchSubscriptions();
    }
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
              <SubscriptionTable
                subscriptions={currentSubscriptions}
                onEdit={handleEditSubscription}
                onDelete={handleDeleteSubscription}
                getCategoryDisplayName={getCategoryDisplayName}
                getNextPaymentDate={getNextPaymentDate}
              />
            )}
          </div>
        </div>
      </main>

      {/* モーダル */}
      <AuthModal
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
