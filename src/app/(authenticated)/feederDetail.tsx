import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, Alert } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import SplashScreen from '@/components/SplashScreen';
import api from '@/services/api';
import { useFarmStore } from '@/store/farm.store';
import { useFeederStore } from '@/store/feeder.store';
import { useModalStore } from '@/store/modal.store';
import { IFeeder } from '@/types/feeder';
import formatTime from '@/utils/formatTime';

export default function FeederDetail() {
  const [time, setTime] = useState(new Date());
  const [isActiveFeeder, setIsActiveFeeder] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedFeeder, setSelectedFeeder] = useState<IFeeder>();

  const { feederId } = useLocalSearchParams();
  const { feeder, isLoading } = useFeederStore();
  const { farm } = useFarmStore();
  const { openConfigModal } = useModalStore();

  const router = useRouter();

  useEffect(() => {
    if (feeder && feeder.length > 0 && feederId) {
      const foundFeeder = feeder.find((item) => {
        return item.id === feederId;
      });

      if (foundFeeder) {
        setSelectedFeeder(foundFeeder);
        setIsActiveFeeder(foundFeeder.isActive === 2);
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
    // Lógica para salvar os detalhes do alimentador
    const isFeederActiveApi = isActiveFeeder ? 2 : 1;

    await api.patch(`/feeders/${feederId}`, {
      isActive: isFeederActiveApi,
      // Outros dados a serem atualizados
    });
    Alert.alert('Sucesso', 'Detalhes do alimentador salvos com sucesso!', [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
  }

  if (isLoading) {
    return <SplashScreen />;
  }

  // function onchange(event: DateTimePickerEvent, selectedTime: Date | undefined) {
  //   const currentTime = selectedTime || time;
  //   setShowTimePicker(false);
  //   setTime(currentTime);
  //   console.log(
  //     'Hora Formatada:',
  //     currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  //   );
  // }

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
            defaultValue={selectedFeeder?.initialDistributedWeight.toString()}
            keyboardType="number-pad"
          />
          <Text style={styles.inputInitialWeightText}>kg</Text>
        </View>
        <View>
          <Text style={styles.switchText}>
            Configure o horário inicial e final de funcionamento do raçoador
          </Text>
          <View style={styles.timeBoxContainer}>
            <View style={styles.timeBox}>
              {/* {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  timeZoneName="America/Sao_Paulo"
                  is24Hour
                  display="default"
                  locale="pt-BR"
                  timeZoneOffsetInMinutes={-180}
                  minimumDate={new Date()}
                  onChange={onchange}
                />
              )} */}
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
        <Button style={styles.btnSave} title="Salvar" onPress={handleSaveFeederDetails} />
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
