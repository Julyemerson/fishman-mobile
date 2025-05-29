import { StyleSheet, TouchableOpacity, Text } from 'react-native';

type PondProps = {
  name: string;
};

export default function Pond({ name }: PondProps) {
  return (
    <TouchableOpacity style={styles.button}>
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
