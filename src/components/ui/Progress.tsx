import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, radius } from '@/theme';

const clamp = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

interface ProgressRingProps {
  /** 0 a 1. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Conteúdo no centro (ex.: "22 de 40 kg"). */
  children?: ReactNode;
  accessibilityLabel: string;
}

export function ProgressRing({
  progress,
  size = 124,
  strokeWidth = 14,
  children,
  accessibilityLabel,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * clamp(progress);

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamp(progress) * 100) }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {filled > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.accent}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.center}>{children}</View>
      </View>
    </View>
  );
}

interface ProgressBarProps {
  progress: number;
  accessibilityLabel: string;
  height?: number;
}

export function ProgressBar({ progress, accessibilityLabel, height = 12 }: ProgressBarProps) {
  return (
    <View
      style={[styles.track, { height }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamp(progress) * 100) }}>
      <View style={[styles.fill, { width: `${clamp(progress) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
