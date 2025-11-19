import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PasswordGenerator } from './PasswordGenerator';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useVaultStore, useUIStore } from '../store/useStore';
import { useVault } from '../hooks/useVault';

export const AddPasswordModal = ({ onClose }) => {
  const { addPassword } = useVaultStore();
  const { closeModal } = useUIStore();
  const { saveVault } = useVault();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    url: '',
    category: 'Other',
    notes: '',
  });
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneratedPassword = (password) => {
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || !formData.password) {
      return;
    }

    setIsSaving(true);

    try {
      const passwordEntry = {
        id: Date.now().toString(),
        ...formData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedVault = addPassword(passwordEntry);
      await saveVault(updatedVault);
      
      closeModal();
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to add password:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between p-6 bg-gray-900 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Add New Password</h2>
          <button
            onClick={() => { closeModal(); if (onClose) onClose(); }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name / Service *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Gmail, GitHub, Netflix"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username / Email *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Password *
              </label>
              <button
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                {showGenerator ? 'Hide Generator' : 'Generate Password'}
              </button>
            </div>
            
            {showGenerator && (
              <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <PasswordGenerator onGenerate={handleGeneratedPassword} />
              </div>
            )}

            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter or generate a password"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 font-mono"
            />
            
            {formData.password && (
              <div className="mt-2">
                <PasswordStrengthIndicator password={formData.password} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website URL
            </label>
                          <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="Email">Email</option>
              <option value="Banking">Banking</option>
              <option value="Social">Social</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes (optional)"
              rows="3"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Add Password'}
            </button>
            <button
              type="button"
              onClick={() => { closeModal(); if (onClose) onClose(); }}
              disabled={isSaving}
              className="px-6 py-3 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
