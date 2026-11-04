import { StyleSheet, Text, View } from 'react-native';

import { FeedingStatus, IFeedingLog } from '@/types/feeder';
import { formatClockTime } from '@/utils/relativeTime';

const STATUS_LABEL: Record<FeedingStatus, { text: string; color: string; background: string }> = {
  PENDING: { text: 'Pendente', color: '#5C3D00', background: '#FFF4D6' },
  SUCCESS: { text: 'Enviada', color: '#0B4F8A', background: '#E3F0FB' },
  CONFIRMED: { text: 'Confirmada', color: '#1F5E0A', background: '#E5F5DC' },
  FAILED: { text: 'Falhou', color: '#8E1B1B', background: '#FBE3E3' },
  CANCELLED: { text: 'Cancelada', color: '#4A4A4A', background: '#EDEDED' },
};

interface FeedingLogListProps {
  logs: IFeedingLog[];
}

export default function FeedingLogList({ logs }: FeedingLogListProps) {
  if (logs.length === 0) {
    return <Text style={styles.empty}>Nenhuma alimentação registrada hoje.</Text>;
  }

  const delivered = logs
    .filter((log) => log.status === 'CONFIRMED' || log.status === 'SUCCESS')
    .reduce((total, log) => total + log.doseKg, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.summary}>
        {logs.length} {logs.length === 1 ? 'dose' : 'doses'} · {delivered.toFixed(2)} kg enviados
      </Text>
      {logs.map((log) => {
        const status = STATUS_LABEL[log.status] ?? STATUS_LABEL.PENDING;
        return (
          <View key={log.id} style={styles.row}>
            <Text style={styles.time}>{formatClockTime(log.triggeredAt)}</Text>
            <Text style={styles.dose}>{log.doseKg.toFixed(2)} kg</Text>
            <View style={[styles.badge, { backgroundColor: status.background }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  empty: {
    fontSize: 14,
    color: '#585858',
  },
  summary: {
    fontSize: 14,
    color: '#585858',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
    gap: 12,
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dose: {
    flex: 1,
    fontSize: 14,
    color: '#585858',
    fontVariant: ['tabular-nums'],
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
