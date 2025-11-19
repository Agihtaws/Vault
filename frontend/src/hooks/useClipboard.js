import { useCallback, useRef } from 'react';
import { useSessionStore, useUIStore } from '../store/useStore';

export const useClipboard = () => {
  const { clearClipboardSeconds } = useSessionStore();
  const { showNotification } = useUIStore();
  const timeoutRef = useRef(null);

  const copyToClipboard = useCallback(async (text, message = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      
      showNotification({
        type: 'success',
        message,
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          await navigator.clipboard.writeText('');
        } catch (err) {
          }
      }, clearClipboardSeconds * 1000);

    } catch (err) {
      console.error('Failed to copy:', err);
      showNotification({
        type: 'error',
        message: 'Failed to copy to clipboard',
      });
    }
  }, [clearClipboardSeconds, showNotification]);

  return {
    copyToClipboard,
  };
};
