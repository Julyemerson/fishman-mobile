import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

import { Container } from '@/components/Container';

export default function FeederDetail() {
  const { feederId } = useLocalSearchParams();
  return (
    <Container>
      <View>
        <Text>Feeder Detail</Text>
        <Text>{feederId}</Text>
      </View>
    </Container>
  );
}
