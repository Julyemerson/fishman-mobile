import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/store/auth.store';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuthStore();
  const farm = 'DR PESCADOS';

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ponds" options={{ title: farm }} />
      <Stack.Screen name="feeder" options={{ title: 'Alimentadores' }} />
    </Stack>
  );
}
