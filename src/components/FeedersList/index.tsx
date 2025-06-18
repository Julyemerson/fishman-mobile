import { View, StyleSheet, FlatList } from 'react-native';

import Feeder from '../Feeder';

import { IFeeder } from '@/types/feeder';

interface FeedersListProps {
  feeders: IFeeder[];
  onPress: (feederId: string) => void;
}

export default function FeedersList({ feeders, onPress }: FeedersListProps) {
  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={feeders}
        renderItem={({ item }) => <Feeder feeder={item} onPress={onPress} key={item.id} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingVertical: 30,
  },
  separator: {
    height: 20,
  },
});
