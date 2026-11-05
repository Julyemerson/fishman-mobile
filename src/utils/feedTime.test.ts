import {
  formatMinutes,
  isoToMinutes,
  minutesToIso,
  minutesToPickerDate,
  pickerDateToMinutes,
  validateFeedSchedule,
  type FeedScheduleInput,
} from './feedTime';

describe('isoToMinutes', () => {
  it('lê o horário em UTC, não no fuso do aparelho', () => {
    // Em America/Sao_Paulo isso seria 05:00 local; a coluna TIME significa 08:00.
    expect(isoToMinutes('1970-01-01T08:00:00.000Z')).toBe(480);
    expect(isoToMinutes('1970-01-01T23:59:00.000Z')).toBe(1439);
  });

  it.each([null, undefined, '', 'não é data'])('retorna null para %p', (value) => {
    expect(isoToMinutes(value)).toBeNull();
  });
});

describe('minutesToIso', () => {
  it('gera a data ancorada em 1970-01-01 UTC', () => {
    expect(minutesToIso(480)).toBe('1970-01-01T08:00:00.000Z');
    expect(minutesToIso(870)).toBe('1970-01-01T14:30:00.000Z');
  });

  it.each([0, 1, 480, 870, 1439])('ida e volta com isoToMinutes (%i)', (minutes) => {
    expect(isoToMinutes(minutesToIso(minutes))).toBe(minutes);
  });
});

describe('formatMinutes', () => {
  it('formata em HH:mm', () => {
    expect(formatMinutes(0)).toBe('00:00');
    expect(formatMinutes(65)).toBe('01:05');
    expect(formatMinutes(1439)).toBe('23:59');
  });

  it('mostra --:-- sem horário', () => {
    expect(formatMinutes(null)).toBe('--:--');
  });
});

describe('seletor de horário', () => {
  it('converte minutos para um Date local', () => {
    const date = minutesToPickerDate(870);
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
    expect(date.getSeconds()).toBe(0);
  });

  it('usa meia-noite quando não há horário', () => {
    const date = minutesToPickerDate(null);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  it('converte o Date local de volta para minutos', () => {
    expect(pickerDateToMinutes(new Date(2026, 10, 4, 14, 30))).toBe(870);
    expect(pickerDateToMinutes(minutesToPickerDate(425))).toBe(425);
  });
});

describe('validateFeedSchedule', () => {
  // 08:00–17:00 (540 min), dose a cada 60 min → 9 doses de 5 kg, 100 s de motor cada.
  const valid: FeedScheduleInput = {
    startMinutes: 480,
    stopMinutes: 1020,
    feedIntervalMinutes: 60,
    dailyGoalKg: 45,
    kilogramsPerSecond: 0.05,
  };

  it('calcula o plano de doses de uma configuração válida', () => {
    expect(validateFeedSchedule(valid)).toEqual({
      plan: { numberOfDoses: 9, doseKg: 5, motorOnSeconds: 100 },
    });
  });

  it('arredonda o número de doses para baixo', () => {
    // 30 min de janela, intervalo de 20 → só cabe 1 dose.
    const result = validateFeedSchedule({ ...valid, stopMinutes: 510, feedIntervalMinutes: 20 });
    expect(result).toEqual({ plan: { numberOfDoses: 1, doseKg: 45, motorOnSeconds: 900 } });
  });

  it.each([
    { startMinutes: null, stopMinutes: 1020 },
    { startMinutes: 480, stopMinutes: null },
  ])('exige os dois horários (%o)', (times) => {
    expect(validateFeedSchedule({ ...valid, ...times })).toEqual({
      error: 'Defina o horário inicial e o horário final.',
    });
  });

  it.each([480, 300])('recusa horário final que não é depois do inicial (%i)', (stop) => {
    expect(validateFeedSchedule({ ...valid, stopMinutes: stop })).toEqual({
      error: 'O horário final deve ser depois do horário inicial.',
    });
  });

  it.each([null, 0, -10])('exige intervalo positivo (%p)', (interval) => {
    expect(validateFeedSchedule({ ...valid, feedIntervalMinutes: interval })).toEqual({
      error: 'Informe o intervalo entre doses, em minutos.',
    });
  });

  it('recusa intervalo maior que a janela', () => {
    expect(validateFeedSchedule({ ...valid, feedIntervalMinutes: 600 })).toEqual({
      error: 'O intervalo (600 min) é maior que a janela de funcionamento (540 min).',
    });
  });

  it.each([null, 0])('sem meta diária (%p), só calcula o número de doses', (goal) => {
    expect(validateFeedSchedule({ ...valid, dailyGoalKg: goal })).toEqual({
      plan: { numberOfDoses: 9, doseKg: null, motorOnSeconds: null },
    });
  });

  it.each([null, 0])('sem vazão calibrada (%p), não calcula o tempo de motor', (kps) => {
    expect(validateFeedSchedule({ ...valid, kilogramsPerSecond: kps })).toEqual({
      plan: { numberOfDoses: 9, doseKg: 5, motorOnSeconds: null },
    });
  });

  it('recusa dose que levaria mais tempo que o intervalo', () => {
    // 5 kg a 0,001 kg/s = 5000 s ≈ 84 min, mais que os 60 min de intervalo.
    expect(validateFeedSchedule({ ...valid, kilogramsPerSecond: 0.001 })).toEqual({
      error:
        'Cada dose levaria 84 min para ser distribuída, mais que o intervalo de 60 min. Diminua a quantidade ou aumente o intervalo.',
    });
  });

  it('aceita dose que ocupa exatamente o intervalo', () => {
    // 2 doses de 30 kg a 0,5 kg/s = 60 s = intervalo de 1 min.
    const result = validateFeedSchedule({
      startMinutes: 0,
      stopMinutes: 2,
      feedIntervalMinutes: 1,
      dailyGoalKg: 60,
      kilogramsPerSecond: 0.5,
    });
    expect(result).toEqual({ plan: { numberOfDoses: 2, doseKg: 30, motorOnSeconds: 60 } });
  });
});
