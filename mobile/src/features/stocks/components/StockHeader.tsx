import { ArrowLeft, Share2, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';
import { useToggleWatchlist } from '@/features/stocks/hooks/useToggleWatchlist';

type StockHeaderProps = {
  companyName: string;
  onBack: () => void;
  symbol: string;
};

export function StockHeader({ companyName, onBack, symbol }: StockHeaderProps) {
  const { isWatched, toggle } = useToggleWatchlist(symbol);

  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.iconButton}>
        <ArrowLeft color={palette.textPrimary} size={22} />
      </Pressable>
      <View style={styles.titleBlock}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text numberOfLines={1} style={styles.company}>
          {companyName}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityHint={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          accessibilityRole="button"
          onPress={toggle}
          style={styles.iconButton}>
          <Star
            color={isWatched ? palette.warning : palette.textSecondary}
            fill={isWatched ? palette.warning : 'none'}
            size={20}
          />
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.iconButton}>
          <Share2 color={palette.textSecondary} size={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
  },
  company: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    lineHeight: 14,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  symbol: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'center',
  },
  titleBlock: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
});
