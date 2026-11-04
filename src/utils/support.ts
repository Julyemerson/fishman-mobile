import { Alert, Linking } from 'react-native';

const SUPPORT_PHONE = process.env.EXPO_PUBLIC_SUPPORT_PHONE_NUMBER || '';
const DEFAULT_MESSAGE = 'Olá, estou com um problema no aplicativo DR Pescados. Poderiam me ajudar?';

/** Abre o WhatsApp do suporte com uma mensagem pronta. */
export async function openWhatsAppSupport(message = DEFAULT_MESSAGE) {
  if (!SUPPORT_PHONE) {
    Alert.alert('Suporte', 'O número do suporte não está configurado no aplicativo.');
    return;
  }

  const url = `whatsapp://send?phone=${SUPPORT_PHONE}&text=${encodeURIComponent(message)}`;
  try {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return;
    }
    // Sem o app do WhatsApp: tenta pelo navegador.
    await Linking.openURL(`https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`);
  } catch (err) {
    console.error('Erro ao abrir o WhatsApp:', err);
    Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
  }
}
