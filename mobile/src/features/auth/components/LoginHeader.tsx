import { useMemo } from 'react';
import { TextStyle, ViewStyle } from 'react-native';

import { Text, VStack } from '@/shared/ui/primitives';
import { palette } from '@/shared/design/tokens';

type LoginHeaderProps = {
  metrics: {
    titleSize: number;
    welcomeSize: number;
    subtitleSize: number;
  };
};

export function LoginHeader({ metrics }: LoginHeaderProps) {
  const styles = useMemo(
    () => ({
      brandText: {
        color: palette.primary,
        fontSize: metrics.titleSize * 0.56,
        fontWeight: '800',
        letterSpacing: metrics.titleSize * 0.08,
        textAlign: 'center',
      } as TextStyle,
      welcomeText: {
        color: palette.textPrimary,
        fontSize: metrics.welcomeSize,
        fontWeight: '800',
        lineHeight: metrics.welcomeSize * 1.15,
        textAlign: 'center',
      } as TextStyle,
      subtitleText: {
        color: palette.textSecondary,
        fontSize: metrics.subtitleSize,
        lineHeight: metrics.subtitleSize * 1.55,
        textAlign: 'center',
      } as TextStyle,
    }),
    [metrics],
  );

  return (
    <VStack space="sm">
      <Text style={styles.brandText}>AI STOCK TREND</Text>
      <Text style={styles.welcomeText}>Welcome back</Text>
      <Text style={styles.subtitleText}>
        Sign in to your operational dashboard
      </Text>
    </VStack>
  );
}