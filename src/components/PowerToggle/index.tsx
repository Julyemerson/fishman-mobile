import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

interface PowerToggleProps {
  isOn: boolean;
  busy?: boolean;
  onPress: () => void;
}

/** Botão enorme de ligar/desligar: o estado mais importante da tela. */
export function PowerToggle({ isOn, busy, onPress }: PowerToggleProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn, busy }}
      accessibilityLabel={isOn ? 'Alimentador ligado' : 'Alimentador desligado'}
      accessibilityHint={isOn ? 'Toque para desligar' : 'Toque para ligar'}
      style={({ pressed }) => [
        styles.base,
        isOn ? styles.on : styles.off,
        pressed && (isOn ? styles.onPressed : styles.offPressed),
      ]}>
      <View style={[styles.circle, isOn ? styles.circleOn : styles.circleOff]}>
        {busy ? (
          <ActivityIndicator size="large" color={isOn ? colors.primary : colors.onOff} />
        ) : (
          <Icon name="power" size={44} color={isOn ? colors.primary : colors.onOff} />
        )}
      </View>
      <View style={styles.texts}>
        <AppText
          variant="display"
          color={isOn ? colors.onPrimary : colors.onOff}
          style={styles.state}>
          {isOn ? 'LIGADO' : 'DESLIGADO'}
        </AppText>
        <AppText variant="body" color={isOn ? colors.onPrimaryMuted : colors.primary}>
          {busy ? 'Aguarde…' : isOn ? 'Toque para desligar' : 'Toque para ligar'}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  on: {
    backgroundColor: colors.primary,
  },
  onPressed: {
    backgroundColor: colors.primaryPressed,
  },
  off: {
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  offPressed: {
    backgroundColor: colors.primarySoft,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOn: {
    backgroundColor: colors.surface,
  },
  circleOff: {
    backgroundColor: colors.off,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  state: {
    fontSize: 32,
    lineHeight: 38,
  },
});
