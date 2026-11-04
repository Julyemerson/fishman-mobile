/**
 * Mudar configuração: passo a passo, uma pergunta por tela e sem teclado.
 * 1. Ração por dia → 2. Que horas começa → 3. Que horas termina → 4. Intervalo → Resumo → Salvo!
 */
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppText,
  Banner,
  BigButton,
  ChoiceChips,
  ChoiceOption,
  EmptyState,
  Icon,
  IconName,
  Screen,
  SpeakButton,
  Stepper,
  SuccessView,
  TimeStepper,
} from '@/components/ui';
import api from '@/services/api';
import { useFeederStore } from '@/store/feeder.store';
import { colors, radius, spacing } from '@/theme';
import { formatMinutes, isoToMinutes, minutesToIso, validateFeedSchedule } from '@/utils/feedTime';
import { formatKg } from '@/utils/format';
import { haptics } from '@/utils/haptics';
import { formatTimeSpoken } from '@/utils/speech';

const TOTAL_STEPS = 4;
const SUMMARY = TOTAL_STEPS; // índice da tela de resumo

const KG_PRESETS = [20, 30, 40, 50];
const START_PRESETS = [5, 6, 7, 8].map((h) => h * 60);
const STOP_PRESETS = [16, 17, 18, 19].map((h) => h * 60);
const INTERVAL_PRESETS = [15, 30, 60, 120];

interface Config {
  kg: number;
  start: number;
  stop: number;
  interval: number;
}

function intervalOption(minutes: number): ChoiceOption<number> {
  if (minutes >= 60 && minutes % 60 === 0) {
    const h = minutes / 60;
    const unit = h === 1 ? 'hora' : 'horas';
    return { value: minutes, label: String(h), sublabel: unit, accessibilityLabel: `${h} ${unit}` };
  }
  return {
    value: minutes,
    label: String(minutes),
    sublabel: 'minutos',
    accessibilityLabel: `${minutes} minutos`,
  };
}

function intervalText(minutes: number): string {
  const o = intervalOption(minutes);
  return `${o.label} ${o.sublabel}`;
}

