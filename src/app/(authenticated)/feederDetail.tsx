import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, Alert } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import SplashScreen from '@/components/SplashScreen';
import api from '@/services/api';
import { useFarmStore } from '@/store/farm.store';
import { useFeederStore } from '@/store/feeder.store';
import { FEEDER_STATUS, IFeeder } from '@/types/feeder';
import formatTime from '@/utils/formatTime';

export default function FeederDetail() {
  const [isActiveFeeder, setIsActiveFeeder] = useState(false);
  const [selectedFeeder, setSelectedFeeder] = useState<IFeeder>();
  const [initialWeight, setInitialWeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { feederId } = useLocalSearchParams();
  const { feeder, isLoading } = useFeederStore();
  const { farm } = useFarmStore();

  const router = useRouter();

  useEffect(() => {
    if (feeder && feeder.length > 0 && feederId) {
      const foundFeeder = feeder.find((item) => {
        return item.id === feederId;
      });

      if (foundFeeder) {
        setSelectedFeeder(foundFeeder);
        setIsActiveFeeder(foundFeeder.isActive === FEEDER_STATUS.ACTIVE);
        setInitialWeight(String(foundFeeder.initialDistributedWeight ?? ''));
      }
    }
  }, [feeder, feederId]);

  function handleToggleFeederActive(newValue: boolean) {
    if (newValue === true) {
      setIsActiveFeeder(true);
    } else {
      Alert.alert('Desativar Alimentador', 'Tem certeza que deseja desativar este alimentador?', [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        { text: 'Desativar', onPress: () => setIsActiveFeeder(false), style: 'destructive' },
      ]);
    }
  }

  async function handleSaveFeederDetails() {
    const weight = Number(initialWeight.replace(',', '.'));
    if (initialWeight.trim() === '' || Number.isNaN(weight) || weight < 0) {
      Alert.alert('Valor inválido', 'Informe uma quantidade de ração válida em kg.');
      return;
    }

    setIsSaving(true);
    try {
      await api.patch(`/feeders/${feederId}`, {
        isActive: isActiveFeeder ? FEEDER_STATUS.ACTIVE : FEEDER_STATUS.INACTIVE,
        initialDistributedWeight: weight,
      });
      Alert.alert('Sucesso', 'Detalhes do alimentador salvos com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (error: any) {
      console.error('Erro ao salvar alimentador:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível salvar os detalhes do alimentador. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Container>
      <View style={styles.container}>
        <View>
          <Text style={styles.headerText}>{farm.name}</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchHeaderText}>{selectedFeeder?.name}</Text>
            <Switch
              value={isActiveFeeder}
              onValueChange={handleToggleFeederActive}
              trackColor={{ false: '#767577', true: '#007458' }}
              thumbColor={isActiveFeeder ? '#6ec531' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <Text style={styles.switchText}>
            Insira a quantidade de ração que será distribuída ao longo do dia
          </Text>
        </View>
        <View style={styles.inputInitialWeight}>
          <TextInput
            style={styles.inputInitialWeightText}
            value={initialWeight}
            onChangeText={setInitialWeight}
            keyboardType="decimal-pad"
          />
          <Text style={styles.inputInitialWeightText}>kg</Text>
        </View>
        <View>
          <Text style={styles.switchText}>
            Configure o horário inicial e final de funcionamento do raçoador
          </Text>
          <View style={styles.timeBoxContainer}>
            <View style={styles.timeBox}>
              <Text style={styles.timeBoxTextHeader}>Horário Inicial</Text>
              <Text style={styles.timeBoxText}>
                {selectedFeeder?.startFeedTime ? formatTime(selectedFeeder.startFeedTime) : '--:--'}
              </Text>
            </View>
            <View style={styles.timeBox}>
              <Text style={styles.timeBoxTextHeader}>Horário Final</Text>
              <Text style={styles.timeBoxText}>
                {selectedFeeder?.stopFeedTime ? formatTime(selectedFeeder.stopFeedTime) : '--:--'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.containerButton}>
        <Button
          style={styles.btnSave}
          title={isSaving ? 'Salvando...' : 'Salvar'}
          onPress={handleSaveFeederDetails}
          disabled={isSaving}
        />
        <Button title="Voltar" onPress={() => router.back()} />
      </View>
    </Container>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 900,
    marginTop: 10,
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchHeaderText: {
    fontSize: 24,
    fontWeight: '900',
  },
  switchText: {
    fontSize: 16,
    fontWeight: '400',
  },
  btnSave: {
    backgroundColor: '#40A014',
  },
  containerButton: {
    marginBottom: 40,
    gap: 20,
  },
  inputInitialWeight: {
    width: 213,
    height: 180,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#DDD',
  },
  inputInitialWeightText: {
    fontSize: 48,
    fontWeight: 900,
    color: '#585858',
  },
  timeBoxContainer: {
    width: '100%',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  timeBox: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '48%',
    marginTop: 12,
    padding: 15,
    gap: 10,
  },
  timeBoxTextHeader: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeBoxText: {
    fontSize: 24,
    fontWeight: '700',
  },
});
