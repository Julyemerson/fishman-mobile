import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Container } from '@/components/Container';
import PondsList from '@/components/PondsList';

const data = [
  {
    id: 1,
    name: 'Viveiro 1',
    farmId: 1,
  },
  {
    id: 2,
    name: 'Viveiro 2',
    farmId: 1,
  },
  {
    id: 3,
    name: 'Viveiro 3',
    farmId: 1,
  },
];

export default function Ponds() {
  return (
    <Container>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerPrimaryText}>Viveiros</Text>
          <Text style={styles.headerSecondaryText}>Clique para selecionar o Viveiro</Text>
        </View>

        <PondsList Ponds={data} />

        <View style={styles.listContainer}>
          <View>
            <Text style={styles.supportText}>Está com algum problema?</Text>
            <Text style={styles.supportText}>Fale com o nosso suporte</Text>
          </View>
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
  listContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    gap: 10,
    margin: 10,
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
    textAlign: 'center',
  },
  headerContainer: {
    marginTop: 10,
    padding: 5,
    gap: 5,
  },
  headerPrimaryText: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  headerSecondaryText: {
    fontWeight: '400',
    fontSize: 16,
  },
});
