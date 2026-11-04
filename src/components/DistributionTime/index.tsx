import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import { formatMinutes, isoToMinutes } from '@/utils/feedTime';

interface DistributionTimeProps {
  initialTime: string | null;
  finalTime: string | null;
}

export default function DistributionTime({ initialTime, finalTime }: DistributionTimeProps) {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name="time-outline" size={20} color="#585858" />
      <Text style={styles.iconText}>
        {formatMinutes(isoToMinutes(initialTime))} - {formatMinutes(isoToMinutes(finalTime))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 5,
  },
  iconText: {
    color: '#585858',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
