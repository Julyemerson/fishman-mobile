import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { BigButton } from './BigButton';
import { Icon, IconName } from './Icon';

import { colors, radius, spacing } from '@/theme';

type Variant = 'warning' | 'error' | 'info';

const VARIANTS: Record<Variant, { bg: string; border: string; fg: string; icon: IconName }> = {
  warning: {
    bg: colors.warning,
    border: colors.warningBorder,
    fg: colors.onWarning,
    icon: 'alert',
  },
  error: {
    bg: colors.errorSoft,
    border: colors.error,
    fg: colors.onErrorSoft,
    icon: 'close-circle',
  },
  info: { bg: colors.primarySoft, border: colors.primary, fg: colors.primary, icon: 'information' },
};

interface BannerProps {
  variant?: Variant;
  title: string;
  message?: string;
  icon?: IconName;
  action?: { label: string; onPress: () => void; icon?: IconName };
}

/** Aviso destacado: título curto em negrito + explicação em linguagem simples. */
export function Banner({ variant = 'warning', title, message, icon, action }: BannerProps) {
  const v = VARIANTS[variant];
  return (
    <View
      style={[styles.banner, { backgroundColor: v.bg, borderColor: v.border }]}
      accessibilityRole={variant === 'error' ? 'alert' : 'summary'}>
      <View style={styles.titleRow}>
        <Icon name={icon ?? v.icon} size={28} color={v.fg} />
        <AppText variant="title" color={v.fg} style={styles.flex}>
          {title}
        </AppText>
      </View>
      {message && (
        <AppText variant="bodyRegular" color={v.fg}>
          {message}
        </AppText>
      )}
      {action && <BigButton title={action.label} icon={action.icon} onPress={action.onPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
