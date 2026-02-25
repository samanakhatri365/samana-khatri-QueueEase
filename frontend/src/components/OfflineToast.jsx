import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useState, useEffect } from 'react';

/**
 * Offline Toast Component
 * Shows a toast notification when the user goes offline
 * Also shows a success message when back online
 */
const OfflineToast = () => {
  const { isOnline, isOffline, wasOffline } = useNetworkStatus();
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('offline'); // 'offline' | 'online'

  useEffect(() => {
    if (isOffline) {
      setToastType('offline');
      setShowToast(true);
    } else if (wasOffline) {
      // Just came back online
      setToastType('online');
      setShowToast(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [isOffline, wasOffline]);

  if (!showToast) {
    return null;
  }

  const getToastContent = () => {
    if (toastType === 'offline') {
      return {
        icon: '📡',
        title: 'You are currently offline',
        message: 'Queue updates may be delayed. Please check your connection.',
        className: 'offline-toast offline'
      };
    }
    return {
      icon: '✅',
      title: 'Back online!',
      message: 'Connection restored. Queue data will refresh.',
      className: 'offline-toast online'
    };
  };

  const content = getToastContent();

  return (
    <div className={content.className}>
      <span className="toast-icon">{content.icon}</span>
      <div className="toast-content">
        <strong>{content.title}</strong>
        <span>{content.message}</span>
      </div>
      {toastType === 'offline' && (
        <button 
          className="toast-close"
          onClick={() => setShowToast(false)}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default OfflineToast;
