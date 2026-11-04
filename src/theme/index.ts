/**
 * Tema do DR Pescados — paleta "Água".
 *
 * Público: produtores com pouca instrução formal. Regras que o tema garante:
 * - Toda cor de texto passa contraste 4.5:1 no fundo onde é usada.
 * - Toque mínimo de 56px (`touch.min`); ações principais com 64px.
 * - Texto nunca menor que 15px.
 *
 * Mockups: https://claude.ai/artifact/E1yqW5Sn2Viz8dMGz1coc4
 */

export const colors = {
  // Marca
  primary: '#1F5F6B', // azul-petróleo: botões, LIGADO, sucesso (7,2:1 com branco)
  primaryPressed: '#174A54',
  primarySoft: '#E6F0F1', // fundos de ícone, "com sinal"
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#D6E8EA',
  accent: '#E8714A', // coral da logo: só barras, anéis e detalhes (nunca texto)

  // Superfícies
  background: '#F3F6F6',
  surface: '#FFFFFF',
  border: '#E2EAEB',
  borderStrong: '#C5D3D5',
  track: '#E2EAEB', // fundo de barras/anéis de progresso

  // Texto (marrom do chapéu da logo)
  text: '#2B1E16',
  textSecondary: '#4A3B30',
  textMuted: '#6B5646', // nunca usar texto mais claro que este

  // Desligado / neutro
  off: '#E6EBEC',
  onOff: '#3E342C',

  // Atenção
  warning: '#FFF0C2',
  warningBorder: '#E8B400',
  onWarning: '#5A3D00',

  // Erro
  error: '#B3261E',
  errorSoft: '#FBE4E2',
  onErrorSoft: '#9B1C1C',

  // Faixa de "sem internet"
  offlineBar: '#4A3B30',
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

/** Escala de texto. Os nomes descrevem o uso, não o tamanho. */
export const typography = {
  /** Pergunta do passo a passo ("Quanta ração por dia?") */
  question: { fontFamily: fonts.black, fontSize: 30, lineHeight: 36 },
  /** Números grandes (40 kg, 08:00) */
  display: { fontFamily: fonts.black, fontSize: 56, lineHeight: 62 },
  /** Título de tela/cabeçalho */
  title: { fontFamily: fonts.extrabold, fontSize: 22, lineHeight: 28 },
  /** Nome em card */
  cardTitle: { fontFamily: fonts.extrabold, fontSize: 21, lineHeight: 26 },
  /** Texto de botão */
  button: { fontFamily: fonts.black, fontSize: 20, lineHeight: 26 },
  /** Texto normal */
  body: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 25 },
  bodyRegular: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 25 },
  /** Rótulos, etiquetas — tamanho mínimo do app */
  label: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
  /** Cabeçalho de seção ("VIVEIRO 1", "HOJE") */
  overline: { fontFamily: fonts.extrabold, fontSize: 15, lineHeight: 20, letterSpacing: 0.9 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radius = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const touch = {
  /** Altura mínima de qualquer alvo de toque. */
  min: 56,
  /** Ação principal da tela. */
  primary: 64,
} as const;

/** Limite do zoom de fonte do sistema, para o layout não quebrar. */
export const MAX_FONT_SCALE = 1.5;

export const theme = { colors, fonts, typography, spacing, radius, touch } as const;
export type Theme = typeof theme;