export default function Configurar() {
  const router = useRouter();
  const { feederId } = useLocalSearchParams<{ feederId: string }>();
  const feeder = useFeederStore((s) => s.feeders.find((f) => f.id === feederId));
  const patchFeeder = useFeederStore((s) => s.patchFeeder);

  // Valores iniciais: a configuração atual, ou sugestões razoáveis quando falta algo.
  const initial = useMemo<Config | null>(
    () =>
      feeder
        ? {
            kg: Math.max(1, Math.round(feeder.initialDistributedWeight || 40)),
            start: isoToMinutes(feeder.startFeedTime) ?? 8 * 60,
            stop: isoToMinutes(feeder.stopFeedTime) ?? 17 * 60,
            interval: feeder.feedInterval || 30,
          }
        : null,
    // Só na abertura: atualizações automáticas não podem mexer no que a pessoa está escolhendo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feeder?.id]
  );

  const [config, setConfig] = useState<Config | null>(initial);
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!config && initial) setConfig(initial);
  }, [config, initial]);

  const isDirty =
    !!config &&
    !!initial &&
    (config.kg !== initial.kg ||
      config.start !== initial.start ||
      config.stop !== initial.stop ||
      config.interval !== initial.interval);

  const leave = useCallback(() => {
    if (!isDirty) {
      router.back();
      return;
    }
    Alert.alert('Sair sem salvar?', 'O que você escolheu agora vai ser perdido.', [
      { text: 'Continuar aqui', style: 'cancel' },
      { text: 'Sair sem salvar', style: 'destructive', onPress: () => router.back() },
    ]);
  }, [isDirty, router]);

  const goBack = useCallback(() => {
    if (step === 0) leave();
    else setStep((s) => s - 1);
  }, [step, leave]);

  // Botão "voltar" do Android: volta um passo, em vez de sair da configuração.
  useFocusEffect(
    useCallback(() => {
      if (done) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goBack();
        return true;
      });
      return () => sub.remove();
    }, [done, goBack])
  );

  if (!feeder || !config) {
    return (
      <Screen
        header={<AppHeader title="Configurar" back={{ onPress: () => router.back() }} />}
        scroll={false}>
        <EmptyState
          icon="help-circle-outline"
          title="Alimentador não encontrado"
          message="Volte e abra o alimentador de novo."
          action={{ label: 'Voltar', icon: 'arrow-left', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const set = (changes: Partial<Config>) => setConfig({ ...config, ...changes });

  const check = validateFeedSchedule({
    startMinutes: config.start,
    stopMinutes: config.stop,
    feedIntervalMinutes: config.interval,
    dailyGoalKg: config.kg,
    kilogramsPerSecond: feeder.kilogramsPerSecond,
  });
  const plan = 'plan' in check ? check.plan : null;
  const planText = plan
    ? `Os camarões vão comer ${plan.numberOfDoses} ${plan.numberOfDoses === 1 ? 'vez' : 'vezes'} por dia${
        plan.doseKg !== null ? `, ${formatKg(plan.doseKg)} kg cada vez` : ''
      }.`
    : '';

  // O que impede de seguir em cada passo (null = pode seguir).
  const stepError =
    step === 2 && config.stop <= config.start
      ? 'O horário de terminar precisa ser depois do horário de começar.'
      : step === 3 && 'error' in check
        ? check.error
        : null;

  async function save() {
    setIsSaving(true);
    setSaveFailed(false);
    const changes = {
      initialDistributedWeight: config!.kg,
      startFeedTime: minutesToIso(config!.start),
      stopFeedTime: minutesToIso(config!.stop),
      feedInterval: config!.interval,
    };
    try {
      await api.patch(`/feeders/${feeder!.id}`, changes);
      patchFeeder(feeder!.id, changes);
      setDone(true); // SuccessView vibra ao aparecer
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error.response?.data || error.message);
      haptics.error();
      setSaveFailed(true);
    } finally {
      setIsSaving(false);
    }
  }

  if (done) {
    return (
      <SuccessView
        message={`O ${feeder.name} já vai seguir a nova configuração.`}
        action={{
          label: 'Voltar ao alimentador',
          icon: 'arrow-left',
          onPress: () => router.back(),
        }}>
        <View style={styles.doneSummary}>
          <SummaryLine label="Ração por dia" value={`${config.kg} kg`} />
          <SummaryLine
            label="Horário"
            value={`${formatMinutes(config.start)} até ${formatMinutes(config.stop)}`}
          />
          <SummaryLine label="De quanto em quanto" value={intervalText(config.interval)} />
        </View>
      </SuccessView>
    );
  }

  const speech = () => {
    switch (step) {
      case 0:
        return `Quanta ração por dia? Agora está em ${config.kg} quilos. Use os botões de menos e de mais.`;
      case 1:
        return `Que horas começa a dar ração? Agora está às ${formatTimeSpoken(config.start)}.`;
      case 2:
        return `Que horas termina? Agora está às ${formatTimeSpoken(config.stop)}.${stepError ? ` ${stepError}` : ''}`;
      case 3:
        return `De quanto em quanto tempo? Agora está a cada ${intervalText(config.interval)}. ${stepError ?? planText}`;
      default:
        return `Confira: ${config.kg} quilos por dia, começando às ${formatTimeSpoken(config.start)} e terminando às ${formatTimeSpoken(
          config.stop
        )}, a cada ${intervalText(config.interval)}. ${planText} Se estiver certo, toque em Salvar.`;
    }
  };

  const header = (
    <View>
      <AppHeader
        title={step < SUMMARY ? `Passo ${step + 1} de ${TOTAL_STEPS}` : 'Confira'}
        back={step === 0 ? { label: 'Cancelar', onPress: leave } : { onPress: goBack }}
        right={<SpeakButton text={speech} />}
      />
      <View style={styles.progress} accessibilityElementsHidden importantForAccessibility="no">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View key={i} style={[styles.progressSegment, i <= step && styles.progressDone]} />
        ))}
      </View>
    </View>
  );

  const footer =
    step < SUMMARY ? (
      <BigButton
        title={step === TOTAL_STEPS - 1 ? 'Ver resumo' : 'Próximo'}
        icon="arrow-right"
        iconPosition="right"
        large
        disabled={!!stepError}
        onPress={() => setStep(step + 1)}
      />
    ) : (
      <>
        <BigButton title="Salvar" icon="check-bold" large loading={isSaving} onPress={save} />
        <BigButton title="Cancelar" variant="ghost" onPress={leave} />
      </>
    );

  return (
    <Screen header={header} footer={footer} contentStyle={styles.content}>
      {step === 0 && (
        <Question icon="sack" title="Quanta ração por dia?">
          <Stepper
            value={config.kg}
            onChange={(kg) => set({ kg })}
            min={1}
            max={500}
            unit="quilos"
            unitSingular="quilo"
          />
          <AppText variant="body" color={colors.textMuted} align="center">
            Ou escolha:
          </AppText>
          <ChoiceChips
            columns={4}
            value={config.kg}
            onChange={(kg) => set({ kg })}
            options={KG_PRESETS.map((v) => ({
              value: v,
              label: `${v} kg`,
              accessibilityLabel: `${v} quilos`,
            }))}
          />
        </Question>
      )}

      {step === 1 && (
        <Question icon="weather-sunset-up" iconTone="warm" title="Que horas começa a dar ração?">
          <TimeStepper value={config.start} onChange={(start) => set({ start })} />
          <ChoiceChips
            columns={4}
            value={config.start}
            onChange={(start) => set({ start })}
            options={START_PRESETS.map((m) => ({ value: m, label: formatMinutes(m) }))}
          />
        </Question>
      )}

      {step === 2 && (
        <Question icon="weather-night" title="Que horas termina?">
          <TimeStepper value={config.stop} onChange={(stop) => set({ stop })} />
          <ChoiceChips
            columns={4}
            value={config.stop}
            onChange={(stop) => set({ stop })}
            options={STOP_PRESETS.map((m) => ({ value: m, label: formatMinutes(m) }))}
          />
          {stepError && <Banner variant="error" title={stepError} />}
        </Question>
      )}

      {step === 3 && (
        <Question icon="history" title="De quanto em quanto tempo?">
          <ChoiceChips
            columns={2}
            value={config.interval}
            onChange={(interval) => set({ interval })}
            options={[...new Set([...INTERVAL_PRESETS, config.interval])]
              .sort((a, b) => a - b)
              .map(intervalOption)}
          />
          {stepError ? (
            <Banner variant="error" title="Não vai dar certo assim" message={stepError} />
          ) : (
            <View style={styles.planBox} accessibilityLiveRegion="polite">
              <Icon name="shrimp" size={30} color={colors.primary} />
              <AppText variant="body" style={styles.flex}>
                {planText}
              </AppText>
            </View>
          )}
        </Question>
      )}

      {step === SUMMARY && (
        <View style={styles.summary}>
          <View>
            <AppText variant="question">Está certo?</AppText>
            <AppText variant="bodyRegular" color={colors.textSecondary}>
              O {feeder.name} vai funcionar assim:
            </AppText>
          </View>
          <SummaryRow
            icon="sack"
            label="Ração por dia"
            value={`${config.kg} kg`}
            onChange={() => setStep(0)}
          />
          <SummaryRow
            icon="weather-sunset-up"
            iconTone="warm"
            label="Começa"
            value={formatMinutes(config.start)}
            onChange={() => setStep(1)}
          />
          <SummaryRow
            icon="weather-night"
            label="Termina"
            value={formatMinutes(config.stop)}
            onChange={() => setStep(2)}
          />
          <SummaryRow
            icon="history"
            label="De quanto em quanto tempo"
            value={intervalText(config.interval)}
            onChange={() => setStep(3)}
          />
          <View style={styles.planBox}>
            <Icon name="shrimp" size={30} color={colors.primary} />
            <AppText variant="body" style={styles.flex}>
              {planText}
            </AppText>
          </View>
          {saveFailed && (
            <Banner
              variant="error"
              title="Não foi possível salvar"
              message="Verifique a internet do celular e toque em Salvar de novo."
            />
          )}
        </View>
      )}
    </Screen>
  );
}

