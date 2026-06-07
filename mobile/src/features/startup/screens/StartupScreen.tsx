import { useMemo } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, Pressable, Spinner, Text } from '@/shared/ui/primitives';
import { TrendMark } from '@/features/startup/components/TrendMark';
import { useStartupLogic } from '@/features/startup/hooks/useStartupLogic';
import type { RootScreenProps } from '@/app/navigation/navigation.types';
import { palette, radius, spacing } from '@/shared/design/tokens';

const BRAND = palette.primary;
const MUTED = palette.textSecondary;

export function StartupScreen({ navigation }: RootScreenProps<'Startup'>) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { fade, rotation, detailOpacity, statusText, errorMessage, canRetry, triggerRetry } =
    useStartupLogic(navigation);

  const metrics = useMemo(() => {
    const shortSide = Math.min(width, height);
    const logoSize = Math.min(shortSide * 0.285, height * 0.17);
    return {
      logoSize,
      iconSize: logoSize * 0.54,
      titleSize: Math.max(22, Math.min(shortSide * 0.066, 30)),
      loadingSize: Math.max(10.5, Math.min(shortSide * 0.029, 12.5)),
      detailSize: Math.max(11, Math.min(shortSide * 0.031, 13)),
      errorSize: Math.max(12, Math.min(shortSide * 0.034, 14)),
      spinnerSize: Math.max(shortSide * 0.09, 28),
      logoRadius: Math.max(radius.card, Math.min(shortSide * 0.05, 20)),
    };
  }, [height, width]);

  const styles = StyleSheet.create({
    root: { backgroundColor: palette.background, flex: 1 },
    shell: {
      alignItems: 'center', flex: 1,
      paddingBottom: Math.max(insets.bottom, height * 0.024, spacing.sm),
      paddingHorizontal: width * 0.08,
      paddingTop: Math.max(insets.top, height * 0.024, spacing.sm),
    },
    logoFrame: {
      alignItems: 'center', backgroundColor: palette.surface,
      borderColor: 'rgba(173, 198, 255, 0.14)', borderRadius: metrics.logoRadius,
      borderWidth: StyleSheet.hairlineWidth, height: metrics.logoSize,
      justifyContent: 'center',
      shadowColor: BRAND, shadowOffset: { width: 0, height: 10 },
      shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.18, shadowRadius: 22, width: metrics.logoSize,
    },
    title: {
      color: BRAND, fontSize: metrics.titleSize, fontWeight: '800',
      letterSpacing: metrics.titleSize * 0.09, marginTop: height * 0.028,
      maxWidth: '94%', textAlign: 'center',
    },
    spinner: { height: metrics.spinnerSize, opacity: 0.94, width: metrics.spinnerSize },
    loadingText: {
      color: MUTED, fontSize: metrics.loadingSize, fontWeight: '700',
      letterSpacing: metrics.loadingSize * 0.22, marginTop: height * 0.03, textAlign: 'center',
    },
    statusText: {
      color: MUTED, fontSize: metrics.detailSize,
      letterSpacing: metrics.detailSize * 0.03, lineHeight: metrics.detailSize * 1.5,
      marginTop: height * 0.018, maxWidth: '86%', textAlign: 'center',
    },
    errorText: {
      color: MUTED, fontSize: metrics.errorSize,
      letterSpacing: metrics.errorSize * 0.018, lineHeight: metrics.errorSize * 1.45,
      maxWidth: '84%', textAlign: 'center',
    },
    retryButton: {
      alignItems: 'center', borderColor: 'rgba(173, 198, 255, 0.18)',
      borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center',
      minWidth: width * 0.28, paddingHorizontal: width * 0.052, paddingVertical: height * 0.011,
    },
    retryText: { color: BRAND, fontSize: metrics.loadingSize, fontWeight: '800', letterSpacing: metrics.loadingSize * 0.18 },
  });

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.root}>
      <Animated.View style={[styles.shell, { opacity: fade }]}>
        <Box style={{ flex: 1.15 }} />
        <Box style={{ alignItems: 'center', flex: 1.05, justifyContent: 'center' }}>
          <Box style={styles.logoFrame}>
            <TrendMark size={metrics.iconSize} />
          </Box>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.title}>AI STOCK TREND</Text>
        </Box>
        <Box style={{ flex: 1.28 }} />
        <Box style={{ alignItems: 'center', flex: 0.96, justifyContent: 'flex-start' }}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: rotation }] }]}>
            <Spinner color={BRAND} size="small" />
          </Animated.View>
          <Animated.Text style={[styles.statusText, { opacity: detailOpacity, marginTop: height * 0.03 }]}>
            {statusText}
          </Animated.Text>
          {errorMessage ? (
            <Box style={{ alignItems: 'center', marginTop: height * 0.026 }}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              {canRetry ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={triggerRetry}
                  style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.7 }]}>
                  <Text style={styles.retryText}>RETRY</Text>
                </Pressable>
              ) : null}
            </Box>
          ) : null}
        </Box>
        <Box style={{ flex: 0.5 }} />
      </Animated.View>
    </SafeAreaView>
  );
}