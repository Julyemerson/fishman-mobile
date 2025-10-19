import { getLocales } from 'expo-localization';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ConfigModal from './configModal';

import SplashScreen from '@/components/SplashScreen';
import { useAuthStore } from '@/store/auth.store';
import { useModalStore } from '@/store/modal.store';

export default function RootLayout() {
  const deviceLanguage = getLocales()[0].languageCode;
  const [hasHydrated, setHasHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isConfigModalOpen, closeConfigModal } = useModalStore();
  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  if (!hasHydrated) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name={isAuthenticated ? '(authenticated)' : '(auth)'} />
      </Stack>
      <ConfigModal visible={isConfigModalOpen} onClose={closeConfigModal} />
    </SafeAreaProvider>
  );
}
