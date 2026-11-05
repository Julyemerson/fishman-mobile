export interface IFeeder {
  id: string;
  name: string;
  isActive: boolean;
  description: string | null;

  /** Conectividade reportada pelo ESP32 via MQTT (LWT/retained em feeder/<id>/status). */
  isOnline: boolean;
  lastSeenAt: string | null;

  url: string | null;
  port: number | null;
  pondId: number;
  engineModelId: number | null;

  /** Horários (colunas TIME, ver src/utils/feedTime.ts). */
  startFeedTime: string | null;
  stopFeedTime: string | null;

  /** Intervalo entre doses, em minutos. */
  feedInterval: number | null;
  /** Meta diária de ração, em kg. */
  initialDistributedWeight: number | null;
  /** Vazão calibrada do alimentador (kg/s). Sem ela o backend não alimenta. */
  kilogramsPerSecond: number | null;

  createdAt: string;
  updatedAt: string;
}

/**
 * PENDING → SUCCESS (enviada, aguardando o equipamento) → CONFIRMED (o equipamento confirmou).
 * UNCONFIRMED: enviada e reenviada, mas o equipamento nunca respondeu — não se sabe se a
 * ração saiu. O backend não repete a dose (para não dar em dobro) e segue o horário normal.
 */
export type FeedingStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'UNCONFIRMED';

export interface IFeedingLog {
  id: string;
  feederId: string;
  doseKg: number;
  durationSeconds: number;
  message: string | null;
  status: FeedingStatus;
  triggeredAt: string;
  executedAt: string | null;
  /** Quantas vezes o comando foi enviado ao equipamento (reenvios sem resposta). */
  attempts?: number;
  lastAttemptAt?: string | null;
}
