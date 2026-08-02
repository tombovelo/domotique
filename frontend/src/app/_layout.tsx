import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getToastConfig } from '@/components/toast-config';
import { loadIp } from '@/services/api';

export default function RootLayout() {
  const theme = useTheme();
  const isDark = theme.bg === '#130A22';
  const loadUser = useAuth((s) => s.loadUser);

  useEffect(() => {
    loadIp().then(() => loadUser());
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(membre)" />
      </Stack>
      <Toast config={getToastConfig(isDark ? 'dark' : 'light')} />
    </>
  );
}
