import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { Button } from '@/components/Button';
import ConnectionStatus from '@/components/ConnectionStatus';
import { Container } from '@/components/Container';
import FeedingLogList from '@/components/FeedingLogList';
import SplashScreen from '@/components/SplashScreen';
import api from '@/services/api';
import { useFarmStore } from '@/store/farm.store';
import { useFeederStore } from '@/store/feeder.store';
import { IFeeder, IFeedingLog } from '@/types/feeder';
import {
  MinutesOfDay,
  formatMinutes,
  isoToMinutes,
  minutesToIso,
  minutesToPickerDate,
  pickerDateToMinutes,
  validateFeedSchedule,
} from '@/utils/feedTime';

type TimeField = 'start' | 'stop';

/** Converte texto digitado ("1,5", "2") em número; null se vazio ou inválido. */
function parseDecimal(value: string): number | null {
  const trimmed = value.trim().replace(',', '.');
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function FeederDetail() {
  const [selectedFeeder, setSelectedFeeder] = useState<IFeeder>();
  const [isActiveFeeder, setIsActiveFeeder] = useState(false);
  const [initialWeight, setInitialWeight] = useState('');
  const [feedInterval, setFeedInterval] = useState('');
  const [startMinutes, setStartMinutes] = useState<MinutesOfDay | null>(null);
  const [stopMinutes, setStopMinutes] = useState<MinutesOfDay | null>(null);
  const [iosPickerField, setIosPickerField] = useState<TimeField | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [logs, setLogs] = useState<IFeedingLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const { feederId } = useLocalSearchParams<{ feederId: string }>();
  const { feeder, isLoading } = useFeederStore();
  const { farm } = useFarmStore();

  const router = useRouter();

  useEffect(() => {
    if (feeder && feeder.length > 0 && feederId) {
      const foundFeeder = feeder.find((item) => item.id === feederId);

      if (foundFeeder) {
        setSelectedFeeder(foundFeeder);
        setIsActiveFeeder(foundFeeder.isActive);
        setInitialWeight(String(foundFeeder.initialDistributedWeight ?? ''));
        setFeedInterval(String(foundFeeder.feedInterval ?? ''));
        setStartMinutes(isoToMinutes(foundFeeder.startFeedTime));
        setStopMinutes(isoToMinutes(foundFeeder.stopFeedTime));
      }
    }
  }, [feeder, feederId]);

  const fetchLogs = useCallback(async () => {
    if (!feederId) return;
    setLogsLoading(true);
    setLogsError(null);
    try {
      const { data } = await api.get<IFeedingLog[]>(`/feeders/logs/${feederId}`);
      setLogs(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Erro ao buscar alimentações:', error.response?.data || error.message);
      setLogsError('Não foi possível carregar as alimentações de hoje.');
    } finally {
      setLogsLoading(false);
    }
  }, [feederId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const isCalibrated =
    !!selectedFeeder?.kilogramsPerSecond && selectedFeeder.kilogramsPerSecond > 0;

  const weightValue = parseDecimal(initialWeight);
  const intervalValue = parseDecimal(feedInterval);
  const schedule = validateFeedSchedule({
    startMinutes,
    stopMinutes,
    feedIntervalMinutes: intervalValue,
    dailyGoalKg: weightValue,
    kilogramsPerSecond: selectedFeeder?.kilogramsPerSecond ?? null,
  });

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

  function setTime(field: TimeField, minutes: MinutesOfDay) {
    if (field === 'start') setStartMinutes(minutes);
    else setStopMinutes(minutes);
  }

  function handleOpenTimePicker(field: TimeField) {
    const current = field === 'start' ? startMinutes : stopMinutes;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: minutesToPickerDate(current),
        mode: 'time',
        is24Hour: true,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === 'set' && date) {
            setTime(field, pickerDateToMinutes(date));
          }
        },
      });
    } else {
      setIosPickerField((open) => (open === field ? null : field));
    }
  }

  function handleIosTimeChange(_event: DateTimePickerEvent, date?: Date) {
    if (iosPickerField && date) {
      setTime(iosPickerField, pickerDateToMinutes(date));
    }
  }

  async function handleSaveFeederDetails() {
    if (initialWeight.trim() !== '' && (weightValue === null || weightValue < 0)) {
      Alert.alert('Valor inválido', 'Informe uma quantidade de ração válida em kg.');
      return;
    }

    if (
      feedInterval.trim() !== '' &&
      (intervalValue === null || intervalValue <= 0 || !Number.isInteger(intervalValue))
    ) {
      Alert.alert(
        'Valor inválido',
        'O intervalo entre doses deve ser um número inteiro de minutos.'
      );
      return;
    }

    // Um alimentador ativo precisa de uma configuração que o backend consiga executar.
    // Desativado, pode ser salvo incompleto (ex.: só para desligar).
    if (isActiveFeeder) {
      if (weightValue === null || weightValue <= 0) {
        Alert.alert('Quantidade obrigatória', 'Informe a quantidade de ração diária em kg.');
        return;
      }
      if ('error' in schedule) {
        Alert.alert('Configuração inválida', schedule.error);
        return;
      }
    }

    setIosPickerField(null);
    setIsSaving(true);
    try {
      await api.patch(`/feeders/${feederId}`, {
        isActive: isActiveFeeder,
        ...(weightValue !== null && { initialDistributedWeight: weightValue }),
        ...(intervalValue !== null && { feedInterval: intervalValue }),
        ...(startMinutes !== null && { startFeedTime: minutesToIso(startMinutes) }),
        ...(stopMinutes !== null && { stopFeedTime: minutesToIso(stopMinutes) }),
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.headerText}>{farm.name}</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchHeaderText}>{selectedFeeder?.name}</Text>
            <Switch
              value={isActiveFeeder}
              onValueChange={handleToggleFeederActive}
              trackColor={{ false: '#767577', true: '#007458' }}
              thumbColor={isActiveFeeder ? '#6ec531' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              accessibilityLabel="Alimentador ativo"
            />
          </View>
          {selectedFeeder && (
            <ConnectionStatus
              isOnline={selectedFeeder.isOnline}
              lastSeenAt={selectedFeeder.lastSeenAt}
            />
          )}
        </View>

        {selectedFeeder && !isCalibrated && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={20} color="#8A5A00" />
            <Text style={styles.warningText}>
              Alimentador não calibrado. Ele não vai distribuir ração até que a vazão (kg/s) seja
              configurada. Fale com o suporte.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>
            Insira a quantidade de ração que será distribuída ao longo do dia
          </Text>
          <View style={styles.inputInitialWeight}>
            <TextInput
              style={styles.inputInitialWeightText}
              value={initialWeight}
              onChangeText={setInitialWeight}
              keyboardType="decimal-pad"
              placeholder="0"
              accessibilityLabel="Quantidade de ração diária em kg"
            />
            <Text style={styles.inputInitialWeightText}>kg</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Configure o horário inicial e final de funcionamento do raçoador
          </Text>
          <View style={styles.timeBoxContainer}>
            <TouchableOpacity
              style={[styles.timeBox, iosPickerField === 'start' && styles.timeBoxSelected]}
              onPress={() => handleOpenTimePicker('start')}
              accessibilityRole="button"
              accessibilityLabel={`Horário inicial: ${formatMinutes(startMinutes)}. Toque para alterar`}>
              <Text style={styles.timeBoxTextHeader}>Horário Inicial</Text>
              <Text style={styles.timeBoxText}>{formatMinutes(startMinutes)}</Text>
              <Text style={styles.hint}>Toque para alterar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeBox, iosPickerField === 'stop' && styles.timeBoxSelected]}
              onPress={() => handleOpenTimePicker('stop')}
              accessibilityRole="button"
              accessibilityLabel={`Horário final: ${formatMinutes(stopMinutes)}. Toque para alterar`}>
              <Text style={styles.timeBoxTextHeader}>Horário Final</Text>
              <Text style={styles.timeBoxText}>{formatMinutes(stopMinutes)}</Text>
              <Text style={styles.hint}>Toque para alterar</Text>
            </TouchableOpacity>
          </View>
          {Platform.OS === 'ios' && iosPickerField && (
            <View style={styles.iosPickerContainer}>
              <DateTimePicker
                value={minutesToPickerDate(iosPickerField === 'start' ? startMinutes : stopMinutes)}
                mode="time"
                display="spinner"
                is24Hour
                locale="pt-BR"
                onChange={handleIosTimeChange}
              />
              <Button title="Confirmar horário" onPress={() => setIosPickerField(null)} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Intervalo entre doses</Text>
          <View style={styles.intervalRow}>
            <TextInput
              style={styles.intervalInput}
              value={feedInterval}
              onChangeText={setFeedInterval}
              keyboardType="number-pad"
              placeholder="30"
              accessibilityLabel="Intervalo entre doses em minutos"
            />
            <Text style={styles.intervalUnit}>minutos</Text>
          </View>
          <Text style={'error' in schedule ? styles.scheduleError : styles.hint}>
            {'error' in schedule
              ? schedule.error
              : schedule.plan.doseKg !== null
                ? `${schedule.plan.numberOfDoses} doses de ${schedule.plan.doseKg.toFixed(2)} kg por dia`
                : `${schedule.plan.numberOfDoses} doses por dia`}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>Alimentações de hoje</Text>
            <TouchableOpacity
              onPress={fetchLogs}
              disabled={logsLoading}
              accessibilityRole="button"
              accessibilityLabel="Atualizar alimentações de hoje">
              {logsLoading ? (
                <ActivityIndicator size="small" color="#585858" />
              ) : (
                <Ionicons name="refresh" size={22} color="#585858" />
              )}
            </TouchableOpacity>
          </View>
          {logsError ? (
            <Text style={styles.scheduleError}>{logsError}</Text>
          ) : (
            <FeedingLogList logs={logs} />
          )}
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
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 24,
    paddingBottom: 40,
  },
  section: {
    gap: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchHeaderText: {
    fontSize: 24,
    fontWeight: '900',
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
  },
  hint: {
    fontSize: 12,
    color: '#585858',
  },
  scheduleError: {
    fontSize: 14,
    color: '#C62828',
  },
  warningBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF4D6',
    borderWidth: 1,
    borderColor: '#F0C36D',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#5C3D00',
  },
  btnSave: {
    backgroundColor: '#40A014',
  },
  containerButton: {
    gap: 20,
  },
  inputInitialWeight: {
    alignSelf: 'center',
    width: 213,
    height: 140,
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
    fontWeight: '900',
    color: '#585858',
  },
  timeBoxContainer: {
    width: '100%',
    justifyContent: 'space-between',
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
    padding: 15,
    gap: 6,
  },
  timeBoxSelected: {
    borderColor: '#40A014',
    borderWidth: 2,
  },
  timeBoxTextHeader: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeBoxText: {
    fontSize: 24,
    fontWeight: '700',
  },
  iosPickerContainer: {
    gap: 8,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  intervalInput: {
    minWidth: 100,
    height: 52,
    paddingHorizontal: 14,
    fontSize: 24,
    fontWeight: '700',
    color: '#585858',
    textAlign: 'center',
    backgroundColor: '#f7f7f7',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#DDD',
  },
  intervalUnit: {
    fontSize: 16,
    color: '#585858',
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
