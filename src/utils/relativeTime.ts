/** "agora", "há 5 minutos", "há 2 horas", "há 3 dias" — por extenso, para quem lê com dificuldade. */
export function formatRelativeTime(
  iso: string | null | undefined,
  now = new Date()
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMinutes < 1) return 'agora';
  if (diffMinutes < 60) return `há ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? 'há 1 dia' : `há ${diffDays} dias`;
}

/** Hora local do aparelho em HH:mm, para instantes reais (ex.: logs). */
export function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
