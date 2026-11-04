import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, radius, spacing, touch } from '@/theme';
import { haptics } from '@/utils/haptics';

export interface ChoiceOption<T> {
  value: T;
  label: string;
  /** Segunda linha menor ("minutos"). Com ela os botões ficam altos. */
  sublabel?: string;
  /** Texto completo para o leitor de tela ("30 minutos"). */
  accessibilityLabel?: string;
}

interface ChoiceChipsProps<T> {
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: number;
}

/** Opções prontas para tocar, no lugar de digitar. */
export function ChoiceChips<T extends string | number>({
  options,
  value,
  onChange,
  columns = 4,
}: ChoiceChipsProps<T>) {
  const basis = `${100 / columns - 4}%` as const;

  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        const fg = selected ? colors.onPrimary : colors.text;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => {
              haptics.select();
              onChange(option.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            style={({ pressed }) => [
              styles.chip,
              { flexBasis: basis, minHeight: option.sublabel ? 92 : touch.min },
              selected ? styles.selected : styles.unselected,
              pressed && !selected && { backgroundColor: colors.primarySoft },
            ]}>
            <AppText
              variant={option.sublabel ? 'question' : 'body'}
              color={fg}
              align="center"
              style={!option.sublabel && styles.boldLabel}>
              {option.label}
            </AppText>
            {option.sublabel && (
              <AppText
                variant="label"
                color={selected ? colors.onPrimaryMuted : colors.textMuted}
                align="center">
                {option.sublabel}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  chip: {
    flexGrow: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  selected: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  boldLabel: {
    fontFamily: 'Nunito_800ExtraBold',
  },
});
