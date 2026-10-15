import { useEffect } from 'react';

/**
 * Lean auto-refresh hook: triggers callback on interval (default 3s) and window focus/visibilitychange.
 */
export function useAutoRefresh(callback, intervalMs = 3000, deps = []) {
  useEffect(() => {
    callback(true);
    const timer = setInterval(() => {
      // Only execute poll request if the browser tab is actively visible to the user
      if (typeof document !== 'undefined' && !document.hidden) {
        callback(true);
      }
    }, intervalMs);

    const handleFocus = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        callback(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, deps);
}
