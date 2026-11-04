import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

/** Ícones do Material Community, mais o camarão (que só existe no FontAwesome 6). */
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'] | 'shrimp';

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
}

/** Ícones decorativos: o texto ao lado sempre diz o que o ícone significa. */
export function Icon({ name, size = 24, color }: IconProps) {
  const a11y = { accessibilityElementsHidden: true, importantForAccessibility: 'no' } as const;

  if (name === 'shrimp') {
    // O desenho do FontAwesome é mais "cheio": um pouco menor fica do mesmo peso visual.
    return <FontAwesome6 name="shrimp" size={Math.round(size * 0.85)} color={color} {...a11y} />;
  }
  return <MaterialCommunityIcons name={name} size={size} color={color} {...a11y} />;
}
