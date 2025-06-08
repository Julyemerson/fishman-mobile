import { Fontisto } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

interface LedIndicatorProps {
  isActive: number;
}

//1 Inativo
//2 Ativo

export default function LedIndicator({ isActive }: LedIndicatorProps) {
  return (
    <>
      {isActive === 2 ? (
        <View style={styles.ledContainer}>
          <Fontisto name="record" size={18} color="#40A014" />
          <Text>ATIVO</Text>
        </View>
      ) : (
        <View style={styles.ledContainer}>
          <Fontisto name="record" size={18} color="#A30707" />
          <Text>INATIVO</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  ledContainer: {
    flexDirection: 'row',
    gap: 5,
  },
});
