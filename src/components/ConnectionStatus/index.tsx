import { StyleSheet, Text, View } from 'react-native';

import { formatRelativeTime } from '@/utils/relativeTime';

interface ConnectionStatusProps {
  isOnline: boolean;
  lastSeenAt: string | null;
  /** Versão de uma linha, para os cards da lista. */
  compact?: boolean;
}

export default function ConnectionStatus({ isOnline, lastSeenAt, compact }: ConnectionStatusProps) {
  const lastSeen = formatRelativeTime(lastSeenAt);
  const label = isOnline ? 'Online' : 'Offline';
  const detail = !isOnline && lastSeen ? `visto ${lastSeen}` : null;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Conexão: ${label}${detail ? `, ${detail}` : ''}`}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={[styles.text, compact && styles.textCompact]}>
        {label}
        {detail ? ` · ${detail}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: '#40A014',
  },
  dotOffline: {
    backgroundColor: '#8A8A8A',
  },
  text: {
    fontSize: 14,
    color: '#585858',
  },
  textCompact: {
    fontSize: 12,
  },
});
