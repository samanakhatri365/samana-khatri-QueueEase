import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to detect when the app regains focus
 * Useful for triggering data refresh when user returns to the app
 * (Important for PWA - mobile browsers pause JS when screen is off)
 */
export const useAppFocus = (onFocus) => {
  const [isFocused, setIsFocused] = useState(!document.hidden);
  const [lastFocusTime, setLastFocusTime] = useState(Date.now());

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setLastFocusTime(Date.now());
    if (onFocus) {
      onFocus();
    }
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  useEffect(() => {
    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      } else {
        handleFocus();
      }
    };

    // Handle window focus/blur
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleFocus, handleBlur]);

  return {
    isFocused,
    lastFocusTime
  };
};

export default useAppFocus;
