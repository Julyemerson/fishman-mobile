import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { Tap } from './Tap';

import { colors, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  /** Texto abaixo do número ("quilos"). */
  unit: string;
  /** Usado pelo leitor de tela ("quilo" → "Mais 1 quilo"). */
  unitSingular?: string;
  format?: (value: number) => string;
}

/** Ajuste de número sem teclado: – valor +. */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  unit,
  unitSingular = unit,
  format = String,
}: StepperProps) {
  const canDec = value - step >= min;
  const canInc = value + step <= max;
  const stepLabel = `${step} ${step === 1 ? unitSingular : unit}`;

  function change(next: number) {
    haptics.select();
    onChange(Math.min(max, Math.max(min, next)));
  }

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`${format(value)} ${unit}`}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment' && canInc) change(value + step);
        if (e.nativeEvent.actionName === 'decrement' && canDec) change(value - step);
      }}>
      <Tap
        onPress={() => change(value - step)}
        disabled={!canDec}
        accessibilityLabel={`Menos ${stepLabel}`}
        hitSlop={8}
        style={({ pressed }) => [
          styles.button,
          styles.dec,
          pressed && { backgroundColor: colors.primarySoft },
          !canDec && styles.disabled,
        ]}>
        <Icon name="minus" size={38} color={colors.primary} />
      </Tap>

      <View style={styles.valueBox}>
        <AppText variant="display" align="center" style={styles.tabular}>
          {format(value)}
        </AppText>
        <AppText variant="title" color={colors.textMuted} align="center">
          {unit}
        </AppText>
      </View>

      <Tap
        onPress={() => change(value + step)}
        disabled={!canInc}
        accessibilityLabel={`Mais ${stepLabel}`}
        hitSlop={8}
        style={({ pressed }) => [
          styles.button,
          styles.inc,
          pressed && { backgroundColor: colors.primaryPressed },
          !canInc && styles.disabled,
        ]}>
        <Icon name="plus" size={38} color={colors.onPrimary} />
      </Tap>
    </View>
  );
}

const SIZE = 76;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dec: {
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inc: {
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.35,
  },
  valueBox: {
    minWidth: 140,
    alignItems: 'center',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
