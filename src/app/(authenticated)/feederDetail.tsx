import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { DoseList } from '@/components/DoseList';
import { FeederTestPanel } from '@/components/FeederTestPanel';
import { PowerToggle } from '@/components/PowerToggle';
import {
  AppHeader,
  AppText,
  Banner,
  BigButton,
  Card,
  EmptyState,
  Icon,
  IconName,
  ProgressRing,
  Screen,
  Skeleton,
  SpeakButton,
} from '@/components/ui';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import api from '@/services/api';
import { selectIsAdmin, useAuthStore } from '@/store/auth.store';
import { useFeederStore } from '@/store/feeder.store';
import { colors, radius, spacing } from '@/theme';
import { IFeeder } from '@/types/feeder';
import { formatMinutes, isoToMinutes, validateFeedSchedule } from '@/utils/feedTime';
import { getFeederToday, getNextFeed, getRemainingDoses, needsCalibration } from '@/utils/feeding';
import { formatKg } from '@/utils/format';
import { haptics } from '@/utils/haptics';
import { formatRelativeTime } from '@/utils/relativeTime';
import { buildFeederSpeech } from '@/utils/speech';
import { openWhatsAppSupport } from '@/utils/support';

/** Tem o mínimo para o backend conseguir alimentar? */
function isConfigured(feeder: IFeeder): boolean {
  if (!feeder.initialDistributedWeight || feeder.initialDistributedWeight <= 0) return false;
  const check = validateFeedSchedule({
    startMinutes: isoToMinutes(feeder.startFeedTime),
    stopMinutes: isoToMinutes(feeder.stopFeedTime),
    feedIntervalMinutes: feeder.feedInterval,
    dailyGoalKg: feeder.initialDistributedWeight,
    kilogramsPerSecond: feeder.kilogramsPerSecond,
  });
  return !('error' in check);
}

