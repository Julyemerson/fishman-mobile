import { Feather, Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ConnectionStatus from '../ConnectionStatus';
import DistributionTime from '../DistributionTime';
import LedIndicator from '../LedIndicator';

import { IFeeder } from '@/types/feeder';

interface FeederProps {
  feeder: IFeeder;
  onPress: (feederId: string) => void;
}

export default function Feeder({ feeder, onPress }: FeederProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerText}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{feeder.name}</Text>
          <ConnectionStatus isOnline={feeder.isOnline} lastSeenAt={feeder.lastSeenAt} compact />
        </View>
        <TouchableOpacity style={styles.iconContainer} onPress={() => onPress(feeder.id)}>
          <Feather name="edit" size={15} color="#585858" />
          <Text style={styles.iconText}>Editar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
      <View style={styles.detailsContainer}>
        <LedIndicator isActive={feeder.isActive} />
        <View style={styles.iconContainer}>
          <Ionicons name="scale-outline" size={20} color="#585858" />
          <Text style={styles.iconText}>{feeder.initialDistributedWeight ?? '--'} kg</Text>
        </View>
        <DistributionTime initialTime={feeder.startFeedTime} finalTime={feeder.stopFeedTime} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d9d9d9',
    minHeight: 88,
    width: '100%',
    borderRadius: 10,
    justifyContent: 'space-evenly',
    padding: 16,
    gap: 10,
  },
  headerText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexShrink: 1,
    gap: 2,
  },
  titleText: {
    fontWeight: '600',
  },
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
  separator: {
    borderTopWidth: 2,
    borderColor: '#ccc',
    width: '100%',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
});
