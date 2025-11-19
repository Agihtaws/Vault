import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useVaultStore, useUIStore } from '../store/useStore';
import { useVault } from '../hooks/useVault';

export const DeleteConfirmModal = ({ password, onClose }) => {
  const { deletePassword } = useVaultStore();
  const { closeModal } = useUIStore();
  const { saveVault } = useVault();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const updatedVault = deletePassword(password.id);
      await saveVault(updatedVault);
      
      closeModal();
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to delete password:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
          <button
            onClick={() => { closeModal(); if (onClose) onClose(); }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-danger-900/20 border border-danger-500/30 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-danger-400 flex-shrink-0" />
            <p className="text-sm text-danger-100">
              This action cannot be undone. The password will be permanently deleted from your vault.
            </p>
          </div>

          <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">You are about to delete:</p>
            <p className="text-lg font-semibold text-white">{password.name}</p>
            <p className="text-sm text-gray-400">{password.username}</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 text-sm font-medium text-white bg-danger-600 rounded-lg hover:bg-danger-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete Password'}
            </button>
            <button
              onClick={() => { closeModal(); if (onClose) onClose(); }}
              disabled={isDeleting}
              className="px-6 py-3 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
