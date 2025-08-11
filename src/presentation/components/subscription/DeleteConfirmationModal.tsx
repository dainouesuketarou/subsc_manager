import React from 'react';
import { Modal } from '../common/Modal';
import { SubscriptionData } from '../../types/subscription';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  subscription: SubscriptionData | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ isOpen, subscription, onClose, onConfirm }) => {
  if (!subscription) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="削除の確認">
      <div className="space-y-4">
        <p className="text-gray-700">
          「{subscription.name}」を削除してもよろしいですか？
        </p>
        <p className="text-sm text-gray-500">
          この操作は取り消すことができません。
        </p>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            削除
          </button>
        </div>
      </div>
    </Modal>
  );
};
