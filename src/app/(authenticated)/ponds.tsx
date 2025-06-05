import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Container } from '@/components/Container';
import PondsList from '@/components/PondsList';
import SplashScreen from '@/components/SplashScreen';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import IPond from '@/types/pond';

export default function Ponds() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IPond[]>();

  const router = useRouter();
  const { farmId } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/ponds/farm/${farmId}`);
        setData(data);
      } catch (error: any) {
        console.error('Não foi possivel fazer a requisição dos viveiros', error.message);
      } finally {
        setLoading(false);
      }
    };
    if (farmId) {
      fetchData();
    }
  }, [farmId]);

  function handlePondPress(pondId: number) {
    router.push({ pathname: '/feeder', params: { pondId } });
  }

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Container>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerPrimaryText}>Viveiros</Text>
          <Text style={styles.headerSecondaryText}>Clique para selecionar o Viveiro</Text>
        </View>

        {data && data?.length > 0 ? (
          <PondsList ponds={data ?? []} onPress={handlePondPress} />
        ) : (
          <Text style={styles.supportText}>Nenhum Viveiro Encontrado</Text>
        )}

        <View style={styles.listContainer}>
          <View>
            <Text style={styles.supportText}>Está com algum problema?</Text>
            <Text style={styles.supportText}>Fale com o nosso suporte</Text>
          </View>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Suporte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 10,
  },
  listContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    gap: 10,
    margin: 10,
  },
  supportButton: {
    width: '100%',
    padding: 4,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#40A014',
    justifyContent: 'center',
  },
  supportButtonText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  supportText: {
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'center',
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
});
