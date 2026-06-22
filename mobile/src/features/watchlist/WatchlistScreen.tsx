import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

function ListSeparator() {
  return <View style={styles.separator} />;
}
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';
import { useWatchlist } from '@/features/watchlist/hooks/useWatchlist';
import { WatchlistHeader } from '@/features/watchlist/components/WatchlistHeader';
import { WatchlistSearchBar } from '@/features/watchlist/components/WatchlistSearchBar';
import { WatchlistFilterChips } from '@/features/watchlist/components/WatchlistFilterChips';
import { WatchlistRow } from '@/features/watchlist/components/WatchlistRow';
import { SwipeableRow } from '@/features/watchlist/components/SwipeableRow';
import { WatchlistOverlimitModal } from '@/features/watchlist/components/WatchlistOverlimitModal';
import type { MainTabScreenProps } from '@/app/navigation/navigation.types';
import type {
  WatchlistItem,
  WatchlistOverlimitItem,
  WatchlistRawItem,
} from '@/features/watchlist/types';

function EmptyWatchlistState() {
  return (
    <View style={styles.emptyShell}>
      <Text style={styles.emptyTitle}>No stocks tracked yet</Text>
      <Text style={styles.emptyBody}>
        Tap the + Add button to start following your favourite symbols.
      </Text>
    </View>
  );
}

function ErrorWatchlistState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.emptyShell}>
      <Text style={styles.emptyTitle}>Could not load watchlist</Text>
      <Text style={styles.emptyBody}>{message}</Text>
      <Text onPress={onRetry} style={styles.retryLink}>
        Tap to retry
      </Text>
    </View>
  );
}

export function WatchlistScreen() {
  const navigation = useNavigation<MainTabScreenProps<'Watchlist'>['navigation']>();
  const insets = useSafeAreaInsets();
  const {
    items,
    rawItems,
    isLoading,
    error,
    refresh,
    removeItem,
    overLimit,
    limit,
    trimItems,
    isTrimming,
  } = useWatchlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('all');
  const [showOverlimitModal, setShowOverlimitModal] = useState(false);

  const isActuallyLoading = isLoading && items.length === 0;

  const filteredItems = useMemo(() => {
    let result = items;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toUpperCase();
      result = result.filter(
        (i) =>
          i.stock.symbol.includes(q) ||
          i.stock.company_name.toUpperCase().includes(q),
      );
    }

    if (activeChip === 'gainers') {
      result = result.filter((i) => (i.latest_price?.price_change_percent ?? 0) > 0);
    } else if (activeChip === 'losers') {
      result = result.filter((i) => (i.latest_price?.price_change_percent ?? 0) < 0);
    } else if (activeChip === 'hose') {
      result = result.filter((i) => i.stock.market_code === 'HOSE');
    }

    return result;
  }, [items, searchQuery, activeChip]);

  const overlimitItems = useMemo(() => {
    if (!overLimit) return [];
    return rawItems.filter(
      (item: WatchlistRawItem): item is WatchlistOverlimitItem =>
        !('stock' in item),
    );
  }, [overLimit, rawItems]);

  const handleTrimSuccess = useCallback(() => {
    setShowOverlimitModal(false);
    void refresh();
  }, [refresh]);

  const handleTrimItems = useCallback(
    (keepStockIds: string[]) => {
      trimItems(keepStockIds);
    },
    [trimItems],
  );

  const renderItem = useCallback(
    ({ item }: { item: WatchlistItem }) => {
      return (
        <SwipeableRow
          symbol={item.stock.symbol}
          onDelete={(symbol) => {
            removeItem(symbol);
          }}
        >
          <WatchlistRow
            item={item}
            onPress={(symbol) => navigation.navigate('StockDetail', { symbol })}
          />
        </SwipeableRow>
      );
    },
    [navigation, removeItem],
  );

  const renderListHeader = useCallback(
    () => (
      <>
        <WatchlistHeader
          title="My Watchlist"
          onAddStock={() => navigation.navigate('Search')}
        />
        <WatchlistSearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <WatchlistFilterChips activeChip={activeChip} onChipChange={setActiveChip} />
      </>
    ),
    [searchQuery, activeChip, navigation],
  );

  if (isActuallyLoading) {
    return (
      <View style={[styles.shell, { paddingTop: insets.top }]}>
        <View style={styles.headerLoading}>
          <Text style={styles.titleLoading}>My Watchlist</Text>
        </View>
        <ActivityIndicator color={palette.primary} size="small" />
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.shell}>
        {renderListHeader()}
        <ErrorWatchlistState message={error} onRetry={refresh} />
      </View>
    );
  }

  // Show overlimit modal when watchlist is over limit
  // This overrides the normal list to force user to trim
  if (overLimit && !isActuallyLoading) {
    return (
      <View style={styles.shell}>
        <View style={{ paddingTop: insets.top }}>
          {renderListHeader()}
        </View>
        <View style={styles.overlimitNotice}>
          <Text style={styles.overlimitNoticeTitle}>
            Watchlist limit reached
          </Text>
          <Text style={styles.overlimitNoticeBody}>
            Your current plan allows up to {limit} stocks. Please trim your
            watchlist to continue.
          </Text>
        </View>

        <WatchlistOverlimitModal
          open={showOverlimitModal || overLimit}
          items={overlimitItems}
          limit={limit}
          onTrimSuccess={handleTrimSuccess}
          onTrimItems={handleTrimItems}
          isTrimming={isTrimming}
          onBackToDashboard={() => navigation.navigate('Dashboard')}
        />
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <FlatList
        contentContainerStyle={{ paddingBottom: spacing.lg, paddingHorizontal: spacing.md, paddingTop: insets.top }}
        data={filteredItems}
        ItemSeparatorComponent={ListSeparator}
        keyExtractor={(item) => item.watchlist_id ?? item.stock.symbol}
        ListEmptyComponent={<EmptyWatchlistState />}
        ListHeaderComponent={renderListHeader}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={isLoading}
            tintColor={palette.primary}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
      />

      <WatchlistOverlimitModal
        open={showOverlimitModal && !overLimit}
        items={overlimitItems}
        limit={limit}
        onTrimSuccess={handleTrimSuccess}
        onTrimItems={handleTrimItems}
        isTrimming={isTrimming}
        onBackToDashboard={() => navigation.navigate('Dashboard')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: palette.background,
    flex: 1,
  },
  headerLoading: {
    paddingHorizontal: spacing.md,
  },
  titleLoading: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  separator: {
    backgroundColor: palette.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md,
  },
  emptyShell: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  emptyBody: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryLink: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  overlimitNotice: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  overlimitNoticeTitle: {
    color: palette.warning,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  overlimitNoticeBody: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
