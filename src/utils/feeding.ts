import { IFeedingLog } from '@/types/feeder';

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
