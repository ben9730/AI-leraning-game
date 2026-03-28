/**
 * InstallBanner tests — run in jsdom (pwa jest project)
 *
 * Mocks:
 *  - react-native Platform.OS = 'web'
 *  - react-i18next useTranslation
 *  - navigator.userAgent (iOS / non-iOS)
 *  - navigator.standalone (iOS standalone flag)
 *  - window.matchMedia (display-mode: standalone)
 *  - localStorage
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

// ─── Mock react-native ────────────────────────────────────────────────────────
jest.mock('react-native', () => ({
  Platform: { OS: 'web', select: (obj: Record<string, unknown>) => obj.web ?? obj.default },
  StyleSheet: { create: (s: Record<string, unknown>) => s },
  View: ({ children, style }: { children?: React.ReactNode; style?: unknown }) =>
    require('react').createElement('div', { style }, children),
  Text: ({ children, style }: { children?: React.ReactNode; style?: unknown }) =>
    require('react').createElement('span', { style }, children),
  Pressable: ({
    children,
    onPress,
    style,
    accessibilityRole,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    style?: unknown;
    accessibilityRole?: string;
  }) =>
    require('react').createElement(
      'button',
      { onClick: onPress, style, role: accessibilityRole },
      children,
    ),
}));

// ─── Mock react-i18next ───────────────────────────────────────────────────────
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

// ─── Mock useInstallPrompt ────────────────────────────────────────────────────
const mockCanInstall = { value: false };
const mockTriggerInstall = jest.fn();

jest.mock('../useInstallPrompt', () => ({
  useInstallPrompt: () => ({
    canInstall: mockCanInstall.value,
    triggerInstall: mockTriggerInstall,
  }),
}));

import { InstallBanner } from '../InstallBanner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setUserAgent(ua: string) {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
}

function setStandalone(value: boolean) {
  Object.defineProperty(navigator, 'standalone', {
    value,
    configurable: true,
    writable: true,
  });
  // Also mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches: value && query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
    configurable: true,
    writable: true,
  });
}

function clearLocalStorage() {
  localStorage.clear();
}

const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  clearLocalStorage();
  mockCanInstall.value = false;
  setStandalone(false);
});

describe('InstallBanner', () => {
  it('renders iOS install hint on iOS Safari (not standalone)', async () => {
    setUserAgent(IOS_UA);
    setStandalone(false);

    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<InstallBanner />));
    });

    expect(container!.textContent).toContain('pwa.iosInstallHint');
  });

  it('renders nothing when already in standalone mode', async () => {
    setUserAgent(IOS_UA);
    setStandalone(true);

    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<InstallBanner />));
    });

    expect(container!.textContent).toBe('');
  });

  it('renders nothing after dismiss button is pressed', async () => {
    setUserAgent(IOS_UA);
    setStandalone(false);

    let getByText: ReturnType<typeof render>['getByText'];
    let queryByText: ReturnType<typeof render>['queryByText'];

    await act(async () => {
      ({ getByText, queryByText } = render(<InstallBanner />));
    });

    const dismissBtn = getByText!('pwa.dismiss');
    await act(async () => {
      fireEvent.click(dismissBtn);
    });

    expect(queryByText!('pwa.iosInstallHint')).toBeNull();
  });

  it('renders nothing on remount when localStorage says dismissed', async () => {
    localStorage.setItem('install-banner-dismissed', 'true');
    setUserAgent(IOS_UA);
    setStandalone(false);

    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<InstallBanner />));
    });

    expect(container!.textContent).toBe('');
  });

  it('renders install button on non-iOS web when canInstall is true', async () => {
    setUserAgent(ANDROID_UA);
    setStandalone(false);
    mockCanInstall.value = true;

    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<InstallBanner />));
    });

    expect(container!.textContent).toContain('pwa.installButton');
  });
});
