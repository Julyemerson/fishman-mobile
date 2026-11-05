import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { AppText, BigButton, Card, Icon, IconName } from '@/components/ui';
import { FeederTestState, runFeederTest, TEST_DURATION_SECONDS } from '@/services/feederTest';
import { colors, radius, spacing } from '@/theme';
import { IFeeder } from '@/types/feeder';
import { haptics } from '@/utils/haptics';

type StepStatus = 'idle' | 'running' | 'done' | 'error';

const STEP_ICON: Record<Exclude<StepStatus, 'running'>, { icon: IconName; color: string }> = {
  idle: { icon: 'circle-outline', color: colors.borderStrong },
  done: { icon: 'check-circle', color: colors.primary },
  error: { icon: 'close-circle', color: colors.error },
};

function Step({ status, label }: { status: StepStatus; label: string }) {
  return (
    <View style={styles.step} accessible accessibilityLabel={label}>
      {status === 'running' ? (
        <ActivityIndicator color={colors.primary} style={styles.stepIcon} />
      ) : (
        <Icon name={STEP_ICON[status].icon} size={24} color={STEP_ICON[status].color} />
      )}
      <AppText
        variant="label"
        color={status === 'idle' ? colors.textMuted : colors.text}
        style={styles.stepLabel}>
        {label}
      </AppText>
    </View>
  );
}

function steps(state: FeederTestState | null): { sent: StepStatus; ack: StepStatus } {
  switch (state?.phase) {
    case 'sending':
      return { sent: 'running', ack: 'idle' };
    case 'waiting-ack':
      return { sent: 'done', ack: 'running' };
    case 'confirmed':
      return { sent: 'done', ack: 'done' };
    case 'timeout':
      return { sent: 'done', ack: 'error' };
    case 'failed':
      return { sent: state.logId ? 'done' : 'error', ack: state.logId ? 'error' : 'idle' };
    default:
      return { sent: 'idle', ack: 'idle' };
  }
}

/**
 * Ferramenta de desenvolvedor (só aparece para admin): dispara uma dose curta
 * e mostra cada etapa do fluxo até o equipamento confirmar.
 * A dose de teste não conta nas rações do dia nem mexe no horário.
 */
export function FeederTestPanel({ feeder }: { feeder: IFeeder }) {
  const [state, setState] = useState<FeederTestState | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const running = state?.phase === 'sending' || state?.phase === 'waiting-ack';
  const { sent, ack } = steps(state);

  async function start() {
    const result = await runFeederTest(feeder.id, {
      onUpdate: setState,
      isCancelled: () => !mounted.current,
    });
    if (!mounted.current) return;
    if (result.phase === 'confirmed') haptics.turnOn();
    else haptics.error();
  }

  function confirmStart() {
    Alert.alert(
      'Testar o alimentador?',
      `O motor vai ligar por ${TEST_DURATION_SECONDS} segundos, mesmo fora do horário. Isso não conta nas rações do dia.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Testar', onPress: start },
      ]
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Icon name="flask-outline" size={22} color={colors.textSecondary} />
        <AppText variant="overline" color={colors.textSecondary} accessibilityRole="header">
          MODO DESENVOLVEDOR
        </AppText>
      </View>
      <AppText variant="bodyRegular" color={colors.textSecondary}>
        Testa o fluxo completo: servidor → broker → equipamento liga o motor por{' '}
        {TEST_DURATION_SECONDS} s → confirma.
      </AppText>

      {state && (
        <View style={styles.steps}>
          <Step status={sent} label="Comando enviado ao equipamento" />
          <Step
            status={ack}
            label={
              state.phase === 'confirmed'
                ? `Equipamento confirmou em ${((state.elapsedMs ?? 0) / 1000).toFixed(1)} s`
                : 'Equipamento liga o motor e confirma'
            }
          />
        </View>
      )}

      {state?.phase === 'failed' && (
        <AppText variant="label" color={colors.onErrorSoft}>
          {state.error}
        </AppText>
      )}
      {state?.phase === 'timeout' && (
        <AppText variant="label" color={colors.onErrorSoft}>
          O comando saiu, mas o equipamento não confirmou. Veja no serial do ESP32 se ele recebeu o
          comando ou se já estava alimentando.
        </AppText>
      )}
      {state?.logId && (
        <AppText variant="label" color={colors.textMuted} selectable>
          logId: {state.logId}
        </AppText>
      )}

      <BigButton
        title={running ? 'Testando…' : state ? 'Testar de novo' : 'Testar fluxo agora'}
        icon="play-circle-outline"
        variant="secondary"
        loading={running}
        disabled={running || !feeder.isOnline}
        accessibilityHint={feeder.isOnline ? undefined : 'O equipamento está sem sinal'}
        onPress={confirmStart}
      />
      {!feeder.isOnline && (
        <AppText variant="label" color={colors.textMuted}>
          Equipamento sem sinal: o teste só funciona com ele online.
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  steps: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepIcon: {
    width: 24,
  },
  stepLabel: {
    flex: 1,
  },
});
