import { Feather } from '@expo/vector-icons';
import { Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

import { Container } from '@/components/Container';

export default function ConfigModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <Container>
        <TouchableOpacity onPress={onClose} style={styles.settingsCloseIcon}>
          <Feather name="x" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.settingsTitle}>Configurações</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text>Mudar Tema</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsButton}>
          <Text>Sobre o App</Text>
        </TouchableOpacity>
      </Container>
    </Modal>
  );
}

const styles = StyleSheet.create({
  settingsPage: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  settingsCloseIcon: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingsButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
});
