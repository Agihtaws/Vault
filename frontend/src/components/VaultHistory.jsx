import { useState, useEffect } from 'react';
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/useStore';
import { getVaultHistory } from '../utils/contracts';

export const VaultHistory = () => {
  const { address } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [address]);

  const loadHistory = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const historyData = await getVaultHistory(address);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCID = (cid) => {
    if (!cid) return '';
    return `${cid.slice(0, 8)}...${cid.slice(-8)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-8">
        <ClockIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No version history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Version History</h3>
        <button
          onClick={loadHistory}
          className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-800 rounded-lg transition-colors"
          title="Refresh"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {history.map((cid, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-900/30 border border-primary-500/30 rounded-full">
                <span className="text-sm font-medium text-primary-400">
                  {history.length - index}
                </span>
              </div>
              <div>
                <p className="text-sm font-mono text-white">{formatCID(cid)}</p>
                <p className="text-xs text-gray-500">Version {history.length - index}</p>
              </div>
            </div>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-400 hover:text-primary-300 hover:underline"
            >
              View on IPFS
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
