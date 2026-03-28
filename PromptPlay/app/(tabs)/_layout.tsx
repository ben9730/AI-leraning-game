import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { InstallBanner } from '../../src/features/pwa/InstallBanner';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <InstallBanner />
      <Tabs
      screenOptions={{
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="skill-tree"
        options={{
          title: t('tabs.skillTree'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
        }}
      />
    </Tabs>
    </View>
  );
}
