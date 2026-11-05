import {
  buildFarmSpeech,
  buildFeederSpeech,
  formatTimeSpoken,
  type FarmSpeechInput,
  type FeederSpeechInput,
} from './speech';

describe('formatTimeSpoken', () => {
  it.each([
    [840, '14 horas'],
    [870, '14 e 30'],
    [60, '1 hora'],
    [485, '8 e 5'],
  ])('%p → %p', (minutes, expected) => {
    expect(formatTimeSpoken(minutes)).toBe(expected);
  });
});

describe('buildFeederSpeech', () => {
  const base: FeederSpeechInput = {
    name: 'Alimentador 1',
    isActive: true,
    isOnline: true,
    deliveredKg: 22,
    goalKg: 40,
    nextFeedMinutes: 870,
  };

  it('fala estado, quanto comeu e a próxima ração', () => {
    expect(buildFeederSpeech(base)).toBe(
      'Alimentador 1 está ligado e com sinal. Hoje já comeu 22 de 40 quilos. A próxima ração é às 14 e 30.'
    );
  });

  it('avisa quando ainda não comeu', () => {
    expect(buildFeederSpeech({ ...base, deliveredKg: 0, nextFeedMinutes: null })).toBe(
      'Alimentador 1 está ligado e com sinal. Hoje ainda não comeu. A meta é 40 quilos.'
    );
  });

  it('usa vírgula decimal e singular de quilo', () => {
    expect(
      buildFeederSpeech({ ...base, deliveredKg: 0.25, goalKg: 1, nextFeedMinutes: null })
    ).toBe('Alimentador 1 está ligado e com sinal. Hoje já comeu 0,3 de 1 quilo.');
  });

  it('diz quando a próxima ração é amanhã', () => {
    expect(buildFeederSpeech({ ...base, nextFeedMinutes: 480, nextFeedTomorrow: true })).toContain(
      'A próxima ração é amanhã às 8 horas.'
    );
  });

  it('pula a quantidade quando não sabe o entregue ou não há meta', () => {
    expect(buildFeederSpeech({ ...base, deliveredKg: null })).not.toContain('comeu');
    expect(buildFeederSpeech({ ...base, goalKg: null })).not.toContain('comeu');
  });

  it('desligado e sem sinal: não fala da próxima ração e orienta o produtor', () => {
    expect(
      buildFeederSpeech({ ...base, isActive: false, isOnline: false, deliveredKg: null })
    ).toBe(
      'Alimentador 1 está desligado e sem sinal. Veja se o alimentador está na tomada e se a internet da fazenda está funcionando.'
    );
  });

  it('falta de calibração tem prioridade sobre o aviso de sinal', () => {
    const speech = buildFeederSpeech({ ...base, isOnline: false, needsCalibration: true });
    expect(speech).toContain('Atenção: falta ajustar o motor. Chame o suporte.');
    expect(speech).not.toContain('tomada');
  });
});

describe('buildFarmSpeech', () => {
  const base: FarmSpeechInput = {
    farmName: 'Fazenda Teste',
    feeders: [
      { name: 'Alimentador 1', isActive: true, isOnline: true, kilogramsPerSecond: 0.05 },
      { name: 'Alimentador 2', isActive: true, isOnline: false, kilogramsPerSecond: 0.05 },
      { name: 'Alimentador 3', isActive: false, isOnline: true, kilogramsPerSecond: null },
    ],
    deliveredKg: 31,
    goalKg: 60,
  };

  it('resume a fazenda', () => {
    expect(buildFarmSpeech(base)).toBe(
      'Fazenda Teste. 2 de 3 alimentadores estão ligados. Hoje os camarões já comeram 31 de 60 quilos. Atenção: Alimentador 2 está sem sinal.'
    );
  });

  it('sem alimentadores', () => {
    expect(buildFarmSpeech({ ...base, feeders: [] })).toBe(
      'Fazenda Teste. Nenhum alimentador cadastrado.'
    );
  });

  it('com um alimentador só, fala no singular', () => {
    expect(
      buildFarmSpeech({ ...base, feeders: [base.feeders[0]], deliveredKg: 0, goalKg: 0 })
    ).toBe('Fazenda Teste. O alimentador está ligado.');
  });

  it('omite o nome da fazenda vazio e avisa quando ainda não comeram', () => {
    expect(
      buildFarmSpeech({ ...base, farmName: '', feeders: [base.feeders[0]], deliveredKg: 0 })
    ).toBe('O alimentador está ligado. Hoje os camarões ainda não comeram.');
  });

  it('lista vários nomes com vírgula e "e"', () => {
    const feeders = ['A', 'B', 'C'].map((name) => ({
      name,
      isActive: true,
      isOnline: false,
      kilogramsPerSecond: 0.05,
    }));
    expect(buildFarmSpeech({ ...base, feeders })).toContain('Atenção: A, B e C estão sem sinal.');
  });

  it('avisa quem está ligado e com sinal mas sem calibração', () => {
    const feeders = ['A', 'B'].map((name) => ({
      name,
      isActive: true,
      isOnline: true,
      kilogramsPerSecond: null,
    }));
    expect(buildFarmSpeech({ ...base, feeders })).toContain('A e B precisam ajustar o motor.');
    expect(buildFarmSpeech({ ...base, feeders: [feeders[0]] })).toContain(
      'A precisa ajustar o motor.'
    );
  });
});
