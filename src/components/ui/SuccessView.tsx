import { ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { BigButton } from './BigButton';
import { Icon } from './Icon';

import { colors, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';

interface SuccessViewProps {
  title?: string;
  message: string;
  /** Resumo do que foi salvo. */
  children?: ReactNode;
  action: { label: string; onPress: () => void };
}

/** Confirmação de sucesso: fundo neutro, ✓ grande e vibração ao aparecer. */
export function SuccessView({ title = 'Salvo!', message, children, action }: SuccessViewProps) {
  useEffect(() => {
    haptics.success();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.body} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <View style={styles.halo}>
          <View style={styles.circle}>
            <Icon name="check-bold" size={84} color={colors.onPrimary} />
          </View>
        </View>
        <AppText variant="display" align="center" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} align="center">
          {message}
        </AppText>
        {children}
      </View>
      <BigButton title={action.label} icon="home" onPress={action.onPress} large />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  halo: {
    padding: 18,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.sm,
  },
  circle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 44,
    lineHeight: 50,
  },
});
