import { Pressable, PressableProps } from 'react-native';

/**
 * Pressable que trata o toque longo como toque normal.
 *
 * No celular é comum o dedo ficar pressionado mais de ~0,5 s (principalmente para
 * quem tem pouca prática com telas sensíveis ao toque). O React Native trata isso
 * como "toque longo" e, sem `onLongPress`, o toque era descartado — o botão
 * "precisava de 2 ou 3 toques". Use sempre `Tap` no lugar de `Pressable`.
 */
export function Tap({ onPress, onLongPress, ...rest }: PressableProps) {
  return <Pressable onPress={onPress} onLongPress={onLongPress ?? onPress} {...rest} />;
}
