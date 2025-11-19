import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'VaultLink',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [baseSepolia],
  ssr: false,
});
