import { Animated, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, Text } from '@/shared/ui/primitives';
import { TrendMark } from '@/features/startup/components/TrendMark';
import { useStartupLogic } from '@/features/startup/hooks/useStartupLogic';
import { useStartupScreenStyles } from '@/features/startup/screens/startup-screen.styles';
import type { RootScreenProps } from '@/app/navigation/navigation.types';

export function StartupScreen({ navigation }: RootScreenProps<'Startup'>) {
  const insets = useSafeAreaInsets();
  const { fade, detailOpacity, progressTranslate, statusText, errorMessage, canRetry, triggerRetry } =
    useStartupLogic(navigation);

  const styles = useStartupScreenStyles(insets);

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.root}>
      <View pointerEvents="none" style={styles.gridBackground}>
        {Array.from({ length: 13 }).map((_, row) => (
          <View key={`row-${row}`} style={styles.gridRow}>
            {Array.from({ length: 22 }).map((__, col) => (
              <View key={`dot-${row}-${col}`} style={styles.gridDot} />
            ))}
          </View>
        ))}
      </View>

      <Animated.View style={[styles.shell, { opacity: fade }]}>
        <View style={styles.topDivider} />

        <View style={styles.card}>
          <View style={styles.cardTopDivider} />

          <View style={styles.brandCore}>
            <View style={styles.brandHaloOuter}>
              <View style={styles.brandHaloInner}>
                <View style={styles.brandBadge}>
                  <TrendMark size={28} />
                </View>
              </View>
              <View style={styles.brandMiniBadge}>
                <TrendMark size={10} />
              </View>
            </View>
          </View>

          <Text style={styles.brandName}>AI STOCK TREND</Text>
          <Text style={styles.brandSubhead}>AI-BASED STOCK TREND PREDICTION</Text>

          <View style={styles.statusBlock}>
            <Animated.View style={[styles.statusRow, { opacity: detailOpacity }]}>
              <View style={styles.statusDot} />
              <Text numberOfLines={1} style={styles.statusText}>
                {statusText}
              </Text>
            </Animated.View>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { opacity: detailOpacity, transform: [{ translateX: progressTranslate }] },
                ]}
              />
            </View>
          </View>

          {errorMessage ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              {canRetry ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={triggerRetry}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}>
                  <Text style={styles.retryText}>Retry startup</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <View style={styles.cardFooterSpacer} />
          )}

          <Text style={styles.versionText}>v2.4.3_AI_STOCK_TREND // MOBILE</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
