import { PropsWithChildren, ReactNode, useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { Box, Card, Text } from '@/shared/ui/primitives';
import { AppBanner } from '@/shared/ui/feedback/AppBanner';
import { LoadingSkeleton } from '@/shared/ui/feedback/LoadingSkeleton';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { useAppShellStore } from '@/stores/app-shell.store';
import { useMarketStore } from '@/stores/market.store';

type AppScreenProps = PropsWithChildren<{
  emptyState?: ReactNode;
  footer?: ReactNode;
}>;

function EmptyDashboardState() {
  return (
    <Card style={styles.emptyCard}>
      <Text style={styles.emptyEyebrow}>Dashboard Surface</Text>
      <Text style={styles.emptyTitle}>Operational modules will mount here.</Text>
      <Text style={styles.emptyBody}>
        This shell keeps navigation, refresh handling, banners, and screen persistence ready
        while data panels are connected in later phases.
      </Text>
    </Card>
  );
}

export function AppScreen({ children, emptyState, footer }: AppScreenProps) {
  const { height, width } = useWindowDimensions();
  const {
    isContentLoading,
    isOffline,
    isRefreshing,
    isStale,
    refreshContent,
    warningMessage,
  } = useAppShellStore();
  const { marketStatus } = useMarketStore();

  const responsiveStyles = useMemo(() => {
    const shortSide = Math.min(width, height);

    return StyleSheet.create({
      content: {
        flexGrow: 1,
        gap: shortSide * 0.05,
        paddingBottom: Math.max(height * 0.032, spacing.lg),
        paddingHorizontal: Math.max(width * 0.045, spacing.md),
        paddingTop: Math.max(height * 0.024, spacing.md),
      },
      footer: {
        borderTopColor: palette.border,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: Math.max(width * 0.045, spacing.md),
        paddingVertical: Math.max(height * 0.015, spacing.sm),
      },
      overlay: {
        backgroundColor: 'rgba(11, 18, 32, 0.78)',
        borderColor: 'rgba(255, 183, 134, 0.24)',
        borderRadius: radius.card,
        borderWidth: 1,
        bottom: Math.max(height * 0.024, spacing.md),
        left: Math.max(width * 0.045, spacing.md),
        paddingHorizontal: Math.max(width * 0.04, spacing.md),
        paddingVertical: Math.max(height * 0.016, spacing.sm),
        position: 'absolute',
        right: Math.max(width * 0.045, spacing.md),
      },
      overlayText: {
        color: palette.textPrimary,
        fontSize: Math.max(shortSide * 0.033, 13),
        lineHeight: Math.max(shortSide * 0.045, 18),
      },
    });
  }, [height, width]);

  const banners = [
    marketStatus === 'CLOSED' ? (
      <AppBanner
        key="market-closed"
        body="The exchange is currently closed. Cached layouts stay available while live modules pause."
        title="Market Closed"
        tone="warning"
      />
    ) : (
      <AppBanner
        key="market-open"
        body="Navigation is live and ready for intraday modules, watchlists, and alert surfaces."
        title="Market Open"
        tone="success"
      />
    ),
    isStale ? (
      <AppBanner
        key="stale"
        body="Some panels may be showing cached values. Pull to refresh when the connection stabilizes."
        title="Data Stale"
        tone="warning"
      />
    ) : null,
    warningMessage ? (
      <AppBanner
        key="warning"
        body={warningMessage}
        title="Service Notice"
      />
    ) : null,
  ].filter(Boolean);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={responsiveStyles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => { void refreshContent(); }}
            refreshing={isRefreshing}
            tintColor={palette.primary}
          />
        }
        showsVerticalScrollIndicator={false}>
        {banners}
        {isContentLoading ? <LoadingSkeleton /> : children ?? emptyState ?? <EmptyDashboardState />}
      </ScrollView>

      {footer ? <Box style={responsiveStyles.footer}>{footer}</Box> : null}

      {isOffline ? (
        <View pointerEvents="none" style={responsiveStyles.overlay}>
          <Text style={responsiveStyles.overlayText}>
            You&apos;re offline. Cached layout stays available until connectivity returns.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: palette.background,
    flex: 1,
  },
  emptyCard: {
    backgroundColor: palette.surfaceLow,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    minHeight: 240,
    padding: spacing.md,
  },
  emptyEyebrow: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.84,
    textTransform: 'uppercase',
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginTop: spacing.sm,
  },
  emptyBody: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
    maxWidth: '88%',
  },
});
