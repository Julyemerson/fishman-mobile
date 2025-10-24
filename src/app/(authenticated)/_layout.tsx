import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/store/auth.store';
import { useFarmStore } from '@/store/farm.store';
import { useModalStore } from '@/store/modal.store';
import { IFarm } from '@/types/farm';

export default function ProtectedLayout() {
  const [farm, setFarm] = useState<IFarm>();
  const { isAuthenticated, farmId } = useAuthStore();
  const { fetchFarm } = useFarmStore();
  const { openConfigModal } = useModalStore();
  const { logout } = useAuthStore();

  const router = useRouter();

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
      <Stack.Screen
        name="ponds"
        options={{
          title: farm?.name,
          headerBackVisible: false,
          headerRight: () => <AntDesign name="poweroff" size={28} onPress={logout} />,
        }}
      />
      <Stack.Screen name="feeders" options={{ title: farm?.name, headerBackVisible: false }} />
      <Stack.Screen
        name="feederDetail"
        options={{
          title: farm?.name,
          headerBackVisible: false,
          headerTitle: '',
          headerLeft: () => <AntDesign name="home" size={28} onPress={() => router.replace('/')} />,
          headerRight: () => <MaterialIcons name="settings" size={28} onPress={openConfigModal} />,
        }}
      />
    </Stack>
  );
}
