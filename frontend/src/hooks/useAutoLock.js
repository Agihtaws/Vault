import { useEffect, useCallback } from 'react';
import { useSessionStore, useVaultStore } from '../store/useStore';

export const useAutoLock = () => {
  const { autoLockMinutes, updateActivity, shouldLock } = useSessionStore();
  const { isUnlocked, lockVault } = useVaultStore();

  const handleActivity = useCallback(() => {
    if (isUnlocked) {
      updateActivity();
    }
  }, [isUnlocked, updateActivity]);

  useEffect(() => {
    if (!isUnlocked) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isUnlocked, handleActivity]);

    useEffect(() => {
    if (!isUnlocked) return;

    const interval = setInterval(() => {
      if (shouldLock(autoLockMinutes)) {
        lockVault();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isUnlocked, autoLockMinutes, shouldLock, lockVault]);

  return {
    handleActivity,
  };
};
