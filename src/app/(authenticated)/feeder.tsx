import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

export default function Feeder() {
  const { pondId } = useLocalSearchParams();
  const router = useRouter();

  function handlePressBackButton() {
    router.back();
  }

  return (
    <>
      <Container>
        <View style={styles.container}>
          <Text>feeder {pondId}</Text>
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
