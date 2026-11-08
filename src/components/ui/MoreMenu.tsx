import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { Icon, IconName } from './Icon';
import { Tap } from './Tap';

import { colors, radius, spacing, touch } from '@/theme';
import { haptics } from '@/utils/haptics';

export interface MoreMenuItem {
  label: string;
  icon: IconName;
  onPress: () => void;
  destructive?: boolean;
}

/**
 * Menu "⋮" do cabeçalho: ações secundárias (ajuda, sair) fora do caminho
 * principal, para não competir com o que o produtor usa todo dia.
 */
export function MoreMenu({ items }: { items: MoreMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tap
        onPress={() => {
          haptics.tap();
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Mais opções"
        hitSlop={8}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
        <Icon name="dots-vertical" size={28} color={colors.textSecondary} />
      </Tap>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Fechar menu">
          {/* Absorve toques no próprio menu (só o fundo fecha). */}
          <View
            style={[styles.menu, { top: insets.top + spacing.xxl * 2 }]}
            accessibilityRole="menu"
            onStartShouldSetResponder={() => true}>
            {items.map((item, index) => (
              <Tap
                key={item.label}
                onPress={() => {
                  setOpen(false);
                  item.onPress();
                }}
                accessibilityRole="menuitem"
                accessibilityLabel={item.label}
                style={({ pressed }) => [
                  styles.item,
                  index > 0 && styles.itemDivider,
                  pressed && styles.itemPressed,
                ]}>
                <Icon
                  name={item.icon}
                  size={24}
                  color={item.destructive ? colors.error : colors.textSecondary}
                />
                <AppText variant="body" color={item.destructive ? colors.error : colors.text}>
                  {item.label}
                </AppText>
              </Tap>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  menu: {
    position: 'absolute',
    right: spacing.md,
    minWidth: 240,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  item: {
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemPressed: {
    backgroundColor: colors.primarySoft,
  },
});
