import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useVaultStore, useUIStore, useSessionStore } from '../store/useStore';
import { useAutoLock } from '../hooks/useAutoLock';
import { WalletConnect } from '../components/WalletConnect';
import { VerificationBadge } from '../components/VerificationBadge';
import { PasswordListItem } from '../components/PasswordListItem';
import { AddPasswordModal } from '../components/AddPasswordModal';
import { EditPasswordModal } from '../components/EditPasswordModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { VaultHistory } from '../components/VaultHistory';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  LockClosedIcon,
  ShieldCheckIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export const Dashboard = () => {

  const navigate = useNavigate();
  const { isConnected, address } = useAuthStore();
  const { vault, isUnlocked, lockVault, searchPasswords, getPasswordsByCategory } = useVaultStore();
  const { openModal, modal } = useUIStore();
  const { autoLockMinutes } = useSessionStore();
  useAutoLock();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredPasswords, setFilteredPasswords] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
      return;
    }

    if (!isUnlocked) {
      navigate('/unlock');
      return;
    }
  }, [isConnected, isUnlocked, navigate]);

  useEffect(() => {
    if (!vault) return;

    let passwords = vault.passwords;

    if (searchQuery) {
      passwords = searchPasswords(searchQuery);
    } else if (selectedCategory !== 'All') {
      passwords = getPasswordsByCategory(selectedCategory);
    }

    setFilteredPasswords(passwords);
  }, [searchQuery, selectedCategory, vault, searchPasswords, getPasswordsByCategory]);

  const handleLock = () => {
    lockVault();
    navigate('/unlock');
  };

  const handleAddPassword = () => {
    openModal('addPassword');
  };

  const handleEditPassword = (password) => {
    openModal({ type: 'editPassword', password });
  };

  const handleDeletePassword = (password) => {
    openModal({ type: 'deletePassword', password });
  };

  const categories = ['All', ...(vault?.categories || [])];

  const stats = {
    total: vault?.passwords.length || 0,
    byCategory: vault?.categories.reduce((acc, cat) => {
      acc[cat] = getPasswordsByCategory(cat).length;
      return acc;
    }, {}) || {},
  };

  if (!vault || !isUnlocked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center gap-2">
        <ShieldCheckIcon className="w-8 h-8 text-primary-500" />
        <span className="text-xl font-bold text-white">VaultLink</span>
      </div>

      <div className="flex items-center gap-3">
        <VerificationBadge />
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          History
        </button>
        
        <button
          onClick={handleLock}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          title="Lock Vault"
        >
          <LockClosedIcon className="w-5 h-5" />
        </button>
        
        <WalletConnect />
      </div>
    </div>
  </div>
</nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search passwords..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>
              <button
                onClick={handleAddPassword}
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Add Password
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <FunnelIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                  {category !== 'All' && ` (${stats.byCategory[category] || 0})`}
                </button>
              ))}
            </div>

            {filteredPasswords.length === 0 ? (
              <div className="text-center py-16 bg-gray-800 border border-gray-700 rounded-xl">
                <ShieldCheckIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? 'No passwords found' : 'No passwords yet'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Get started by adding your first password'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleAddPassword}
                    className="px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Your First Password
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPasswords.map((password) => (
                  <PasswordListItem
                    key={password.id}
                    password={password}
                    onEdit={() => handleEditPassword(password)}
                    onDelete={() => handleDeletePassword(password)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vault Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Passwords</span>
                  <span className="text-lg font-semibold text-white">{stats.total}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 space-y-2">
                  {vault.categories.map((category) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{category}</span>
                      <span className="text-sm font-medium text-gray-300">
                        {stats.byCategory[category] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Auto-lock</span>
                  <span className="text-sm font-medium text-gray-300">
                    {autoLockMinutes} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Encryption</span>
                  <span className="text-sm font-medium text-success-400">AES-256</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Storage</span>
                  <span className="text-sm font-medium text-primary-400">IPFS</span>
                </div>
              </div>
            </div>

            {showHistory && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <VaultHistory />
              </div>
            )}
          </div>
        </div>
      </main>

      {modal === 'addPassword' && (
        <AddPasswordModal onClose={() => {}} />
      )}

      {modal?.type === 'editPassword' && (
        <EditPasswordModal
          password={modal.password}
          onClose={() => {}}
        />
      )}

      {modal?.type === 'deletePassword' && (
        <DeleteConfirmModal
          password={modal.password}
          onClose={() => {}}
        />
      )}
    </div>
  );
};
