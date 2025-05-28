import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/store/auth.store';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(authenticated)/ponds" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Login' }} />
    </Stack>
  );
}
