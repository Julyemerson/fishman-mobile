import {
  getFeederToday,
  getNextFeed,
  getRemainingDoses,
  needsAttention,
  needsCalibration,
  sumDeliveredKg,
} from './feeding';

import type { FeedingStatus, IFeedingLog } from '@/types/feeder';

/** Um instante de hoje no relógio local (os testes rodam em America/Sao_Paulo). */
function today(hours: number, minutes = 0): Date {
  return new Date(2026, 10, 4, hours, minutes);
}

let nextId = 1;
function makeLog(status: FeedingStatus, overrides: Partial<IFeedingLog> = {}): IFeedingLog {
  return {
    id: String(nextId++),
    feederId: 'f1',
    doseKg: 1,
    durationSeconds: 20,
    message: null,
    status,
    triggeredAt: today(9).toISOString(),
    executedAt: null,
    ...overrides,
  };
}

// 08:00–17:00, uma dose a cada 60 min → 9 doses por dia.
const feeder = {
  isActive: true,
  startFeedTime: '1970-01-01T08:00:00.000Z',
  stopFeedTime: '1970-01-01T17:00:00.000Z',
  feedInterval: 60,
};

describe('sumDeliveredKg', () => {
  it('soma só as doses enviadas ou confirmadas', () => {
    const logs = [
      makeLog('CONFIRMED', { doseKg: 2 }),
      makeLog('SUCCESS', { doseKg: 3 }),
      makeLog('PENDING', { doseKg: 10 }),
      makeLog('FAILED', { doseKg: 10 }),
      makeLog('CANCELLED', { doseKg: 10 }),
    ];
    expect(sumDeliveredKg(logs)).toBe(5);
  });

  it('retorna 0 sem doses', () => {
    expect(sumDeliveredKg([])).toBe(0);
  });
});

describe('getFeederToday', () => {
  const logs = [makeLog('SUCCESS', { doseKg: 2 }), makeLog('CONFIRMED', { doseKg: 3 })];

  it('calcula entregue, meta e progresso', () => {
    expect(getFeederToday({ initialDistributedWeight: 10 }, logs)).toEqual({
      deliveredKg: 5,
      goalKg: 10,
      progress: 0.5,
    });
  });

  it('limita o progresso a 100%', () => {
    expect(getFeederToday({ initialDistributedWeight: 4 }, logs).progress).toBe(1);
  });

  it('sem doses carregadas, entregue e progresso ficam desconhecidos', () => {
    expect(getFeederToday({ initialDistributedWeight: 10 }, undefined)).toEqual({
      deliveredKg: null,
      goalKg: 10,
      progress: null,
    });
  });

  it.each([null, 0])('sem meta (%p), não há progresso', (goal) => {
    expect(getFeederToday({ initialDistributedWeight: goal }, logs)).toEqual({
      deliveredKg: 5,
      goalKg: null,
      progress: null,
    });
  });
});

describe('needsCalibration', () => {
  it.each([null, 0, -1])('precisa calibrar com vazão %p', (kps) => {
    expect(needsCalibration({ kilogramsPerSecond: kps })).toBe(true);
  });

  it('não precisa com vazão positiva', () => {
    expect(needsCalibration({ kilogramsPerSecond: 0.05 })).toBe(false);
  });
});

describe('needsAttention', () => {
  it.each([
    { isActive: true, isOnline: false, kilogramsPerSecond: 0.05, expected: true },
    { isActive: false, isOnline: false, kilogramsPerSecond: 0.05, expected: true },
    { isActive: true, isOnline: true, kilogramsPerSecond: null, expected: true },
    { isActive: false, isOnline: true, kilogramsPerSecond: null, expected: false },
    { isActive: true, isOnline: true, kilogramsPerSecond: 0.05, expected: false },
  ])('%o', ({ expected, ...f }) => {
    expect(needsAttention(f)).toBe(expected);
  });
});