function IconTile({
  icon,
  tone = 'cool',
  size = 96,
}: {
  icon: IconName;
  tone?: 'cool' | 'warm';
  size?: number;
}) {
  return (
    <View
      style={[
        styles.iconTile,
        { width: size, height: size, borderRadius: size * 0.3 },
        tone === 'warm' ? styles.tileWarm : styles.tileCool,
      ]}>
      <Icon
        name={icon}
        size={size * 0.58}
        color={tone === 'warm' ? colors.onWarning : colors.primary}
      />
    </View>
  );
}

function Question({
  icon,
  iconTone,
  title,
  children,
}: {
  icon: IconName;
  iconTone?: 'cool' | 'warm';
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.question}>
      <IconTile icon={icon} tone={iconTone} />
      <AppText variant="question" align="center" accessibilityRole="header">
        {title}
      </AppText>
      <View style={styles.questionBody}>{children}</View>
    </View>
  );
}

function SummaryRow({
  icon,
  iconTone,
  label,
  value,
  onChange,
}: {
  icon: IconName;
  iconTone?: 'cool' | 'warm';
  label: string;
  value: string;
  onChange: () => void;
}) {
  return (
    <View style={styles.summaryRow}>
      <IconTile icon={icon} tone={iconTone} size={52} />
      <View style={styles.flex} accessible accessibilityLabel={`${label}: ${value}`}>
        <AppText variant="label" color={colors.textMuted}>
          {label}
        </AppText>
        <AppText variant="title" style={styles.summaryValue}>
          {value}
        </AppText>
      </View>
      <BigButton
        title="Mudar"
        variant="secondary"
        onPress={onChange}
        accessibilityHint={`Mudar ${label.toLowerCase()}`}
        style={styles.changeButton}
      />
    </View>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryLine}>
      <AppText variant="bodyRegular" color={colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
  },
  flex: {
    flex: 1,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  progressDone: {
    backgroundColor: colors.primary,
  },
  question: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  questionBody: {
    alignSelf: 'stretch',
    gap: spacing.lg,
  },
  iconTile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileCool: {
    backgroundColor: colors.primarySoft,
  },
  tileWarm: {
    backgroundColor: colors.warning,
  },
  planBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },
  summary: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    fontFamily: 'Nunito_900Black',
  },
  changeButton: {
    paddingHorizontal: spacing.md,
  },
  doneSummary: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
