import { useEffect, useCallback } from 'react';
import { useVerificationStore } from '../store/useStore';
import { verifyFrontend, getCurrentFrontendVersion } from '../utils/contracts';
import { ethers } from 'ethers';

export const useVerification = () => {
  const { isVerified, verificationStatus, currentVersion, setVerified, setCurrentVersion } = useVerificationStore();

  const getCurrentContentHash = useCallback(() => {
    const contentString = "VaultLink-v1.0.0-production";
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(contentString));
    console.log('Frontend Content Hash:', hash);
    return hash;
  }, []);

  const verifyCurrentFrontend = useCallback(async () => {
    try {
      const contentHash = getCurrentContentHash();
      
      if (!contentHash) {
        setVerified(false, {
          error: 'No content hash found',
          message: 'Unable to verify frontend integrity',
        });
        return;
      }

      const result = await verifyFrontend(contentHash);
      
      if (result.isValid && result.isActive) {
        setVerified(true, {
          version: result.version,
          message: 'Frontend verified successfully',
          contentHash,
        });
      } else if (result.isValid && !result.isActive) {
        setVerified(false, {
          version: result.version,
          message: 'This frontend version has been deprecated',
          contentHash,
        });
      } else {
        setVerified(false, {
          error: 'Unverified frontend',
          message: 'This frontend is not registered in the official registry',
          contentHash,
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerified(false, {
        error: error.message,
        message: 'Unable to verify frontend integrity',
      });
    }
  }, [getCurrentContentHash, setVerified]);

  const fetchCurrentVersion = useCallback(async () => {
    try {
      const version = await getCurrentFrontendVersion();
      setCurrentVersion(version);
    } catch (error) {
      console.error('Fetch current version error:', error);
    }
  }, [setCurrentVersion]);

  useEffect(() => {
    verifyCurrentFrontend();
    fetchCurrentVersion();
  }, [verifyCurrentFrontend, fetchCurrentVersion]);

  return {
    isVerified,
    verificationStatus,
    currentVersion,
    verifyCurrentFrontend,
    getCurrentContentHash,
  };
};