export default function FeederDetail() {
  const router = useRouter();
  const { feederId } = useLocalSearchParams<{ feederId: string }>();
  const farmId = useAuthStore((s) => s.farmId);
  const isAdmin = useAuthStore(selectIsAdmin);
  const { feeders, logsByFeeder, isLoading, isRefreshing, lastUpdated, loadFarm, patchFeeder } =
    useFeederStore();
  const [isToggling, setIsToggling] = useState(false);

  const feeder = feeders.find((f) => f.id === feederId);
  const logs = feeder ? logsByFeeder[feeder.id] : undefined;

  const load = useCallback(
    (options?: { silent?: boolean; pull?: boolean }) => loadFarm(farmId, options),
    [loadFarm, farmId]
  );

  // Aberto direto (sem passar pela Início): carrega a fazenda.
  useEffect(() => {
    if (lastUpdated === null) load();
  }, [lastUpdated, load]);

  useAutoRefresh(() => load({ silent: true }));

  const back = { label: 'Início', onPress: () => router.back() };

  if (!feeder) {
    return (
      <Screen header={<AppHeader title="Alimentador" back={back} />} scroll={false}>
        {isLoading || lastUpdated === null ? (
          <View style={styles.section}>
            <Skeleton height={120} />
            <Skeleton height={56} />
            <Skeleton height={220} />
          </View>
        ) : (
          <EmptyState
            icon="help-circle-outline"
            title="Alimentador não encontrado"
            message="Ele pode ter sido removido. Volte para o início."
            action={{ label: 'Voltar ao início', icon: 'home', onPress: () => router.back() }}
          />
        )}
      </Screen>
    );
  }

  const today = getFeederToday(feeder, logs);
  const nextFeed = getNextFeed(feeder, logs);
  const remaining = getRemainingDoses(feeder, logs);
  const calibrationMissing = needsCalibration(feeder);
  const configured = isConfigured(feeder);
  const start = isoToMinutes(feeder.startFeedTime);
  const stop = isoToMinutes(feeder.stopFeedTime);
  const lastSeen = formatRelativeTime(feeder.lastSeenAt);

  const speech = () =>
    buildFeederSpeech({
      name: feeder.name,
      isActive: feeder.isActive,
      isOnline: feeder.isOnline,
      deliveredKg: today.deliveredKg,
      goalKg: today.goalKg,
      nextFeedMinutes: nextFeed?.minutes ?? null,
      nextFeedTomorrow: nextFeed?.tomorrow,
      needsCalibration: calibrationMissing,
    });

  function goToConfig() {
    router.push({ pathname: '/configurar', params: { feederId: feeder!.id } });
  }

  async function setActive(next: boolean) {
    if (next) haptics.turnOn();
    else haptics.turnOff();

    setIsToggling(true);
    patchFeeder(feeder!.id, { isActive: next }); // aparece na hora; desfaz se falhar
    try {
      await api.patch(`/feeders/${feeder!.id}`, { isActive: next });
    } catch (error: any) {
      console.error('Erro ao ligar/desligar:', error.response?.data || error.message);
      patchFeeder(feeder!.id, { isActive: !next });
      haptics.error();
      Alert.alert(
        next ? 'Não foi possível ligar' : 'Não foi possível desligar',
        'Verifique a internet do celular e tente de novo.'
      );
    } finally {
      setIsToggling(false);
    }
  }

  function handleToggle() {
    if (feeder!.isActive) {
      Alert.alert(
        'Desligar o alimentador?',
        'Os camarões deste viveiro não vão receber ração até você ligar de novo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Desligar', style: 'destructive', onPress: () => setActive(false) },
        ]
      );
      return;
    }
    if (!configured && !calibrationMissing) {
      Alert.alert(
        'Falta configurar',
        'Antes de ligar, diga quanta ração por dia, os horários e de quanto em quanto tempo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurar agora', onPress: goToConfig },
        ]
      );
      return;
    }
    setActive(true);
  }

  return (
    <Screen
      header={<AppHeader title={feeder.name} back={back} right={<SpeakButton text={speech} />} />}
      refreshing={isRefreshing}
      onRefresh={() => load({ pull: true })}
      footer={
        <BigButton
          title="Mudar configuração"
          icon="tune-variant"
          variant="secondary"
          large
          onPress={goToConfig}
        />
      }>
      <PowerToggle isOn={feeder.isActive} busy={isToggling} onPress={handleToggle} />

      {feeder.isOnline ? (
        <View style={styles.signalOk} accessible accessibilityLabel="Com sinal, funcionando agora">
          <Icon name="wifi" size={26} color={colors.primary} />
          <AppText variant="body" color={colors.primary} style={styles.bold}>
            Com sinal · funcionando agora
          </AppText>
        </View>
      ) : (
        <Banner
          icon="wifi-off"
          title={lastSeen ? `Sem sinal ${lastSeen}` : 'Sem sinal'}
          message="Veja se o alimentador está na tomada e se a internet da fazenda está funcionando."
        />
      )}

      {calibrationMissing && (
        <Banner
          title="Falta ajustar o motor"
          message="Este alimentador ainda não sabe quanta ração solta por segundo. Até isso ser ajustado, ele não vai alimentar."
          action={{
            label: 'Chamar o suporte',
            icon: 'whatsapp',
            onPress: () =>
              openWhatsAppSupport(
                `Olá, o ${feeder.name} precisa ajustar o motor (calibração). Podem me ajudar?`
              ),
          }}
        />
      )}

      {!configured && !calibrationMissing && (
        <Banner
          variant="info"
          icon="tune-variant"
          title="Falta configurar"
          message="Diga quanta ração por dia, os horários e de quanto em quanto tempo."
          action={{ label: 'Configurar agora', icon: 'arrow-right', onPress: goToConfig }}
        />
      )}

      <Card>
        <AppText variant="overline" color={colors.textMuted} accessibilityRole="header">
          HOJE
        </AppText>

        {today.goalKg !== null && (
          <View style={styles.todayRow}>
            <ProgressRing
              progress={today.progress ?? 0}
              accessibilityLabel={
                today.deliveredKg !== null
                  ? `Hoje: ${formatKg(today.deliveredKg)} de ${formatKg(today.goalKg)} quilos`
                  : `Meta de hoje: ${formatKg(today.goalKg)} quilos`
              }>
              <AppText variant="question" style={styles.ringNumber}>
                {today.deliveredKg !== null ? formatKg(today.deliveredKg) : '--'}
              </AppText>
              <AppText variant="label" color={colors.textMuted}>
                de {formatKg(today.goalKg)} kg
              </AppText>
            </ProgressRing>

            <View style={styles.todayInfo}>
              <View>
                <AppText variant="label" color={colors.textMuted}>
                  Próxima ração
                </AppText>
                <AppText variant="question">
                  {!feeder.isActive
                    ? 'Desligado'
                    : nextFeed
                      ? formatMinutes(nextFeed.minutes)
                      : '--:--'}
                </AppText>
                {nextFeed?.tomorrow && (
                  <AppText variant="label" color={colors.textMuted}>
                    amanhã
                  </AppText>
                )}
              </View>
              {feeder.isActive && remaining > 0 && (
                <View>
                  <AppText variant="label" color={colors.textMuted}>
                    Faltam hoje
                  </AppText>
                  <AppText variant="title">
                    {remaining} {remaining === 1 ? 'vez' : 'vezes'}
                  </AppText>
                </View>
              )}
            </View>
          </View>
        )}

        {logs ? (
          <DoseList logs={logs} />
        ) : (
          <AppText variant="bodyRegular" color={colors.textMuted}>
            Não foi possível ver as rações de hoje. Puxe a tela para baixo para tentar de novo.
          </AppText>
        )}
      </Card>

      <View style={styles.chips}>
        <ConfigChip
          icon="sack"
          label={
            feeder.initialDistributedWeight
              ? `${formatKg(feeder.initialDistributedWeight)} kg por dia`
              : 'Ração: falta configurar'
          }
        />
        <ConfigChip
          icon="clock-outline"
          label={
            start !== null && stop !== null
              ? `${formatMinutes(start)} até ${formatMinutes(stop)}`
              : 'Horário: falta configurar'
          }
        />
        <ConfigChip
          icon="history"
          label={
            feeder.feedInterval
              ? `a cada ${feeder.feedInterval} min`
              : 'Intervalo: falta configurar'
          }
        />
      </View>

      {isAdmin && <FeederTestPanel feeder={feeder} />}
    </Screen>
  );
}

function ConfigChip({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.chip} accessible accessibilityLabel={label}>
      <Icon name={icon} size={20} color={colors.textSecondary} />
      <AppText variant="label" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  signalOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  bold: {
    fontFamily: 'Nunito_800ExtraBold',
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  ringNumber: {
    fontSize: 34,
    lineHeight: 38,
  },
  todayInfo: {
    flex: 1,
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
