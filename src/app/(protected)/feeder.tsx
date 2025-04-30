import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

export default function Feeder() {
  const router = useRouter();

  return (
    <>
      <Container>
        <Stack.Screen options={{ title: 'Feeder', headerShown: false }} />
        <View style={styles.container}>
          <Text>feeder</Text>
        </View>
        <Button title="Feeder" onPress={() => router.navigate('/')} />
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
