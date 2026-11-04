import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

const logo = require('@/assets/logo_pintinho.webp');

/**
 * Tela de abertura enquanto a sessão e as fontes carregam.
 * Usa a fonte do sistema de propósito: a Nunito ainda pode não estar pronta aqui.
 */
export default function SplashScreen() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Abrindo o DR Pescados">
      <Image source={logo} style={styles.logo} />
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text} maxFontSizeMultiplier={1.5}>
        Abrindo…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: colors.background,
  },
  logo: {
    width: 160,
    height: 150,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
