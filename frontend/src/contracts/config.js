export const CONTRACTS = {
  baseSepolia: {
    VaultRegistry: "0x1adA881B3Fc06972Cb16A61DE6166fb2242B1cBd",
    FrontendRegistry: "0x99a18f6A5d384711D41DA514b9DB1A00EF765e00",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org"
  }
};

export const CURRENT_NETWORK = "baseSepolia";

export const getContractAddress = (contractName) => {
  return CONTRACTS[CURRENT_NETWORK][contractName];
};

export const getChainId = () => {
  return CONTRACTS[CURRENT_NETWORK].chainId;
};

export const getRpcUrl = () => {
  return CONTRACTS[CURRENT_NETWORK].rpcUrl;
};
