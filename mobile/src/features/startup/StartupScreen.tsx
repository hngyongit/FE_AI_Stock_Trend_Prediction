import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '../../../components/ui/box';
import { Pressable } from '../../../components/ui/pressable';
import { Spinner } from '../../../components/ui/spinner';
import { Text } from '../../../components/ui/text';
import { readPersistedSession } from '@/features/auth/auth.service';
import { initializeApp } from '@/features/startup/startup.service';
import type { RootScreenProps } from '@/navigation/types';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { useAuthStore } from '@/stores/auth.store';
import { useStartupStore } from '@/stores/startup.store';

const BACKGROUND = palette.background;
const SURFACE = palette.surfaceLow;
const BORDER = 'rgba(173, 198, 255, 0.14)';
const BRAND = palette.primary;
const MUTED = palette.textMuted;
const SOFT_TEXT = palette.textMuted;

function TrendMark({ size }: { size: number }) {
  const strokeWidth = Math.max(1.35, size * 0.016);
  const dotSize = Math.max(size * 0.08, 5);
  const sparkleSize = size * 0.18;
  const smallSparkleSize = size * 0.12;

  const styles = StyleSheet.create({
    mark: {
      height: size,
      position: 'relative',
      width: size,
    },
    axisHorizontal: {
      backgroundColor: 'rgba(173, 198, 255, 0.26)',
      bottom: '21%',
      height: strokeWidth,
      left: '16%',
      position: 'absolute',
      right: '12%',
    },
    axisVertical: {
      backgroundColor: 'rgba(173, 198, 255, 0.26)',
      bottom: '21%',
      left: '16%',
      position: 'absolute',
      top: '21%',
      width: strokeWidth,
    },
    trendOne: {
      backgroundColor: BRAND,
      borderRadius: 999,
      bottom: '37%',
      height: strokeWidth * 1.15,
      left: '23%',
      position: 'absolute',
      transform: [{ rotate: '-24deg' }],
      width: '30%',
    },
    trendTwo: {
      backgroundColor: BRAND,
      borderRadius: 999,
      bottom: '46%',
      height: strokeWidth * 1.15,
      left: '47%',
      position: 'absolute',
      transform: [{ rotate: '-43deg' }],
      width: '34%',
    },
    dot: {
      backgroundColor: BRAND,
      borderRadius: 999,
      height: dotSize,
      position: 'absolute',
      width: dotSize,
    },
    dotStart: {
      bottom: '31%',
      left: '20%',
    },
    dotMid: {
      bottom: '44%',
      left: '46%',
    },
    dotEnd: {
      bottom: '66%',
      left: '72%',
    },
    sparkle: {
      height: sparkleSize,
      position: 'absolute',
      width: sparkleSize,
    },
    smallSparkle: {
      height: smallSparkleSize,
      opacity: 0.72,
      position: 'absolute',
      width: smallSparkleSize,
    },
    sparkleVertical: {
      backgroundColor: BRAND,
      borderRadius: 999,
      bottom: 0,
      left: '46%',
      position: 'absolute',
      top: 0,
      width: strokeWidth,
    },
    sparkleHorizontal: {
      backgroundColor: BRAND,
      borderRadius: 999,
      height: strokeWidth,
      left: 0,
      position: 'absolute',
      right: 0,
      top: '46%',
    },
    sparklePrimary: {
      right: '17%',
      top: '13%',
    },
    sparkleSecondary: {
      left: '25%',
      top: '20%',
    },
  });

  return (
    <View style={styles.mark}>
      <View style={styles.axisHorizontal} />
      <View style={styles.axisVertical} />
      <View style={styles.trendOne} />
      <View style={styles.trendTwo} />
      <View style={[styles.dot, styles.dotStart]} />
      <View style={[styles.dot, styles.dotMid]} />
      <View style={[styles.dot, styles.dotEnd]} />

      <View style={[styles.sparkle, styles.sparklePrimary]}>
        <View style={styles.sparkleVertical} />
        <View style={styles.sparkleHorizontal} />
      </View>

      <View style={[styles.smallSparkle, styles.sparkleSecondary]}>
        <View style={styles.sparkleVertical} />
        <View style={styles.sparkleHorizontal} />
      </View>
    </View>
  );
}

