import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import Feeder from '@/components/feeder';

export default function Feeders() {
  const { pondId } = useLocalSearchParams();
  const router = useRouter();

  function handlePressBackButton() {
    router.back();
  }

  return (
    <>
      <Container>
        <View style={styles.container}>
          <Feeder />
          <Text>{pondId}</Text>
        </View>
        <Button title="Feeder" onPress={() => router.navigate('/')} />
        <Button title="Voltar" onPress={handlePressBackButton} />
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
