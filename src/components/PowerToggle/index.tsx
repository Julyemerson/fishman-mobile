import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { Tap } from '@/components/ui/Tap';
import { colors, radius, spacing } from '@/theme';

interface PowerToggleProps {
  isOn: boolean;
  busy?: boolean;
  onPress: () => void;
}

/** Ligar/desligar: o estado mais importante da tela, sem ocupar metade dela. */
export function PowerToggle({ isOn, busy, onPress }: PowerToggleProps) {
  return (
    <Tap
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
          <Icon name="power" size={30} color={isOn ? colors.primary : colors.onOff} />
        )}
      </View>
      <View style={styles.texts}>
        <AppText
          variant="title"
          color={isOn ? colors.onPrimary : colors.onOff}
          style={styles.state}>
          {isOn ? 'LIGADO' : 'DESLIGADO'}
        </AppText>
        <AppText variant="label" color={isOn ? colors.onPrimaryMuted : colors.primary}>
          {busy ? 'Aguarde…' : isOn ? 'Toque para desligar' : 'Toque para ligar'}
        </AppText>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
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
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 24,
    lineHeight: 30,
  },
});
