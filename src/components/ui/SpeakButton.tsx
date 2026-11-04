import { HeaderButton } from './AppHeader';

import { useSpeech } from '@/hooks/useSpeech';

interface SpeakButtonProps {
  /** Texto a ser lido. Função para montar com os dados mais recentes no momento do toque. */
  text: string | (() => string);
}

/** Botão "Ouvir": lê o estado da tela em voz alta. Tocar de novo para de falar. */
export function SpeakButton({ text }: SpeakButtonProps) {
  const { speak, stop, isSpeaking } = useSpeech();

  return (
    <HeaderButton
      label={isSpeaking ? 'Parar' : 'Ouvir'}
      icon={isSpeaking ? 'stop' : 'volume-high'}
      active={isSpeaking}
      onPress={() => (isSpeaking ? stop() : speak(typeof text === 'function' ? text() : text))}
    />
  );
}
