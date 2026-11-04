import type { IFeedingLog } from '@/types/feeder';
import { isoToMinutes } from '@/utils/feedTime';

/** kg que saíram hoje: doses enviadas ao equipamento ou confirmadas por ele. */
export function sumDeliveredKg(logs: IFeedingLog[]): number {
  return logs
    .filter((log) => log.status === 'CONFIRMED' || log.status === 'SUCCESS')
    .reduce((total, log) => total + log.doseKg, 0);
}

export interface FeederToday {
  /** kg que saíram hoje (null = não foi possível carregar as doses). */
  deliveredKg: number | null;
  /** Meta diária em kg (null = não configurada). */
  goalKg: number | null;
  /** 0 a 1, ou null quando não dá para calcular. */
  progress: number | null;
}

export function getFeederToday(
  feeder: { initialDistributedWeight: number | null },
  logs: IFeedingLog[] | undefined
): FeederToday {
  const deliveredKg = logs ? sumDeliveredKg(logs) : null;
  const goalKg = feeder.initialDistributedWeight || null;
  const progress = deliveredKg !== null && goalKg ? Math.min(1, deliveredKg / goalKg) : null;
  return { deliveredKg, goalKg, progress };
}

/** O backend não alimenta sem a vazão calibrada (kg/s). */
export function needsCalibration(feeder: { kilogramsPerSecond: number | null }): boolean {
  return !feeder.kilogramsPerSecond || feeder.kilogramsPerSecond <= 0;
}

/** Algo que o produtor precisa resolver: sem sinal, ou ligado mas sem calibração. */
export function needsAttention(feeder: {
  isActive: boolean;
  isOnline: boolean;
  kilogramsPerSecond: number | null;
}): boolean {
  return !feeder.isOnline || (feeder.isActive && needsCalibration(feeder));
}

export interface NextFeed {
  /** Minutos desde a meia-noite. */
  minutes: number;
  /** A próxima ração só amanhã (janela de hoje já acabou). */
  tomorrow: boolean;
}

interface ScheduleFeeder {
  isActive: boolean;
  startFeedTime: string | null;
  stopFeedTime: string | null;
  feedInterval: number | null;
}

function minutesOfDayLocal(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function scheduleOf(feeder: ScheduleFeeder) {
  const start = isoToMinutes(feeder.startFeedTime);
  const stop = isoToMinutes(feeder.stopFeedTime);
  const interval = feeder.feedInterval;
  if (start === null || stop === null || !interval || stop <= start) return null;
  return { start, stop, interval };
}

/**
 * Quando sai a próxima ração, seguindo a regra do cron do backend (isDoseDue):
 * dentro da janela, a dose sai `interval` minutos depois da última; se a última
 * falhou ou ficou pendente (ou ainda não houve dose hoje), sai no próximo minuto.
 * Usa o relógio do aparelho, que está no mesmo fuso da fazenda.
 */
export function getNextFeed(
  feeder: ScheduleFeeder,
  logsToday: IFeedingLog[] | undefined,
  now = new Date()
): NextFeed | null {
  const schedule = scheduleOf(feeder);
  if (!feeder.isActive || !schedule) return null;
  const { start, stop, interval } = schedule;
  const nowMin = minutesOfDayLocal(now);

  if (nowMin < start) return { minutes: start, tomorrow: false };
  if (nowMin >= stop) return { minutes: start, tomorrow: true };

  const last = logsToday?.[0]; // a API devolve as mais recentes primeiro
  if (!last || last.status === 'FAILED' || last.status === 'PENDING') {
    return { minutes: Math.min(nowMin + 1, stop - 1), tomorrow: false };
  }

  const next = minutesOfDayLocal(new Date(last.triggeredAt)) + interval;
  if (next >= stop) return { minutes: start, tomorrow: true };
  return { minutes: Math.max(next, nowMin), tomorrow: false };
}

/** Quantas doses ainda faltam hoje (0 fora da janela ou desligado). */
export function getRemainingDoses(
  feeder: ScheduleFeeder,
  logsToday: IFeedingLog[] | undefined,
  now = new Date()
): number {
  const schedule = scheduleOf(feeder);
  if (!feeder.isActive || !schedule) return 0;
  if (minutesOfDayLocal(now) >= schedule.stop) return 0;
  const planned = Math.floor((schedule.stop - schedule.start) / schedule.interval);
  const done = (logsToday ?? []).filter(
    (l) => l.status !== 'FAILED' && l.status !== 'CANCELLED'
  ).length;
  return Math.max(0, planned - done);
}
