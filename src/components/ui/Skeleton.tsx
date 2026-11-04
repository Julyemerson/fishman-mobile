import { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Bloco cinza pulsando no lugar do conteúdo que está carregando. */
export function Skeleton({ width = '100%', height, rounded, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: rounded ? radius.pill : 8,
          backgroundColor: colors.track,
          opacity,
        },
        style,
      ]}
    />
  );
}
