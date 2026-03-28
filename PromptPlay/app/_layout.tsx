import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '@/src/i18n';

import { useColorScheme } from '@/components/useColorScheme';
import { useHasHydrated, useProgressStore } from '@/src/store/useProgressStore';
import { useServiceWorker } from '@/src/features/pwa/useServiceWorker';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const hasHydrated = useHasHydrated();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Gate rendering until both fonts are loaded and MMKV store is hydrated.
  // MMKV is synchronous so this resolves on the first render after mount —
  // no visible flicker, but prevents child components reading stale defaults.
  if (!loaded || !hasHydrated) {
    return null;
  }

  // Redirect new users (no goal set) to onboarding before showing tabs.
  // Hydration guard above ensures dailyGoal is read from persisted store, not default null.
  const dailyGoal = useProgressStore.getState().dailyGoal;
  if (dailyGoal === null) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  // Register service worker after window.load — web only, no-op on native
  useServiceWorker();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(lesson)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
