import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

import { colors, radius, spacing } from '@/theme';

export type PillVariant = 'on' | 'off' | 'ok' | 'warning' | 'error';

const VARIANTS: Record<PillVariant, { bg: string; fg: string; bold: boolean }> = {
  on: { bg: colors.primary, fg: colors.onPrimary, bold: true },
  off: { bg: colors.off, fg: colors.onOff, bold: true },
  ok: { bg: colors.primarySoft, fg: colors.primary, bold: false },
  warning: { bg: colors.warning, fg: colors.onWarning, bold: false },
  error: { bg: colors.errorSoft, fg: colors.onErrorSoft, bold: false },
};

interface StatusPillProps {
  variant: PillVariant;
  label: string;
  icon: IconName;
}

/** Estado sempre com ícone + palavra: nunca só cor. */
export function StatusPill({ variant, label, icon }: StatusPillProps) {
  const v = VARIANTS[variant];
  return (
    <View style={[styles.pill, { backgroundColor: v.bg }]} accessible accessibilityLabel={label}>
      <Icon name={icon} size={18} color={v.fg} />
      <AppText variant="label" color={v.fg} style={v.bold && styles.bold}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  bold: {
    fontFamily: 'Nunito_800ExtraBold',
  },
});
