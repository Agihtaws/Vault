import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { useVault } from '../hooks/useVault';
import { WalletConnect } from '../components/WalletConnect';
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const Unlock = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAuthStore();
  const { unlockVault } = useVault();
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');

    if (!masterPassword) {
      setError('Please enter your master password');
      return;
    }

    setIsUnlocking(true);

    try {
      await unlockVault(masterPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to unlock vault');
    } finally {
      setIsUnlocking(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <ShieldCheckIcon className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to unlock your vault
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
          <div className="text-center mb-8">
            <ShieldCheckIcon className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Unlock Your Vault</h1>
            <p className="text-gray-400">Enter your master password to access your passwords</p>
            <div className="mt-4 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg">
              <p className="text-sm text-gray-400">Connected as</p>
              <p className="text-sm font-mono text-primary-400">{formatAddress(address)}</p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Enter your master password"
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-danger-900/20 border border-danger-500/30 rounded-lg">
                <p className="text-sm text-danger-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUnlocking || !masterPassword}
              className="w-full px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUnlocking ? 'Unlocking...' : 'Unlock Vault'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 text-center">
            Lost your master password? Unfortunately, there's no recovery option. Your vault is encrypted end-to-end and only you have the key.
          </p>
        </div>
      </div>
    </div>
  );
};
