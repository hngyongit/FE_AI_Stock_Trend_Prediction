import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '../../../../components/ui/box';
import { Text } from '../../../../components/ui/text';
import {
  AlertsIcon,
  DashboardIcon,
  ProfileIcon,
  SearchIcon,
  WatchlistIcon,
} from '@/shared/components/navigation/NavigationIcons';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { useAppShellStore } from '@/stores/app-shell.store';

type AppTabBarProps = {
  descriptors: Record<string, { options: { tabBarAccessibilityLabel?: string } }>;
  navigation: {
    emit: (event: {
      canPreventDefault?: boolean;
      target: string;
      type: 'tabLongPress' | 'tabPress';
    }) => unknown;
    navigate: (name: string, params?: object) => void;
  };
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
      params?: object;
    }>;
  };
};

const TAB_META: Record<
  string,
  {
    icon: ({ color, size }: { color: string; size: number }) => ReactNode;
    label: string;
  }
> = {
  Alerts: { icon: AlertsIcon, label: 'Alerts' },
  Dashboard: { icon: DashboardIcon, label: 'Dashboard' },
  Profile: { icon: ProfileIcon, label: 'Profile' },
  Search: { icon: SearchIcon, label: 'Search' },
  Watchlist: { icon: WatchlistIcon, label: 'Watchlist' },
};

export function AppTabBar({ descriptors, navigation, state }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { unreadNotifications } = useAppShellStore();

  const metrics = useMemo(() => {
    const shortSide = Math.min(width, height);

    return {
      barMinHeight: Math.max(height * 0.11, 45),
      iconSize: Math.max(shortSide * 0.07, 22),
      paddingBottom: Math.max(insets.bottom, height * 0.018),
      paddingHorizontal: Math.max(width * 0.04, spacing.sm),
      paddingTop: Math.max(height * 0.018, spacing.sm),
      railRadius: Math.max(radius.card, Math.min(shortSide * 0.045, 18)),
      touchHeight: Math.max(height * 0.066, 54),
    };
  }, [height, insets.bottom, width]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          backgroundColor: palette.background,
          borderTopColor: palette.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          minHeight: metrics.barMinHeight,
          paddingBottom: metrics.paddingBottom,
          paddingHorizontal: metrics.paddingHorizontal,
          paddingTop: metrics.paddingTop,
        },
        row: {
          alignItems: 'center',
          borderRadius: metrics.railRadius,
          flexDirection: 'row',
          gap: spacing.xs,
          justifyContent: 'space-between',
          paddingHorizontal: Math.max(width * 0.016, spacing.xs),
          paddingVertical: Math.max(height * 0.008, spacing.xs),
        },
        tabButton: {
          alignItems: 'center',
          borderRadius: radius.pill,
          flex: 1,
          justifyContent: 'center',
          minHeight: metrics.touchHeight,
          minWidth: 44,
          overflow: 'hidden',
          paddingVertical: Math.max(height * 0.012, spacing.sm),
          position: 'relative',
        },
        tabActive: {
          backgroundColor: 'rgba(173, 198, 255, 0.12)',
        },
        tabPressed: {
          opacity: 0.8,
        },
        alertBadge: {
          alignItems: 'center',
          backgroundColor: palette.primary,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: 'rgba(8, 17, 26, 0.12)',
          justifyContent: 'center',
          minWidth: 16,
          paddingHorizontal: 4,
          position: 'absolute',
          right: '18%',
          top: '12%',
        },
        alertBadgeText: {
          color: '#08111A',
          fontSize: 9,
          fontWeight: '800',
        },
      }),
    [metrics],
  );

  const visibleRoutes = state.routes.filter((route) => route.name in TAB_META);

  return (
    <Box style={styles.shell}>
      <View style={styles.row}>
        {visibleRoutes.map((route) => {
          const routeIndex = state.routes.findIndex((entry) => entry.key === route.key);
          const isFocused = state.index === routeIndex;
          const descriptor = descriptors[route.key];
          const meta = TAB_META[route.name];
          const Icon = meta.icon;

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={descriptor.options.tabBarAccessibilityLabel ?? meta.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              onLongPress={() => navigation.emit({ target: route.key, type: 'tabLongPress' })}
              onPress={() => {
                const event = navigation.emit({
                  canPreventDefault: true,
                  target: route.key,
                  type: 'tabPress',
                }) as { defaultPrevented?: boolean };

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={({ pressed }) => [
                styles.tabButton,
                isFocused && styles.tabActive,
                pressed && styles.tabPressed,
              ]}>
              <Icon color={isFocused ? palette.primary : palette.textMuted} size={metrics.iconSize} />
              {route.name === 'Alerts' && unreadNotifications > 0 ? (
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Box>
  );
}
