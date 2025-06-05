import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/store/auth.store';
import { useFarmStore } from '@/store/farm.store';
import { IFarm } from '@/types/farm';

export default function ProtectedLayout() {
  const [farm, setFarm] = useState<IFarm>();
  const { isAuthenticated, farmId } = useAuthStore();
  const { fetchFarm } = useFarmStore();

  useEffect(() => {
    const fetchAndSetFarm = async () => {
      if (farmId !== null) {
        const farmData = await fetchFarm(farmId);

        if (farmData) {
          setFarm(farmData);
        }
      }
    };
    fetchAndSetFarm();
  }, [fetchFarm, farmId]);

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ponds" options={{ title: farm?.name }} />
      <Stack.Screen name="feeder" options={{ title: `Alimentadores`, headerBackVisible: false }} />
    </Stack>
  );
}
