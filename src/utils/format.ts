/** 22 → "22", 2.25 → "2,3". Para exibir na tela (a fala usa utils/speech). */
export function formatKg(kg: number): string {
  const rounded = Math.round(kg * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');
}
