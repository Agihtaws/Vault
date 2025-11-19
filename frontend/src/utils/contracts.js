import { ethers } from 'ethers';
import { getContractAddress } from '../contracts/config';
import VaultRegistryABI from '../contracts/VaultRegistryABI.json';
import FrontendRegistryABI from '../contracts/FrontendRegistryABI.json';

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  throw new Error('No Web3 provider found');
};

export const getSigner = async () => {
  const provider = getProvider();
  return provider.getSigner();
};

export const getVaultRegistryContract = async () => {
  const signer = await getSigner();
  const address = getContractAddress('VaultRegistry');
  return new ethers.Contract(address, VaultRegistryABI, signer);
};

export const getVaultRegistryContractReadOnly = () => {
  const provider = getProvider();
  const address = getContractAddress('VaultRegistry');
  return new ethers.Contract(address, VaultRegistryABI, provider);
};

export const getFrontendRegistryContract = async () => {
  const signer = await getSigner();
  const address = getContractAddress('FrontendRegistry');
  return new ethers.Contract(address, FrontendRegistryABI, signer);
};

export const getFrontendRegistryContractReadOnly = () => {
  const provider = getProvider();
  const address = getContractAddress('FrontendRegistry');
  return new ethers.Contract(address, FrontendRegistryABI, provider);
};

export const registerVault = async (ipfsCID) => {
  try {
    const contract = await getVaultRegistryContract();
    const tx = await contract.registerVault(ipfsCID);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Register vault error:', error);
    throw new Error(error.reason || 'Failed to register vault');
  }
};

export const updateVault = async (newCID) => {
  try {
    const contract = await getVaultRegistryContract();
    const tx = await contract.updateVault(newCID);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Update vault error:', error);
    throw new Error(error.reason || 'Failed to update vault');
  }
};

export const deleteVault = async () => {
  try {
    const contract = await getVaultRegistryContract();
    const tx = await contract.deleteVault();
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Delete vault error:', error);
    throw new Error(error.reason || 'Failed to delete vault');
  }
};

export const getVault = async (userAddress) => {
  try {
    const contract = getVaultRegistryContractReadOnly();
    const vault = await contract.getVault(userAddress);
    return {
      currentCID: vault.currentCID,
      lastUpdated: vault.lastUpdated.toNumber(),
      exists: vault.exists,
    };
  } catch (error) {
    console.error('Get vault error:', error);
    throw new Error('Failed to get vault');
  }
};

export const getVaultHistory = async (userAddress) => {
  try {
    const contract = getVaultRegistryContractReadOnly();
    const history = await contract.getVaultHistory(userAddress);
    return history;
  } catch (error) {
    console.error('Get vault history error:', error);
    return [];
  }
};

export const hasVault = async (userAddress) => {
  try {
    const contract = getVaultRegistryContractReadOnly();
    return await contract.hasVault(userAddress);
  } catch (error) {
    console.error('Has vault error:', error);
    return false;
  }
};

export const verifyFrontend = async (contentHash) => {
  try {
    const contract = getFrontendRegistryContractReadOnly();
    const result = await contract.verifyFrontend(contentHash);
    return {
      isValid: result.isValid,
      isActive: result.isActive,
      version: result.version,
    };
  } catch (error) {
    console.error('Verify frontend error:', error);
    return {
      isValid: false,
      isActive: false,
      version: '',
    };
  }
};

export const getCurrentFrontendVersion = async () => {
  try {
    const contract = getFrontendRegistryContractReadOnly();
    const result = await contract.getCurrentVersion();
    return {
      contentHash: result.contentHash,
      version: result.version,
      timestamp: result.timestamp.toNumber(),
      isActive: result.isActive,
      description: result.description,
    };
  } catch (error) {
    console.error('Get current frontend version error:', error);
    return null;
  }
};

export const waitForTransaction = async (tx) => {
  try {
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error('Transaction failed');
  }
};

export const estimateGas = async (contract, method, ...args) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args);
    return gasEstimate;
  } catch (error) {
    console.error('Gas estimation error:', error);
    throw new Error('Failed to estimate gas');
  }
};
