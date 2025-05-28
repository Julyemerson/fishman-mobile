import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/store/auth.store';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ponds" options={{ title: 'Tanques' }} />
      <Stack.Screen name="feeder" options={{ title: 'Alimentadores' }} />
    </Stack>
  );
}
