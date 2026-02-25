import { useState, useEffect } from 'react';

/**
 * Custom hook to detect online/offline status
 * Returns current network status and provides callbacks for status changes
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Track that user was previously offline (useful for triggering data refresh)
      if (!isOnline) {
        setWasOffline(true);
        // Reset wasOffline after a short delay
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline // True briefly after coming back online
  };
};

export default useNetworkStatus;
