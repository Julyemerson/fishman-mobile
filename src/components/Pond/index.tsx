import { StyleSheet, TouchableOpacity, Text } from 'react-native';

interface PondProps {
  id: number;
  name: string;
  onPress: (pondId: number) => void;
}

export default function Pond({ id, name, onPress }: PondProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={() => onPress(id)}>
      <Text style={styles.PondsName}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 64,
    width: '100%',
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  PondsName: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#1E1E1E',
  },
});
