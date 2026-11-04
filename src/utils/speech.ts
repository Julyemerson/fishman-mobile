/** Textos para leitura em voz alta: frases curtas, números por extenso quando ajuda. */

function formatKgSpoken(kg: number): string {
  const rounded = Math.round(kg * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');
  return `${text} ${rounded === 1 ? 'quilo' : 'quilos'}`;
}

/** 840 → "14 horas", 870 → "14 e 30", 60 → "1 hora". */
export function formatTimeSpoken(minutesOfDay: number): string {
  const h = Math.floor(minutesOfDay / 60);
  const m = minutesOfDay % 60;
  if (m === 0) return `${h} ${h === 1 ? 'hora' : 'horas'}`;
  return `${h} e ${m}`;
}

export interface FeederSpeechInput {
  name: string;
  isActive: boolean;
  isOnline: boolean;
  /** kg distribuídos hoje (null = desconhecido). */
  deliveredKg: number | null;
  /** Meta diária em kg. */
  goalKg: number | null;
  /** Próxima dose, em minutos desde a meia-noite. */
  nextFeedMinutes?: number | null;
  /** A próxima dose é só amanhã. */
  nextFeedTomorrow?: boolean;
  /** Falta calibração (kg/s). */
  needsCalibration?: boolean;
}

/** "Alimentador 1 está ligado e com sinal. Hoje já comeu 22 de 40 quilos. A próxima ração é às 14 e 30." */
export function buildFeederSpeech({
  name,
  isActive,
  isOnline,
  deliveredKg,
  goalKg,
  nextFeedMinutes,
  nextFeedTomorrow,
  needsCalibration,
}: FeederSpeechInput): string {
  const parts: string[] = [];

  const state = isActive ? 'ligado' : 'desligado';
  parts.push(`${name} está ${state} e ${isOnline ? 'com sinal' : 'sem sinal'}.`);

  if (deliveredKg !== null && goalKg) {
    parts.push(
      deliveredKg > 0
        ? `Hoje já comeu ${formatKgSpoken(deliveredKg).replace(/ quilos?$/, '')} de ${formatKgSpoken(goalKg)}.`
        : `Hoje ainda não comeu. A meta é ${formatKgSpoken(goalKg)}.`
    );
  }

  if (isActive && nextFeedMinutes != null) {
    parts.push(
      `A próxima ração é ${nextFeedTomorrow ? 'amanhã ' : ''}às ${formatTimeSpoken(nextFeedMinutes)}.`
    );
  }

  if (needsCalibration) {
    parts.push('Atenção: falta ajustar o motor. Chame o suporte.');
  } else if (!isOnline) {
    parts.push('Veja se o alimentador está na tomada e se a internet da fazenda está funcionando.');
  }

  return parts.join(' ');
}

export interface FarmSpeechInput {
  farmName: string;
  feeders: {
    name: string;
    isActive: boolean;
    isOnline: boolean;
    kilogramsPerSecond: number | null;
  }[];
  deliveredKg: number;
  goalKg: number;
}

/** "Fazenda Teste. 2 de 3 alimentadores estão ligados. Hoje os peixes já comeram 31 de 60 quilos. Atenção: Alimentador 2 está sem sinal." */
export function buildFarmSpeech({
  farmName,
  feeders,
  deliveredKg,
  goalKg,
}: FarmSpeechInput): string {
  const parts: string[] = [];
  if (farmName) parts.push(`${farmName}.`);

  const total = feeders.length;
  const on = feeders.filter((f) => f.isActive).length;
  if (total === 0) {
    parts.push('Nenhum alimentador cadastrado.');
    return parts.join(' ');
  }
  parts.push(
    total === 1
      ? `O alimentador está ${on ? 'ligado' : 'desligado'}.`
      : `${on} de ${total} alimentadores estão ligados.`
  );

  if (goalKg > 0) {
    parts.push(
      deliveredKg > 0
        ? `Hoje os peixes já comeram ${formatKgSpoken(deliveredKg).replace(/ quilos?$/, '')} de ${formatKgSpoken(goalKg)}.`
        : 'Hoje os peixes ainda não comeram.'
    );
  }

  const offline = feeders.filter((f) => !f.isOnline).map((f) => f.name);
  const uncalibrated = feeders
    .filter((f) => f.isOnline && f.isActive && (!f.kilogramsPerSecond || f.kilogramsPerSecond <= 0))
    .map((f) => f.name);
  if (offline.length) {
    parts.push(
      `Atenção: ${joinNames(offline)} ${offline.length === 1 ? 'está' : 'estão'} sem sinal.`
    );
  }
  if (uncalibrated.length) {
    parts.push(
      `${joinNames(uncalibrated)} ${uncalibrated.length === 1 ? 'precisa' : 'precisam'} ajustar o motor.`
    );
  }

  return parts.join(' ');
}

function joinNames(names: string[]): string {
  return names.length <= 1
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`;
}
