import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const AUTO_REFRESH_MS = 30_000;

/**
 * Chama `refresh` a cada `intervalMs` enquanto a tela está aberta e o app em primeiro plano.
 * Ao voltar para o app, atualiza na hora. Nunca dispara uma atualização por cima de outra.
 */
export function useAutoRefresh(refresh: () => unknown, intervalMs = AUTO_REFRESH_MS) {
  const refreshRef = useRef(refresh);
  const inFlight = useRef(false);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const run = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await refreshRef.current();
    } finally {
      inFlight.current = false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setInterval> | null = null;
      const start = () => {
        if (!timer) timer = setInterval(run, intervalMs);
      };
      const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };

      if (AppState.currentState === 'active') start();
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          run();
          start();
        } else {
          stop();
        }
      });

      return () => {
        stop();
        sub.remove();
      };
    }, [run, intervalMs])
  );
}
