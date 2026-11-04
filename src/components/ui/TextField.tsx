import { ComponentRef, forwardRef, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { Tap } from './Tap';

import { MAX_FONT_SCALE, colors, fonts, radius, spacing, touch } from '@/theme';
import { haptics } from '@/utils/haptics';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /** Rótulo sempre visível acima do campo (placeholder some ao digitar). */
  label: string;
  /** Campo de senha com botão "Ver"/"Esconder". */
  password?: boolean;
  /** Marca o campo em vermelho (a mensagem fica num aviso acima do botão). */
  invalid?: boolean;
}

/** Instância do TextInput (o tipo mudou no React Native 0.88; use este alias). */
export type TextFieldHandle = ComponentRef<typeof TextInput>;

export const TextField = forwardRef<TextFieldHandle, TextFieldProps>(
  ({ label, password = false, invalid = false, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(true);

    return (
      <View style={styles.container}>
        <AppText variant="body" style={styles.label} nativeID={`label-${label}`}>
          {label}
        </AppText>
        <View style={styles.row}>
          <TextInput
            ref={ref}
            accessibilityLabel={label}
            accessibilityLabelledBy={`label-${label}`}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={password && hidden}
            autoCorrect={false}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[styles.input, focused && styles.inputFocused, invalid && styles.inputInvalid]}
            {...rest}
          />
          {password && (
            <Tap
              onPress={() => {
                haptics.tap();
                setHidden(!hidden);
              }}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Mostrar a senha' : 'Esconder a senha'}
              style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}>
              <Icon
                name={hidden ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color={colors.textSecondary}
              />
              <AppText variant="label" color={colors.textSecondary}>
                {hidden ? 'Ver' : 'Esconder'}
              </AppText>
            </Tap>
          )}
        </View>
      </View>
    );
  }
);
TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.extrabold,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 19,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputInvalid: {
    borderColor: colors.error,
  },
  toggle: {
    minHeight: 60,
    minWidth: touch.min,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  togglePressed: {
    backgroundColor: colors.primarySoft,
  },
});
