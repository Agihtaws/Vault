import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { useVault } from '../hooks/useVault';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';
import { WalletConnect } from '../components/WalletConnect';
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const Setup = () => {
  const navigate = useNavigate();
  const { isConnected } = useAuthStore();
  const { createVault, checkVaultExists } = useVault();
  const [step, setStep] = useState(1);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCheckExisting = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    const exists = await checkVaultExists();
    if (exists) {
      navigate('/unlock');
    } else {
      setStep(2);
    }
  };

  const handleCreateVault = async () => {
    setError('');

    if (masterPassword.length < 12) {
      setError('Master password must be at least 12 characters');
      return;
    }

    if (masterPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!understood) {
      setError('Please confirm you understand the security warning');
      return;
    }

    setIsCreating(true);

    try {
      await createVault(masterPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <ShieldCheckIcon className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to create or access your vault
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {step === 1 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="text-center mb-8">
              <ShieldCheckIcon className="w-16 h-16 text-primary-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to VaultLink</h1>
              <p className="text-gray-400">Let's check if you have an existing vault</p>
            </div>

            <button
              onClick={handleCheckExisting}
              className="w-full px-6 py-4 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Check for Existing Vault
            </button>

            {error && (
              <p className="mt-4 text-sm text-danger-400 text-center">{error}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create Master Password</h1>
              <p className="text-gray-400">This password encrypts your vault. Choose a strong password and remember it - it cannot be recovered.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="Enter a strong master password"
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
                {masterPassword && (
                  <div className="mt-2">
                    <PasswordStrengthIndicator password={masterPassword} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Master Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your master password"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-danger-900/20 border border-danger-500/30 rounded-lg">
                <h3 className="font-semibold text-danger-100 mb-2">⚠️ Important Security Warning</h3>
                <ul className="text-sm text-danger-200 space-y-1 list-disc list-inside">
                  <li>Your master password encrypts your entire vault</li>
                  <li>There is NO password recovery option</li>
                  <li>If you forget it, your passwords are lost forever</li>
                  <li>Write it down and store it securely offline</li>
                </ul>
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                                    <input
                    type="checkbox"
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-danger-100">
                    I understand and have securely stored my master password
                  </span>
                </label>
              </div>

              {error && (
                <div className="p-3 bg-danger-900/20 border border-danger-500/30 rounded-lg">
                  <p className="text-sm text-danger-200">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={isCreating}
                  className="px-6 py-3 text-sm font-medium text-gray-300 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateVault}
                  disabled={isCreating || !masterPassword || !confirmPassword || !understood}
                  className="flex-1 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating Vault...' : 'Create Vault'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
