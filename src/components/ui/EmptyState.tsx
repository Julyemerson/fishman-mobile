import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { BigButton } from './BigButton';
import { Icon, IconName } from './Icon';

import { colors, spacing } from '@/theme';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void; icon?: IconName };
}

/** Tela/área sem conteúdo ou com erro: desenho grande, frase curta e o que fazer. */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={72} color={colors.textSecondary} />
      </View>
      <AppText variant="question" align="center">
        {title}
      </AppText>
      {message && (
        <AppText variant="bodyRegular" color={colors.textSecondary} align="center">
          {message}
        </AppText>
      )}
      {action && (
        <BigButton
          title={action.label}
          icon={action.icon}
          onPress={action.onPress}
          large
          style={styles.action}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.off,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    alignSelf: 'stretch',
  },
});
