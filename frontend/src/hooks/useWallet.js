import { useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useAuthStore } from '../store/useStore';
import { getChainId } from '../contracts/config';

export const useWallet = () => {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { setAddress, setChainId, disconnect: storeDisconnect } = useAuthStore();

  useEffect(() => {
    if (address) {
      setAddress(address);
    }
    if (chainId) {
      setChainId(chainId);
    }
    if (!isConnected) {
      storeDisconnect();
    }
  }, [address, chainId, isConnected, setAddress, setChainId, storeDisconnect]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    storeDisconnect();
  }, [disconnect, storeDisconnect]);

  const switchNetwork = useCallback(async () => {
    const expectedChainId = getChainId();
    try {
      await switchChainAsync({ chainId: expectedChainId });
    } catch (error) {
      console.error('Switch network error:', error);
    }
  }, [switchChainAsync]);

  return {
    address,
    isConnected,
    chainId,
    isConnecting: false,
    error: null,
    disconnectWallet,
    switchNetwork,
  };
};
