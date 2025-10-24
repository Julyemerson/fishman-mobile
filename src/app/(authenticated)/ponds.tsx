import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from 'react-native';

import { Container } from '@/components/Container';
import PondsList from '@/components/PondsList';
import SplashScreen from '@/components/SplashScreen';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import IPond from '@/types/pond';

export default function Ponds() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IPond[]>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { farmId } = useAuthStore();

  const phoneNumber = process.env.EXPO_PUBLIC_SUPPORT_PHONE_NUMBER || '';
  const messageText = 'Olá, estou com um problema no aplicativo Fishman. Poderiam me ajudar?';

  function handleSupportPress() {
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(messageText)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Erro', 'O WhatsApp não está instalado no dispositivo.');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('Erro ao tentar abrir o WhatsApp:', err));
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/ponds/farm/${farmId}`);
        setData(data);
      } catch (error: any) {
        setError(error.message || 'Não foi possível carregar os viveiros');
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
    router.push({ pathname: '/feeders', params: { pondId } });
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
          <TouchableOpacity style={styles.supportButton} onPress={handleSupportPress}>
            <FontAwesome name="whatsapp" size={28} color="#fff" />
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
    height: 48,
    borderRadius: 10,
    backgroundColor: '#40A014',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 10,
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