export function StartupScreen({ navigation }: RootScreenProps<'Startup'>) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const spinner = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const detailOpacity = useRef(new Animated.Value(0.72)).current;
  const {
    beginInitialization,
    canRetry,
    completeInitialization,
    errorMessage,
    failInitialization,
    resetRetryState,
    retryKey,
    statusText,
    triggerRetry,
    updateStatus,
  } = useStartupStore();
  const clearSession = useAuthStore((state) => state.clearSession);
  const setSession = useAuthStore((state) => state.setSession);

  const metrics = useMemo(() => {
    const shortSide = Math.min(width, height);
    const logoSize = Math.min(shortSide * 0.285, height * 0.17);
    const iconSize = logoSize * 0.54;
    const titleSize = Math.max(22, Math.min(shortSide * 0.066, 30));
    const loadingSize = Math.max(10.5, Math.min(shortSide * 0.029, 12.5));
    const detailSize = Math.max(11, Math.min(shortSide * 0.031, 13));
    const errorSize = Math.max(12, Math.min(shortSide * 0.034, 14));
    const spinnerSize = Math.max(shortSide * 0.09, 28);
    const logoRadius = Math.max(radius.card, Math.min(shortSide * 0.05, 20));

    return {
      detailSize,
      errorSize,
      iconSize,
      loadingSize,
      logoRadius,
      logoSize,
      spinnerSize,
      titleSize,
    };
  }, [height, width]);

  useEffect(() => {
    Animated.timing(fade, {
      duration: 520,
      easing: Easing.out(Easing.quad),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  useEffect(() => {
    const rotationLoop = Animated.loop(
      Animated.timing(spinner, {
        duration: 1080,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    const opacityLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(detailOpacity, {
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(detailOpacity, {
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          toValue: 0.62,
          useNativeDriver: true,
        }),
      ]),
    );

    rotationLoop.start();
    opacityLoop.start();

    return () => {
      rotationLoop.stop();
      opacityLoop.stop();
    };
  }, [detailOpacity, spinner]);

  useEffect(() => {
    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    async function runInitialization() {
      resetRetryState();
      beginInitialization();

      const result = await initializeApp();

      if (cancelled) return;

      updateStatus(result.statusText);

      if (result.ok) {
        if (result.destination === '/dashboard') {
          const persistedSession = await readPersistedSession();

          if (persistedSession) {
            setSession(persistedSession);
          }
        } else {
          clearSession();
        }

        completeInitialization(result.statusText);
        Animated.timing(fade, {
          duration: 280,
          easing: Easing.out(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          if (!cancelled) {
            navigation.reset({
              index: 0,
              routes: [{ name: result.destination === '/dashboard' ? 'MainTabs' : 'Login' }],
            });
          }
        });

        return;
      }

      failInitialization({
        canRetry: result.canRetry,
        message: result.message,
        phase: result.stage,
        retryDelayMs: result.retryDelayMs,
        statusText: result.statusText,
      });

      if (result.canRetry) {
        retryTimeout = setTimeout(() => {
          triggerRetry();
        }, result.retryDelayMs);
      }
    }

    runInitialization();

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [
    beginInitialization,
    completeInitialization,
    clearSession,
    failInitialization,
    fade,
    resetRetryState,
    retryKey,
    navigation,
    setSession,
    triggerRetry,
    updateStatus,
  ]);

  const rotation = spinner.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: BACKGROUND,
          flex: 1,
        },
        shell: {
          alignItems: 'center',
          flex: 1,
          paddingBottom: Math.max(insets.bottom, height * 0.024, spacing.sm),
          paddingHorizontal: width * 0.08,
          paddingTop: Math.max(insets.top, height * 0.024, spacing.sm),
        },
        topSpace: {
          flex: 1.15,
        },
        brandZone: {
          alignItems: 'center',
          flex: 1.05,
          justifyContent: 'center',
          width: '100%',
        },
        logoFrame: {
          alignItems: 'center',
          backgroundColor: SURFACE,
          borderColor: BORDER,
          borderRadius: metrics.logoRadius,
          borderWidth: StyleSheet.hairlineWidth,
          height: metrics.logoSize,
          justifyContent: 'center',
          shadowColor: BRAND,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.18,
          shadowRadius: 22,
          width: metrics.logoSize,
        },
        title: {
          color: BRAND,
          fontSize: metrics.titleSize,
          fontWeight: '800',
          letterSpacing: metrics.titleSize * 0.09,
          marginTop: height * 0.028,
          maxWidth: '94%',
          textAlign: 'center',
        },
        middleSpace: {
          flex: 1.28,
        },
        loadingZone: {
          alignItems: 'center',
          flex: 0.96,
          justifyContent: 'flex-start',
          width: '100%',
        },
        spinner: {
          height: metrics.spinnerSize,
          opacity: 0.94,
          width: metrics.spinnerSize,
        },
        loadingText: {
          color: MUTED,
          fontSize: metrics.loadingSize,
          fontWeight: '700',
          letterSpacing: metrics.loadingSize * 0.22,
          marginTop: height * 0.03,
          textAlign: 'center',
        },
        statusText: {
          color: SOFT_TEXT,
          fontSize: metrics.detailSize,
          letterSpacing: metrics.detailSize * 0.03,
          lineHeight: metrics.detailSize * 1.5,
          marginTop: height * 0.018,
          maxWidth: '86%',
          textAlign: 'center',
        },
        fallback: {
          alignItems: 'center',
          marginTop: height * 0.026,
          rowGap: height * 0.014,
          width: '100%',
        },
        errorText: {
          color: SOFT_TEXT,
          fontSize: metrics.errorSize,
          letterSpacing: metrics.errorSize * 0.018,
          lineHeight: metrics.errorSize * 1.45,
          maxWidth: '84%',
          textAlign: 'center',
        },
        retryButton: {
          alignItems: 'center',
          borderColor: 'rgba(173, 198, 255, 0.18)',
          borderRadius: 999,
          borderWidth: StyleSheet.hairlineWidth,
          justifyContent: 'center',
          minWidth: width * 0.28,
          paddingHorizontal: width * 0.052,
          paddingVertical: height * 0.011,
        },
        retryButtonPressed: {
          opacity: 0.7,
        },
        retryText: {
          color: BRAND,
          fontSize: metrics.loadingSize,
          fontWeight: '800',
          letterSpacing: metrics.loadingSize * 0.18,
        },
        bottomSpace: {
          flex: 0.5,
        },
      }),
    [height, insets.bottom, insets.top, metrics, width],
  );

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.root}>
      <Animated.View style={[styles.shell, { opacity: fade }]}>
        <Box style={styles.topSpace} />

        <Box style={styles.brandZone}>
          <Box style={styles.logoFrame}>
            <TrendMark size={metrics.iconSize} />
          </Box>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.title}>
            AI STOCK TREND
          </Text>
        </Box>

        <Box style={styles.middleSpace} />

        <Box style={styles.loadingZone}>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Spinner
              color={BRAND}
              size="small"
              style={styles.spinner}
            />
          </Animated.View>
          <Text style={styles.loadingText}>PREPARING SESSION...</Text>
          <Animated.Text style={[styles.statusText, { opacity: detailOpacity }]}>
            {statusText}
          </Animated.Text>

          {errorMessage ? (
            <Box style={styles.fallback}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              {canRetry ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={triggerRetry}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}>
                  <Text style={styles.retryText}>RETRY</Text>
                </Pressable>
              ) : null}
            </Box>
          ) : null}
        </Box>

        <Box style={styles.bottomSpace} />
      </Animated.View>
    </SafeAreaView>
  );
}
