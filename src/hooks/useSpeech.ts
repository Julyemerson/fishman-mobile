import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Fala em português, um pouco mais devagar que o normal. Para ao sair da tela. */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mounted = useRef(true);

  const done = useCallback(() => {
    if (mounted.current) setIsSpeaking(false);
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    done();
  }, [done]);

  const speak = useCallback(
    (text: string) => {
      Speech.stop();
      setIsSpeaking(true);
      Speech.speak(text, {
        language: 'pt-BR',
        rate: 0.9,
        onDone: done,
        onStopped: done,
        onError: done,
      });
    },
    [done]
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      Speech.stop();
    };
  }, []);

  useFocusEffect(useCallback(() => stop, [stop]));

  return { speak, stop, isSpeaking };
}
