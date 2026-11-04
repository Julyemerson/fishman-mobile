import { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { Tap } from './Tap';

import { colors, radius, spacing, touch } from '@/theme';
import { haptics } from '@/utils/haptics';

const logo = require('@/assets/logo_pintinho.webp');

interface AppHeaderProps {
  title: string;
  /** Botão voltar com texto. */
  back?: { label?: string; onPress: () => void };
  /** Mostra a logo antes do título (tela inicial). */
  showLogo?: boolean;
  right?: ReactNode;
}

export function AppHeader({ title, back, showLogo, right }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {back && (
          <Tap
            onPress={() => {
              haptics.tap();
              back.onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={back.label ?? 'Voltar'}
            hitSlop={8}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <Icon name="chevron-left" size={32} color={colors.primary} />
            <AppText variant="body" color={colors.primary} style={styles.backText}>
              {back.label ?? 'Voltar'}
            </AppText>
          </Tap>
        )}
        {showLogo && <Image source={logo} style={styles.logo} accessibilityIgnoresInvertColors />}
      </View>

      <AppText
        variant="title"
        numberOfLines={1}
        accessibilityRole="header"
        style={[styles.title, !back && styles.titleLeft]}>
        {title}
      </AppText>

      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

/** Botão pequeno do cabeçalho (Sair, Ouvir): ícone + palavra, 48px. */
export function HeaderButton({
  label,
  icon,
  onPress,
  active,
}: {
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Tap
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.headerButton,
        active && styles.headerButtonActive,
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={22} color={active ? colors.onPrimary : colors.textSecondary} />
      <AppText variant="label" color={active ? colors.onPrimary : colors.textSecondary}>
        {label}
      </AppText>
    </Tap>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  titleLeft: {
    textAlign: 'left',
  },
  back: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    borderRadius: radius.sm,
  },
  backText: {
    fontFamily: 'Nunito_800ExtraBold',
  },
  logo: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  headerButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  headerButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});

export const HEADER_TOUCH = touch.min;
