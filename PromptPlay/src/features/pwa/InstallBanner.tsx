import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useInstallPrompt } from './useInstallPrompt';

const DISMISS_KEY = 'install-banner-dismissed';

function isStandalone(): boolean {
  if (Platform.OS !== 'web') return true;
  if (typeof window === 'undefined') return false;
  const navStandalone =
    'standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const mediaStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  return navStandalone || mediaStandalone;
}

function isIOSSafari(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallBanner() {
  const { t } = useTranslation();
  const { canInstall, triggerInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check persisted dismiss state from localStorage
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const wasDismissed = localStorage.getItem(DISMISS_KEY) === 'true';
      setDismissed(wasDismissed);
    }
    setMounted(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, 'true');
    }
  };

  // Don't render until we've checked localStorage (avoids flash)
  if (!mounted) return null;

  // Already installed — show nothing
  if (isStandalone()) return null;

  // User dismissed
  if (dismissed) return null;

  const ios = isIOSSafari();

  // Neither iOS nor Android with prompt — show nothing
  if (!ios && !canInstall) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        {ios ? t('pwa.iosInstallHint') : t('pwa.installButton')}
      </Text>
      <View style={styles.actions}>
        {!ios && canInstall && (
          <Pressable
            style={styles.installButton}
            onPress={triggerInstall}
            accessibilityRole="button"
          >
            <Text style={styles.installButtonText}>{t('pwa.installButton')}</Text>
          </Pressable>
        )}
        <Pressable
          style={styles.dismissButton}
          onPress={handleDismiss}
          accessibilityRole="button"
        >
          <Text style={styles.dismissText}>{t('pwa.dismiss')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingStart: 16,
    paddingEnd: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
    marginEnd: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  installButton: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginEnd: 8,
  },
  installButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 13,
  },
  dismissButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dismissText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
});
