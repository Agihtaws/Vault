import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { WalletConnect } from '../components/WalletConnect';
import { ShieldCheckIcon, LockClosedIcon, CloudIcon, KeyIcon } from '@heroicons/react/24/outline';

export const Landing = () => {
  const navigate = useNavigate();
  const { isConnected } = useAuthStore();

  const features = [
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: 'Tamper-Proof',
      description: 'Immutable frontend deployed via PinMe ensures no one can modify the interface to steal your passwords.',
    },
    {
      icon: <LockClosedIcon className="w-8 h-8" />,
      title: 'End-to-End Encrypted',
      description: 'Your passwords are encrypted locally with your master password before being stored on IPFS.',
    },
    {
      icon: <CloudIcon className="w-8 h-8" />,
      title: 'Decentralized Storage',
      description: 'No centralized servers. Your encrypted vault is stored on IPFS and tracked on-chain.',
    },
    {
      icon: <KeyIcon className="w-8 h-8" />,
      title: 'Self-Custody',
      description: 'Only you control your passwords. No company, no backdoors, no data breaches.',
    },
  ];

  const handleGetStarted = () => {
    if (isConnected) {
      navigate('/setup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">VaultLink</span>
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Decentralized Password Manager
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Store your passwords securely with end-to-end encryption, decentralized storage, and a tamper-proof frontend. Built with PinMe, IPFS, and blockchain technology.
            </p>
            {isConnected ? (
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Get Started
              </button>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-gray-400">Connect your wallet to get started</p>
                <WalletConnect />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-primary-500/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary-900/30 border border-primary-500/30 rounded-lg text-primary-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary-900/20 to-secondary-900/20 border border-primary-500/30 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why VaultLink?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Traditional password managers rely on centralized servers that can be hacked, taken down, or compromised. VaultLink uses decentralized technology to ensure your passwords are always accessible and secure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">No Single Point of Failure</h4>
                <p className="text-sm text-gray-400">
                  Your vault is distributed across IPFS nodes worldwide, not stored on a single server.
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Censorship Resistant</h4>
                <p className="text-sm text-gray-400">
                  No one can block access to your passwords. As long as you have your wallet, you have your vault.
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Verifiable Security</h4>
                <p className="text-sm text-gray-400">
                  Frontend integrity is verified on-chain. You always know you're using the legitimate interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
              <span className="text-gray-400">VaultLink - Decentralized Password Manager</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                GitHub
              </a>
              <a href="https://docs.highlightai.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
