import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, BigButton, Icon, IconName } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import { FeedingStatus, IFeedingLog } from '@/types/feeder';
import { formatKg } from '@/utils/format';
import { formatClockTime } from '@/utils/relativeTime';

const STATUS: Record<
  FeedingStatus,
  { label: string; icon: IconName; circle: string; text: string; row: string }
> = {
  CONFIRMED: {
    label: 'Comeu',
    icon: 'check-bold',
    circle: colors.primary,
    text: colors.primary,
    row: colors.background,
  },
  SUCCESS: {
    label: 'Enviada',
    icon: 'send',
    circle: colors.primary,
    text: colors.primary,
    row: colors.background,
  },
  PENDING: {
    label: 'Aguardando',
    icon: 'clock-outline',
    circle: colors.textMuted,
    text: colors.textMuted,
    row: colors.background,
  },
  FAILED: {
    label: 'Não saiu',
    icon: 'close-thick',
    circle: colors.error,
    text: colors.onErrorSoft,
    row: colors.errorSoft,
  },
  UNCONFIRMED: {
    label: 'Sem resposta',
    icon: 'help',
    circle: colors.warningBorder,
    text: colors.onWarning,
    row: colors.warning,
  },
  CANCELLED: {
    label: 'Cancelada',
    icon: 'minus',
    circle: colors.textMuted,
    text: colors.textMuted,
    row: colors.background,
  },
};

const VISIBLE = 4;

/** Doses de hoje, mais recentes primeiro: hora, quantidade e o que aconteceu. */
export function DoseList({ logs }: { logs: IFeedingLog[] }) {
  const [showAll, setShowAll] = useState(false);

  if (logs.length === 0) {
    return (
      <AppText variant="bodyRegular" color={colors.textMuted}>
        Nenhuma ração saiu hoje ainda.
      </AppText>
    );
  }

  const visible = showAll ? logs : logs.slice(0, VISIBLE);

  return (
    <View style={styles.list}>
      {visible.map((log) => {
        const s = STATUS[log.status] ?? STATUS.PENDING;
        const time = formatClockTime(log.triggeredAt);
        return (
          <View
            key={log.id}
            style={[styles.row, { backgroundColor: s.row }]}
            accessible
            accessibilityLabel={`${time}, ${formatKg(log.doseKg)} quilos, ${s.label}`}>
            <View style={[styles.circle, { backgroundColor: s.circle }]}>
              <Icon name={s.icon} size={18} color={colors.onPrimary} />
            </View>
            <AppText variant="title" style={styles.time}>
              {time}
            </AppText>
            <AppText variant="bodyRegular" style={styles.flex}>
              {formatKg(log.doseKg)} kg
            </AppText>
            <AppText variant="label" color={s.text} style={styles.status}>
              {s.label}
            </AppText>
          </View>
        );
      })}
      {logs.length > VISIBLE && (
        <BigButton
          variant="ghost"
          title={showAll ? 'Mostrar menos' : `Ver todas (${logs.length})`}
          icon={showAll ? 'chevron-up' : 'chevron-down'}
          onPress={() => setShowAll(!showAll)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontFamily: 'Nunito_900Black',
    fontVariant: ['tabular-nums'],
  },
  flex: {
    flex: 1,
  },
  status: {
    fontFamily: 'Nunito_800ExtraBold',
  },
});
