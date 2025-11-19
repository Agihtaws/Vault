import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '../hooks/useWallet';
import { getChainId } from '../contracts/config';

export const WalletConnect = () => {
  const { isConnected, chainId, switchNetwork } = useWallet();
  const expectedChainId = getChainId();
  const isWrongNetwork = isConnected && chainId !== expectedChainId;

  if (isWrongNetwork) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-danger-900/20 border border-danger-500/30 rounded-lg">
          <div className="w-2 h-2 bg-danger-500 rounded-full"></div>
          <span className="text-sm text-danger-100">Wrong Network</span>
        </div>
        <button
          onClick={switchNetwork}
          className="px-4 py-2 text-sm font-medium text-primary-100 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Switch Network
        </button>
      </div>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Connect Wallet
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary-900/20 border border-primary-500/30 rounded-lg">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="text-sm font-mono text-primary-100 hover:text-primary-200 transition-colors"
                    >
                      {account.displayName}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
