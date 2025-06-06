import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <Redirect href="/(authenticated)/ponds" /> : <Redirect href="/(auth)" />;
}
