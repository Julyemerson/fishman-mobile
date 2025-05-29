import { StyleSheet, View } from 'react-native';

import Pond from '../Pond';

export default function PondsList() {
  return (
    <View style={style.container}>
      <Pond name="viveiro 1" />
      <Pond name="viveiro 2" />
      <Pond name="viveiro 3" />
      <Pond name="viveiro 4" />
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    gap: 20,
    justifyContent: 'center',
    alignContent: 'center',
  },
});
