import { useState, useCallback } from 'react';
import { useVaultStore, useAuthStore, useUIStore } from '../store/useStore';
import { encryptVault, decryptVault, hashPassword } from '../utils/encryption';
import { uploadToIPFS, downloadFromIPFS } from '../utils/ipfs';
import { registerVault, updateVault, getVault, hasVault } from '../utils/contracts';

export const useVault = () => {
  const { address } = useAuthStore();
  const { vault, isUnlocked, masterPassword, setVault, updateVault: updateVaultState, lockVault, setCID, setLastUpdated, setMasterPasswordHash, setMasterPassword } = useVaultStore();
  const { setLoading, showNotification } = useUIStore();
  const [error, setError] = useState(null);

  const createVault = useCallback(async (masterPass) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true, 'Creating vault...');
    setError(null);

    try {
      const emptyVault = {
        version: '1.0',
        passwords: [],
        categories: ['Email', 'Banking', 'Social', 'Work', 'Other'],
        settings: {
          autoLockMinutes: 15,
          clearClipboard: true,
        },
        createdAt: Date.now(),
      };

      const encrypted = encryptVault(emptyVault, masterPass);
      
      setLoading(true, 'Uploading to IPFS...');
      const cid = await uploadToIPFS(encrypted);
      
      setLoading(true, 'Registering on blockchain...');
      await registerVault(cid);
      
      const passwordHash = hashPassword(masterPass);
      setMasterPasswordHash(passwordHash);
      setMasterPassword(masterPass); // Store in memory
      setVault(emptyVault);
      setCID(cid);
      setLastUpdated(Date.now());
      
      showNotification({
        type: 'success',
        message: 'Vault created successfully',
      });
      
      return emptyVault;
    } catch (err) {
      console.error('Create vault error:', err);
      setError(err.message);
      showNotification({
        type: 'error',
        message: err.message || 'Failed to create vault',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, setLoading, setVault, setCID, setLastUpdated, setMasterPasswordHash, setMasterPassword, showNotification]);

  const unlockVault = useCallback(async (masterPass) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true, 'Checking vault...');
    setError(null);

    try {
      const vaultExists = await hasVault(address);
      
      if (!vaultExists) {
        throw new Error('No vault found for this address');
      }

      setLoading(true, 'Fetching vault data...');
      const vaultData = await getVault(address);
      
      setLoading(true, 'Downloading from IPFS...');
      const encryptedData = await downloadFromIPFS(vaultData.currentCID);
      
      setLoading(true, 'Decrypting vault...');
      const decryptedVault = decryptVault(encryptedData, masterPass);
      
      const passwordHash = hashPassword(masterPass);
      setMasterPasswordHash(passwordHash);
      setMasterPassword(masterPass); // Store in memory
      setVault(decryptedVault);
      setCID(vaultData.currentCID);
      setLastUpdated(vaultData.lastUpdated);
      
      showNotification({
        type: 'success',
        message: 'Vault unlocked successfully',
      });
      
      return decryptedVault;
    } catch (err) {
      console.error('Unlock vault error:', err);
      setError(err.message);
      showNotification({
        type: 'error',
        message: err.message || 'Failed to unlock vault',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, setLoading, setVault, setCID, setLastUpdated, setMasterPasswordHash, setMasterPassword, showNotification]);

  const saveVault = useCallback(async (updatedVault = null) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (!masterPassword) {
      throw new Error('Master password not available');
    }

    const vaultToSave = updatedVault || vault;
    
    if (!vaultToSave) {
      throw new Error('No vault to save');
    }

    setLoading(true, 'Encrypting vault...');
    setError(null);

    try {
      const encrypted = encryptVault(vaultToSave, masterPassword);
      
      setLoading(true, 'Uploading to IPFS...');
      const cid = await uploadToIPFS(encrypted);
      
      setLoading(true, 'Updating on blockchain...');
      await updateVault(cid);
      
      setCID(cid);
      setLastUpdated(Date.now());
      
      if (updatedVault) {
        updateVaultState(updatedVault);
      }
      
      showNotification({
        type: 'success',
        message: 'Vault saved successfully',
      });
      
      return cid;
    } catch (err) {
      console.error('Save vault error:', err);
      setError(err.message);
      showNotification({
        type: 'error',
        message: err.message || 'Failed to save vault',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, vault, masterPassword, setLoading, updateVaultState, setCID, setLastUpdated, showNotification]);

  const lock = useCallback(() => {
    lockVault();
    showNotification({
      type: 'info',
      message: 'Vault locked',
    });
  }, [lockVault, showNotification]);

  const checkVaultExists = useCallback(async () => {
    if (!address) return false;
    
    try {
      return await hasVault(address);
    } catch (err) {
      console.error('Check vault exists error:', err);
      return false;
    }
  }, [address]);

  return {
    vault,
    isUnlocked,
    error,
    createVault,
    unlockVault,
    saveVault,
    lock,
    checkVaultExists,
  };
};
