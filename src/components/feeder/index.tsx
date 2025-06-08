import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
//         "createdAt": "2025-06-01T04:21:10.645Z",
//         "updatedAt": "2025-06-06T19:02:49.080Z"
//     },

export default function Feeder() {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.headerText}>
        <Text>Alimentador 1</Text>
        <View>
          <Feather name="edit" size={15} color="#585858" />
          <Text>Editar</Text>
        </View>
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
    padding: 16,
  },
  headerText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
