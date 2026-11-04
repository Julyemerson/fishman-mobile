import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { Tap } from './Tap';

import { colors, radius, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';

const DAY = 24 * 60;
const MINUTE_STEP = 15;

interface TimeStepperProps {
  /** Minutos desde a meia-noite. */
  value: number;
  onChange: (minutes: number) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const wrap = (m: number) => ((m % DAY) + DAY) % DAY;

/** Escolha de horário sem teclado: hora e minuto com setas grandes (minutos de 15 em 15). */
export function TimeStepper({ value, onChange }: TimeStepperProps) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  function change(next: number) {
    haptics.select();
    onChange(wrap(next));
  }

  // Minutos andam de 15 em 15, encaixando na grade (08:10 → 08:15 ou 08:00).
  const nextMinute = () => change(value - (minutes % MINUTE_STEP) + MINUTE_STEP);
  const prevMinute = () =>
    change(value - (minutes % MINUTE_STEP === 0 ? MINUTE_STEP : minutes % MINUTE_STEP));

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`${hours} horas e ${minutes} minutos`}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment') nextMinute();
        if (e.nativeEvent.actionName === 'decrement') prevMinute();
      }}>
      <Column
        value={pad(hours)}
        caption="hora"
        onUp={() => change(value + 60)}
        onDown={() => change(value - 60)}
        upLabel="Mais 1 hora"
        downLabel="Menos 1 hora"
      />
      <AppText variant="display" style={styles.colon}>
        :
      </AppText>
      <Column
        value={pad(minutes)}
        caption="minuto"
        onUp={nextMinute}
        onDown={prevMinute}
        upLabel="Mais 15 minutos"
        downLabel="Menos 15 minutos"
      />
    </View>
  );
}

function Column({
  value,
  caption,
  onUp,
  onDown,
  upLabel,
  downLabel,
}: {
  value: string;
  caption: string;
  onUp: () => void;
  onDown: () => void;
  upLabel: string;
  downLabel: string;
}) {
  return (
    <View style={styles.column}>
      <Arrow icon="chevron-up" label={upLabel} onPress={onUp} />
      <View style={styles.valueBox}>
        <AppText variant="display" style={styles.tabular}>
          {value}
        </AppText>
      </View>
      <Arrow icon="chevron-down" label={downLabel} onPress={onDown} />
      <AppText variant="label" color={colors.textMuted}>
        {caption}
      </AppText>
    </View>
  );
}

function Arrow({
  icon,
  label,
  onPress,
}: {
  icon: 'chevron-up' | 'chevron-down';
  label: string;
  onPress: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.arrow, pressed && styles.arrowPressed]}>
      <Icon name={icon} size={38} color={colors.primary} />
    </Tap>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  column: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  arrow: {
    width: 112,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowPressed: {
    backgroundColor: colors.primarySoft,
  },
  valueBox: {
    width: 112,
    height: 96,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  colon: {
    marginBottom: 30,
  },
});
