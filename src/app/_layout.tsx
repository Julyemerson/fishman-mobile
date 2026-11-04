import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from '@/components/SplashScreen';
import { useAuthStore } from '@/store/auth.store';

export default function RootLayout() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // As fontes vêm no pacote do app; se falharem por algum motivo, segue com a fonte do sistema.
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });
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

  if (!hasHydrated || (!fontsLoaded && !fontError)) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name={isAuthenticated ? '(authenticated)' : '(auth)'} />
      </Stack>
    </SafeAreaProvider>
  );
}
