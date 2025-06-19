import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import FeedersList from '@/components/FeedersList';
import SplashScreen from '@/components/SplashScreen';
import api from '@/services/api';
import { IFeeder } from '@/types/feeder';

export default function Feeders() {
  const [loading, setLoading] = useState(false);
  const [feeders, setFeeders] = useState<IFeeder[]>();
  const [error, setError] = useState<string | null>(null);
  const { pondId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchFeeders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/feeders/pond/${pondId}`);
        if (!response.data) {
          throw new Error('Failed to fetch feeders');
        }
        const data: IFeeder[] = response.data;
        setFeeders(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching feeders');
      } finally {
        setLoading(false);
      }
    };
    if (pondId) {
      fetchFeeders();
    }
    return () => {
      // Cleanup function to reset state or cancel requests if necessary
      setFeeders([]);
      setError(null);
    };
  }, []);

  function handlePressBackButton() {
    router.back();
  }

  if (loading) {
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
    marginBottom: 25,
  },
});
