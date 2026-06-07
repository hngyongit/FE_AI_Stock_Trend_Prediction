import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, Text } from '@/shared/ui/primitives';
import type { MainTabScreenProps } from '@/app/navigation/navigation.types';
import { BellIcon, BrandTrendIcon } from '@/app/navigation/NavigationIcons';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { useAppShellStore } from '@/stores/app-shell.store';
import { useMarketStore } from '@/stores/market.store';

export function AppHeader() {
  const navigation = useNavigation<MainTabScreenProps<'Dashboard'>['navigation']>();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { unreadNotifications } = useAppShellStore();
  const { marketStatus } = useMarketStore();

  const metrics = useMemo(() => {
    const shortSide = Math.min(width, height);
    const iconSize = Math.max(shortSide * 0.06, 22);
    const titleSize = Math.max(shortSide * 0.04, 15);
    const badgeText = Math.max(shortSide * 0.027, 10.5);
    const shellHeight = Math.max(height * 0.09, 72);

    return {
      badgeText,
      iconSize,
      shellHeight,
      titleSize,
    };
  }, [height, width]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          backgroundColor: palette.surfaceLow,
          borderBottomColor: palette.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
          minHeight: metrics.shellHeight,
          paddingBottom: Math.max(height * 0.014, spacing.sm),
          paddingHorizontal: Math.max(width * 0.045, spacing.md),
          paddingTop: Math.max(insets.top, height * 0.014),
        },
        row: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          justifyContent: 'space-between',
        },
        brand: {
          alignItems: 'center',
          flexDirection: 'row',
          flexShrink: 1,
          gap: spacing.sm,
          minWidth: 0,
        },
        brandText: {
          color: palette.primary,
          flexShrink: 1,
          fontSize: metrics.titleSize,
          fontWeight: '800',
          letterSpacing: metrics.titleSize * 0.08,
        },
        rightCluster: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
        },
        marketBadge: {
          alignItems: 'center',
          backgroundColor: 'rgba(25, 28, 30, 0.96)',
          borderColor: 'rgba(34, 197, 94, 0.2)',
          borderRadius: radius.pill,
          borderWidth: 1,
          flexDirection: 'row',
          gap: spacing.xs,
          paddingHorizontal: Math.max(width * 0.028, spacing.sm),
          paddingVertical: Math.max(height * 0.008, 6),
        },
        dot: {
          backgroundColor: marketStatus === 'OPEN' ? palette.up : palette.warning,
          borderRadius: radius.pill,
          height: Math.max(metrics.badgeText * 0.62, 7),
          width: Math.max(metrics.badgeText * 0.62, 7),
        },
        marketText: {
          color: marketStatus === 'OPEN' ? palette.up : palette.warning,
          fontSize: metrics.badgeText,
          fontWeight: '700',
          letterSpacing: metrics.badgeText * 0.1,
        },
        bellButton: {
          alignItems: 'center',
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderRadius: radius.pill,
          borderWidth: 1,
          height: Math.max(height * 0.052, 42),
          justifyContent: 'center',
          width: Math.max(height * 0.052, 42),
        },
        bellPressed: {
          opacity: 0.74,
        },
        badgeBubble: {
          alignItems: 'center',
          backgroundColor: palette.primary,
          borderRadius: radius.pill,
          justifyContent: 'center',
          minWidth: Math.max(metrics.badgeText * 1.7, 16),
          paddingHorizontal: 4,
          position: 'absolute',
          right: -3,
          top: -3,
        },
        badgeBubbleText: {
          color: '#08111A',
          fontSize: Math.max(metrics.badgeText * 0.82, 9),
          fontWeight: '800',
        },
      }),
    [height, insets.top, marketStatus, metrics, width],
  );

  return (
    <Box style={styles.shell}>
      <View style={styles.row}>
        <View style={styles.brand}>
          <BrandTrendIcon color={palette.primary} size={metrics.iconSize} />
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.brandText}>
            AI STOCK TREND
          </Text>
        </View>

        <View style={styles.rightCluster}>
          <View style={styles.marketBadge}>
            <View style={styles.dot} />
            <Text style={styles.marketText}>{marketStatus}</Text>
          </View>

          <Pressable
            accessibilityHint="Open notification center"
            accessibilityLabel="Notifications"
            accessibilityRole="button"
            onPress={() => navigation.navigate('Alerts')}
            style={({ pressed }) => [styles.bellButton, pressed && styles.bellPressed]}>
            <BellIcon color={palette.textMuted} size={metrics.iconSize * 0.76} />
            {unreadNotifications > 0 ? (
              <View style={styles.badgeBubble}>
                <Text style={styles.badgeBubbleText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
    </Box>
  );
}
