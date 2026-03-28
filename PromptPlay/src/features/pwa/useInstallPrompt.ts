import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  preventDefault(): void;
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UseInstallPromptResult {
  canInstall: boolean;
  triggerInstall: () => Promise<void>;
}

export function useInstallPrompt(): UseInstallPromptResult {
  if (Platform.OS !== 'web') {
    return { canInstall: false, triggerInstall: async () => {} };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const triggerInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  return {
    canInstall: promptEvent !== null,
    triggerInstall,
  };
}
