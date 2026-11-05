import { isAxiosError } from 'axios';

import api from '@/services/api';
import { IFeedingLog } from '@/types/feeder';

/** Quanto tempo o motor fica ligado no teste. */
export const TEST_DURATION_SECONDS = 3;
/** Prazo para o ACK chegar depois que o motor desliga. */
const ACK_GRACE_MS = 20_000;

export type FeederTestPhase = 'sending' | 'waiting-ack' | 'confirmed' | 'failed' | 'timeout';

export interface FeederTestState {
  phase: FeederTestPhase;
  logId?: string;
  /** Do disparo até o equipamento confirmar. */
  elapsedMs?: number;
  error?: string;
}

interface RunOptions {
  onUpdate: (state: FeederTestState) => void;
  /** Para de acompanhar (ex.: saiu da tela). */
  isCancelled?: () => boolean;
  durationSeconds?: number;
  pollMs?: number;
  ackGraceMs?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'Sem conexão com o servidor.';
    const message = error.response.data?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(' ');
    return `Erro ${error.response.status} do servidor.`;
  }
  return 'Erro inesperado.';
}

/**
 * Teste ponta a ponta de um alimentador (só admin):
 * app → API → broker MQTT → equipamento liga o motor → ACK → confirmado.
 * Avisa cada etapa por `onUpdate` e devolve o estado final.
 */
export async function runFeederTest(
  feederId: string,
  {
    onUpdate,
    isCancelled = () => false,
    durationSeconds = TEST_DURATION_SECONDS,
    pollMs = 1000,
    ackGraceMs = ACK_GRACE_MS,
  }: RunOptions
): Promise<FeederTestState> {
  const finish = (state: FeederTestState) => {
    if (!isCancelled()) onUpdate(state);
    return state;
  };

  onUpdate({ phase: 'sending' });
  const startedAt = Date.now();

  let logId: string;
  try {
    const { data } = await api.post<{ logId: string }>(`/feeders/${feederId}/test`, {
      durationSeconds,
    });
    logId = data.logId;
  } catch (error) {
    return finish({ phase: 'failed', error: errorMessage(error) });
  }

  finish({ phase: 'waiting-ack', logId });
  const deadline = startedAt + durationSeconds * 1000 + ackGraceMs;

  while (!isCancelled()) {
    await sleep(pollMs);
    if (isCancelled()) break;

    try {
      const { data } = await api.get<IFeedingLog>(`/feeders/${feederId}/test/${logId}`);
      if (data.status === 'CONFIRMED') {
        return finish({ phase: 'confirmed', logId, elapsedMs: Date.now() - startedAt });
      }
      if (data.status === 'FAILED') {
        return finish({
          phase: 'failed',
          logId,
          error: data.message ?? 'O servidor não conseguiu enviar o comando.',
        });
      }
    } catch {
      // falha pontual de rede: tenta de novo até o prazo
    }

    if (Date.now() >= deadline) {
      return finish({ phase: 'timeout', logId });
    }
  }

  return { phase: 'timeout', logId };
}
