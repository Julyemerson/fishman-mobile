import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import SplashScreen from '@/components/SplashScreen';
import { useFeederStore } from '@/store/feeder.store';
import { IFeeder } from '@/types/feeder';
import formatTime from '@/utils/formatTime';

export default function FeederDetail() {
  const { feederId } = useLocalSearchParams();
  const { feeder, isLoading } = useFeederStore();

  const [selectedFeeder, setSelectedFeeder] = useState<IFeeder>();

  useEffect(() => {
    const selectedFeeder = feeder.find((item) => {
      return item.id === feederId;
    });
    if (selectedFeeder) {
      setSelectedFeeder(selectedFeeder);
    }
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Container>
      <View style={styles.container}>
        <View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchHeaderText}>{selectedFeeder?.name}</Text>
            <Switch />
          </View>
          <Text style={styles.switchText}>
            Insira a quantidade de ração que será distribuída ao longo do dia
          </Text>
        </View>
        <View style={styles.inputInitialWeight}>
          <TextInput
            style={styles.inputInitialWeightText}
            defaultValue={selectedFeeder?.initialDistributedWeight.toString()}
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
        <Button style={styles.btnSave} title="Salvar" />
        <Button title="Voltar" />
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
    alignItems: 'center',
    gap: 15,
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
