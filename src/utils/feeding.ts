import { IFeedingLog } from '@/types/feeder';

/** kg que saíram hoje: doses enviadas ao equipamento ou confirmadas por ele. */
export function sumDeliveredKg(logs: IFeedingLog[]): number {
  return logs
    .filter((log) => log.status === 'CONFIRMED' || log.status === 'SUCCESS')
    .reduce((total, log) => total + log.doseKg, 0);
}
