import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Container } from '@/components/Container';
import PondsList from '@/components/PondsList';

export default function Ponds() {
  return (
    <Container>
      <View style={styles.container}>
        <PondsList />

        <View
          style={{
            justifyContent: 'center',
            alignContent: 'center',
            gap: 10,
          }}>
          <Text style={styles.supportText}>Está com algum problema? Fale com o nosso Suporte</Text>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Suporte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 10,
  },
  supportButton: {
    width: '100%',
    padding: 4,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#40A014',
    justifyContent: 'center',
  },
  supportButtonText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  supportText: {
    fontWeight: '400',
    fontSize: 14,
  },
});
