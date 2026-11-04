import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

import { colors, radius, spacing, touch } from '@/theme';
import { haptics } from '@/utils/haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface BigButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  /** Botão de ação principal da tela (64px). Os demais têm 56px. */
  large?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<Variant, { bg: string; pressed: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary },
  secondary: {
    bg: colors.surface,
    pressed: colors.primarySoft,
    fg: colors.primary,
    border: colors.primary,
  },
  ghost: { bg: 'transparent', pressed: colors.off, fg: colors.textMuted },
  danger: { bg: colors.error, pressed: colors.onErrorSoft, fg: colors.onPrimary },
};

export function BigButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  large = false,
  accessibilityHint,
  style,
}: BigButtonProps) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;

  function handlePress() {
    haptics.tap();
    onPress();
  }

  const iconContent = loading ? (
    <ActivityIndicator color={v.fg} />
  ) : icon ? (
    <Icon name={icon} size={26} color={v.fg} />
  ) : null;
  // Espaço via margem, não `gap`: com `gap` o Android mede o texto mais estreito do que
  // desenha e esconde a última palavra numa segunda linha.
  const iconEl = iconContent && (
    <View style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}>{iconContent}</View>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: large ? touch.primary : touch.min,
          backgroundColor: pressed ? v.pressed : v.bg,
        },
        v.border && { borderWidth: 2, borderColor: v.border },
        isDisabled && styles.disabled,
        style,
      ]}>
      <View style={[styles.content, iconPosition === 'right' && styles.contentReverse]}>
        {iconEl}
        <AppText variant="button" color={v.fg} align="center" style={styles.label}>
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  contentReverse: {
    flexDirection: 'row-reverse',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    flexShrink: 1,
  },
});
