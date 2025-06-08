import { Feather, Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import DistributionTime from '../DistributionTime';
import LedIndicator from '../LedIndicator';

import formatTime from '@/utils/formatTime';

//  {
//         "id": "cmbd5lcvz0001wsi76n5w71qx",
//         "name": "Alimentador 2",
//         "isActive": 1,
//         "description": "Alimentador 2 do Tanque 1",
//         "url": "https://cecil.com",
//         "port": 8082,
//         "pondId": 1,
//         "startFeedTime": "1970-01-01T15:12:00.000Z",
//         "stopFeedTime": "1970-01-01T16:18:00.000Z",
//         "initialDistributedWeight": 30,
//         "feedInterval": 30,
//     },

export default function Feeder() {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.headerText}>
        <Text>Alimentador 1</Text>
        <View style={styles.iconContainer}>
          <Feather name="edit" size={15} color="#585858" />
          <Text style={styles.iconText}>Editar</Text>
        </View>
      </View>
      <View style={styles.separator} />
      <View style={styles.detailsContainer}>
        <LedIndicator isActive={2} />
        <View style={styles.iconContainer}>
          <Ionicons name="scale-outline" size={20} color="#585858" />
          <Text style={styles.iconText}>40kg</Text>
        </View>
        <DistributionTime
          initialTime="1970-01-01T15:12:00.000Z"
          finalTime="1970-01-01T16:18:00.000Z"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d9d9d9',
    height: 88,
    width: '100%',
    borderRadius: 10,
    justifyContent: 'space-evenly',
    padding: 16,
    gap: 10,
  },
  headerText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
