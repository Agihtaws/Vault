import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useClipboard } from '../hooks/useClipboard';

export const PasswordListItem = ({ password, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { copyToClipboard } = useClipboard();

  const categoryColors = {
    Email: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Banking: 'bg-green-500/20 text-green-400 border-green-500/30',
    Social: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Work: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const handleCopyPassword = () => {
    copyToClipboard(password.password, 'Password copied');
  };

  const handleCopyUsername = () => {
    copyToClipboard(password.username, 'Username copied');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-primary-500/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">{password.name}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium border rounded ${categoryColors[password.category] || categoryColors.Other}`}>
              {password.category}
            </span>
          </div>
          {password.url && (
            <a
              href={password.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-400 hover:text-primary-300 hover:underline"
            >
              {password.url}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-danger-400 hover:bg-gray-700 rounded transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 w-24">Username:</span>
          <span className="flex-1 text-sm text-white font-mono">{password.username}</span>
          <button
            onClick={handleCopyUsername}
            className="p-1.5 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded transition-colors"
            title="Copy username"
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 w-24">Password:</span>
          <span className="flex-1 text-sm text-white font-mono">
            {showPassword ? password.password : '••••••••••••'}
          </span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopyPassword}
            className="p-1.5 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded transition-colors"
            title="Copy password"
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
          </button>
        </div>

        {password.notes && (
          <div className="pt-2 border-t border-gray-700">
            <span className="text-sm text-gray-400">Notes:</span>
            <p className="text-sm text-gray-300 mt-1">{password.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
          <span>Created: {formatDate(password.createdAt)}</span>
          {password.updatedAt && password.updatedAt !== password.createdAt && (
            <span>Updated: {formatDate(password.updatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
