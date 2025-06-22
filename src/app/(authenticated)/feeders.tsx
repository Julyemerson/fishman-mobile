import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import FeedersList from '@/components/FeedersList';
import SplashScreen from '@/components/SplashScreen';
import { useFeederStore } from '@/store/feeder.store';
import { IFeeder } from '@/types/feeder';

export default function Feeders() {
  const { pondId } = useLocalSearchParams();
  const router = useRouter();
  const [feeders, setFeeders] = useState<IFeeder[]>();
  const { error, fetchFeeder, isLoading } = useFeederStore();

  useEffect(() => {
    const fetchFeeders = async () => {
      const feeders = await fetchFeeder(Number(pondId));
      setFeeders(feeders);
    };
    if (pondId) {
      fetchFeeders();
    }
  }, []);

  function handlePressBackButton() {
    router.back();
  }

  if (isLoading) {
    return <SplashScreen />;
  }

  function handleFeederPress(feederId: string) {
    router.push({ pathname: '/feederDetail', params: { feederId } });
  }

  return (
    <>
      <Container>
        <View style={styles.headerContainer}>
          <Text style={styles.headerPrimaryText}>Alimentadores</Text>
          <Text style={styles.headerSecondaryText}>Clique para selecionar o Alimentador</Text>
        </View>
        <View style={styles.container}>
          <FeedersList feeders={feeders ?? []} onPress={handleFeederPress} />
        </View>
        {error && (
          <View style={styles.container}>
            <Text style={{ color: 'red' }}>{error}</Text>
          </View>
        )}
        <Button style={styles.buttonBack} title="Voltar" onPress={handlePressBackButton} />
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginTop: 10,
    padding: 5,
    gap: 5,
  },
  headerPrimaryText: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  headerSecondaryText: {
    fontWeight: '400',
    fontSize: 16,
  },
  buttonBack: {
    marginBottom: 40,
  },
});
