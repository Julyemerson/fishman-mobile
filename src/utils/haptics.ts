import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Vibração é um extra: nunca pode quebrar a ação (web, aparelho sem motor, etc.). */
function safe(run: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  run().catch(() => {});
}

export const haptics = {
  /** Toque comum em botão. */
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Mudar uma escolha (–/+, opções). */
  select: () => safe(() => Haptics.selectionAsync()),
  /** Ligar alimentador: vibração forte. */
  turnOn: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  /** Desligar alimentador: vibração média. */
  turnOff: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Salvou com sucesso. */
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
