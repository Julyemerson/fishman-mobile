import { FlatList, StyleSheet, View } from 'react-native';

import Pond from '../Pond';

import IPond from '@/types/pond';

interface PondListProps {
  ponds: IPond[];
  onPress: (pondId: number) => void;
}

export default function PondsList({ ponds, onPress }: PondListProps) {
  return (
    <View style={style.container}>
      <FlatList
        contentContainerStyle={style.listContent}
        data={ponds}
        renderItem={({ item }) => (
          <Pond onPress={onPress} id={item.id} name={item.name} key={item.id} />
        )}
        ItemSeparatorComponent={() => <View style={style.separator} />}
      />
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  listContent: {
    paddingVertical: 30,
  },
  separator: {
    height: 20,
  },
});
