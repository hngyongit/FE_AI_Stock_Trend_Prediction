import { StyleSheet, View } from 'react-native';

import { DashboardSection } from '@/features/dashboard/components/DashboardSection';
import type { DashboardMarketLeaderItem } from '@/features/dashboard/types';
import { Card, StockListItem, Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

type DashboardMoversSectionProps = {
  gainers: DashboardMarketLeaderItem[];
  losers: DashboardMarketLeaderItem[];
  onSelectSymbol: (symbol: string) => void;
};

export function DashboardMoversSection({
  gainers,
  losers,
  onSelectSymbol,
}: DashboardMoversSectionProps) {
  return (
    <DashboardSection
      subtitle="Strongest and weakest names in the latest market leader snapshot"
      title="Top movers">
      <View style={styles.grid}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Top gainers</Text>
          {gainers.slice(0, 3).map((item) => (
            <StockListItem
              companyName={item.company_name}
              exchangeCode="HOSE"
              key={`gainer-${item.symbol}`}
              onPress={() => onSelectSymbol(item.symbol)}
              price={item.close_price}
              priceChange={item.price_change}
              priceChangePercent={item.price_change_percent}
              symbol={item.symbol}
              volume={item.volume}
            />
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Top losers</Text>
          {losers.slice(0, 3).map((item) => (
            <StockListItem
              companyName={item.company_name}
              exchangeCode="HOSE"
              key={`loser-${item.symbol}`}
              onPress={() => onSelectSymbol(item.symbol)}
              price={item.close_price}
              priceChange={item.price_change}
              priceChangePercent={item.price_change_percent}
              symbol={item.symbol}
              volume={item.volume}
            />
          ))}
        </Card>
      </View>
    </DashboardSection>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: spacing.sm,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
});