describe('getNextFeed', () => {
  it('desligado não tem próxima ração', () => {
    expect(getNextFeed({ ...feeder, isActive: false }, [], today(10))).toBeNull();
  });

  it.each([
    { startFeedTime: null },
    { stopFeedTime: null },
    { feedInterval: null },
    { feedInterval: 0 },
    { stopFeedTime: '1970-01-01T08:00:00.000Z' },
  ])('sem horário válido não tem próxima ração (%o)', (changes) => {
    expect(getNextFeed({ ...feeder, ...changes }, [], today(10))).toBeNull();
  });

  it('antes da janela, sai no horário inicial de hoje', () => {
    expect(getNextFeed(feeder, [], today(7))).toEqual({ minutes: 480, tomorrow: false });
  });

  it.each([17, 20])('depois da janela (%ih), sai no horário inicial de amanhã', (hour) => {
    expect(getNextFeed(feeder, [], today(hour))).toEqual({ minutes: 480, tomorrow: true });
  });

  it.each([undefined, []])('sem dose hoje (%p), sai no próximo minuto', (logs) => {
    expect(getNextFeed(feeder, logs, today(10, 15))).toEqual({ minutes: 616, tomorrow: false });
  });

  it.each(['FAILED', 'PENDING'] as const)(
    'se a última ficou %s, sai no próximo minuto',
    (status) => {
      const logs = [makeLog(status, { triggeredAt: today(10).toISOString() })];
      expect(getNextFeed(feeder, logs, today(10, 15))).toEqual({ minutes: 616, tomorrow: false });
    }
  );

  it('no último minuto da janela, não passa do fim', () => {
    expect(getNextFeed(feeder, [], today(16, 59))).toEqual({ minutes: 1019, tomorrow: false });
  });

  it('sai um intervalo depois da última dose (a mais recente vem primeiro)', () => {
    const logs = [
      makeLog('SUCCESS', { triggeredAt: today(10).toISOString() }),
      makeLog('FAILED', { triggeredAt: today(9).toISOString() }),
    ];
    expect(getNextFeed(feeder, logs, today(10, 15))).toEqual({ minutes: 660, tomorrow: false });
  });

  it('se a dose está atrasada, mostra agora em vez de um horário que já passou', () => {
    const logs = [makeLog('CONFIRMED', { triggeredAt: today(10).toISOString() })];
    expect(getNextFeed(feeder, logs, today(11, 30))).toEqual({ minutes: 690, tomorrow: false });
  });

  it('se a próxima passaria do fim da janela, fica para amanhã', () => {
    const logs = [makeLog('SUCCESS', { triggeredAt: today(16, 30).toISOString() })];
    expect(getNextFeed(feeder, logs, today(16, 40))).toEqual({ minutes: 480, tomorrow: true });
  });
});

describe('getRemainingDoses', () => {
  it('desconta as doses que não falharam nem foram canceladas', () => {
    const logs = [
      makeLog('SUCCESS'),
      makeLog('CONFIRMED'),
      makeLog('PENDING'),
      makeLog('FAILED'),
      makeLog('CANCELLED'),
    ];
    expect(getRemainingDoses(feeder, logs, today(12))).toBe(6);
  });

  it('sem doses, faltam todas as planejadas', () => {
    expect(getRemainingDoses(feeder, undefined, today(7))).toBe(9);
  });

  it('nunca fica negativo', () => {
    const logs = Array.from({ length: 12 }, () => makeLog('SUCCESS'));
    expect(getRemainingDoses(feeder, logs, today(12))).toBe(0);
  });

  it('desligado ou depois da janela, não falta nenhuma', () => {
    expect(getRemainingDoses({ ...feeder, isActive: false }, [], today(12))).toBe(0);
    expect(getRemainingDoses(feeder, [], today(17))).toBe(0);
  });

  it('sem horário válido, não falta nenhuma', () => {
    expect(getRemainingDoses({ ...feeder, feedInterval: null }, [], today(12))).toBe(0);
  });
});
