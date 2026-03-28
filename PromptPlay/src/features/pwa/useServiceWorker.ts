import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface UseServiceWorkerResult {
  updateAvailable: boolean;
  applyUpdate: () => void;
}

/**
 * Registers the service worker after window.load (deferred to avoid blocking first paint).
 * Web-only — returns early on native platforms.
 * Detects SW updates and exposes an updateAvailable flag + applyUpdate callback.
 */
export function useServiceWorker(): UseServiceWorkerResult {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Guard: native platforms have no service worker support
    if (Platform.OS !== 'web') return;
    // Guard: SSR / non-browser environments
    if (typeof window === 'undefined') return;
    // Guard: browser doesn't support service workers
    if (!('serviceWorker' in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              // An update is available when the new SW has installed AND
              // there is already a controller (not the very first install)
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setUpdateAvailable(true);
              }
            });
          });
        })
        .catch((err) => {
          // SW registration failure is non-fatal — app still works online
          console.warn('[SW] Registration failed:', err);
        });
    };

    window.addEventListener('load', onLoad);
    return () => {
      window.removeEventListener('load', onLoad);
    };
  }, []);

  const applyUpdate = () => {
    window.location.reload();
  };

  return { updateAvailable, applyUpdate };
}
