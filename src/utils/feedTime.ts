/**
 * Horários de alimentação.
 *
 * A API guarda `startFeedTime`/`stopFeedTime` em colunas Postgres `TIME` (sem fuso)
 * e as devolve como data ISO ancorada em 1970-01-01 UTC, ex.: "1970-01-01T08:00:00.000Z"
 * = 08:00 no horário da fazenda. Por isso lemos e escrevemos sempre os campos UTC,
 * nunca os locais do aparelho.
 */

/** Minutos desde a meia-noite (0–1439). */
export type MinutesOfDay = number;

export function isoToMinutes(iso: string | null | undefined): MinutesOfDay | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function minutesToIso(minutes: MinutesOfDay): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return new Date(Date.UTC(1970, 0, 1, hours, mins)).toISOString();
}

export function formatMinutes(minutes: MinutesOfDay | null): string {
  if (minutes === null) return '--:--';
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
}

/** Converte para um Date local, que é o que o seletor de horário exibe. */
export function minutesToPickerDate(minutes: MinutesOfDay | null): Date {
  const date = new Date();
  date.setHours(
    minutes !== null ? Math.floor(minutes / 60) : 0,
    minutes !== null ? minutes % 60 : 0,
    0,
    0
  );
  return date;
}

export function pickerDateToMinutes(date: Date): MinutesOfDay {
  return date.getHours() * 60 + date.getMinutes();
}

export interface FeedScheduleInput {
  startMinutes: MinutesOfDay | null;
  stopMinutes: MinutesOfDay | null;
  feedIntervalMinutes: number | null;
  dailyGoalKg: number | null;
  kilogramsPerSecond: number | null;
}

export interface FeedSchedulePlan {
  numberOfDoses: number;
  doseKg: number | null;
  motorOnSeconds: number | null;
}

/**
 * Espelha a validação de `calculateFeedPhysics` do backend, para avisar o usuário antes
 * de salvar uma configuração que o cron recusaria silenciosamente na hora de alimentar.
 * Retorna a mensagem de erro, ou o plano de doses quando a configuração é válida.
 */
export function validateFeedSchedule({
  startMinutes,
  stopMinutes,
  feedIntervalMinutes,
  dailyGoalKg,
  kilogramsPerSecond,
}: FeedScheduleInput): { error: string } | { plan: FeedSchedulePlan } {
  if (startMinutes === null || stopMinutes === null) {
    return { error: 'Defina o horário inicial e o horário final.' };
  }

  const windowMinutes = stopMinutes - startMinutes;
  if (windowMinutes <= 0) {
    return { error: 'O horário final deve ser depois do horário inicial.' };
  }

  if (!feedIntervalMinutes || feedIntervalMinutes <= 0) {
    return { error: 'Informe o intervalo entre doses, em minutos.' };
  }

  const numberOfDoses = Math.floor(windowMinutes / feedIntervalMinutes);
  if (numberOfDoses === 0) {
    return {
      error: `O intervalo (${feedIntervalMinutes} min) é maior que a janela de funcionamento (${windowMinutes} min).`,
    };
  }

  if (!dailyGoalKg || dailyGoalKg <= 0) {
    return { plan: { numberOfDoses, doseKg: null, motorOnSeconds: null } };
  }

  const doseKg = dailyGoalKg / numberOfDoses;

  if (!kilogramsPerSecond || kilogramsPerSecond <= 0) {
    return { plan: { numberOfDoses, doseKg, motorOnSeconds: null } };
  }

  const motorOnSeconds = doseKg / kilogramsPerSecond;
  if (motorOnSeconds > feedIntervalMinutes * 60) {
    return {
      error: `Cada dose levaria ${Math.ceil(motorOnSeconds / 60)} min para ser distribuída, mais que o intervalo de ${feedIntervalMinutes} min. Diminua a quantidade ou aumente o intervalo.`,
    };
  }

  return { plan: { numberOfDoses, doseKg, motorOnSeconds } };
}
