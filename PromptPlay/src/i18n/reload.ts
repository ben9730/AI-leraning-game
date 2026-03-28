import { DevSettings, Platform } from 'react-native';

export async function reloadApp(): Promise<void> {
  // On native, force a full reload for RTL/LTR switch to take effect.
  // expo-updates reloadAsync() was removed to fix web import.meta errors.
  // DevSettings.reload() works in dev; in production builds, users
  // are prompted to restart the app manually.
  if (__DEV__ && Platform.OS !== 'web') {
    DevSettings.reload();
  }
}
