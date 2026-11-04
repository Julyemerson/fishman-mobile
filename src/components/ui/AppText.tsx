import { Text, TextProps } from 'react-native';

import { MAX_FONT_SCALE, TypographyVariant, colors, typography } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/** Texto do app: sempre Nunito, escala do tema e zoom de fonte do sistema limitado. */
export function AppText({
  variant = 'body',
  color = colors.text,
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={[typography[variant], { color }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}
