import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import SplashScreen from '@/components/SplashScreen';
import { useAuthStore } from '@/store/auth.store';

export default function RootLayout() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name={isAuthenticated ? '(authenticated)' : '(auth)'} />
    </Stack>
  );
}
