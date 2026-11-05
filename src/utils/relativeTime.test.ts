import { formatClockTime, formatRelativeTime } from './relativeTime';

describe('formatRelativeTime', () => {
  const now = new Date('2026-11-04T12:00:00.000Z');
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

  it.each([null, undefined, '', 'não é data'])('retorna null para %p', (value) => {
    expect(formatRelativeTime(value, now)).toBeNull();
  });

  it.each([
    [0, 'agora'],
    [0.5, 'agora'],
    [-5, 'agora'], // relógio do aparelho atrasado em relação ao servidor
    [1, 'há 1 minuto'],
    [5, 'há 5 minutos'],
    [59, 'há 59 minutos'],
    [60, 'há 1 hora'],
    [150, 'há 2 horas'],
    [23 * 60 + 59, 'há 23 horas'],
    [24 * 60, 'há 1 dia'],
    [3 * 24 * 60, 'há 3 dias'],
  ])('%p minutos atrás → %p', (minutes, expected) => {
    expect(formatRelativeTime(ago(minutes), now)).toBe(expected);
  });
});

describe('formatClockTime', () => {
  it('mostra a hora no fuso do aparelho', () => {
    // 17:30 UTC = 14:30 em America/Sao_Paulo.
    expect(formatClockTime('2026-11-04T17:30:00.000Z')).toBe('14:30');
    expect(formatClockTime('2026-11-04T11:05:00.000Z')).toBe('08:05');
  });
});
