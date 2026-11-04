import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/auth.store';
import { useFarmStore } from '@/store/farm.store';
import { colors } from '@/theme';

export default function ProtectedLayout() {
  const { isAuthenticated, farmId } = useAuthStore();
  const fetchFarm = useFarmStore((s) => s.fetchFarm);

  useEffect(() => {
    if (farmId !== null) fetchFarm(farmId);
  }, [fetchFarm, farmId]);

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  // Cada tela desenha o próprio cabeçalho (AppHeader), com "Voltar" escrito.
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="inicio" />
      <Stack.Screen name="feederDetail" />
    </Stack>
  );
}
