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
    parts.push(`A próxima ração é às ${formatTimeSpoken(nextFeedMinutes)}.`);
  }

  if (needsCalibration) {
    parts.push('Atenção: falta ajustar o motor. Chame o suporte.');
  } else if (!isOnline) {
    parts.push('Veja se o alimentador está na tomada e se a internet da fazenda está funcionando.');
  }

  return parts.join(' ');
}
