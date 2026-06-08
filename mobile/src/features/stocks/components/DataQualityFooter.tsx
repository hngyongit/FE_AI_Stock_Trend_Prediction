import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';

type DataQualityFooterProps = {
  fetchedAt: Date | null;
  lastUpdated: string | null;
};

export function DataQualityFooter({ fetchedAt, lastUpdated }: DataQualityFooterProps) {
  const timestamp = lastUpdated ?? fetchedAt?.toLocaleString() ?? '--';

  return (
    <View style={styles.card}>
      <View style={styles.item}>
        <Text style={styles.label}>Source</Text>
        <Text style={styles.value}>HOSE</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>Stable</Text>
      </View>
      <View style={styles.itemWide}>
        <Text style={styles.label}>Last updated</Text>
        <Text style={styles.value}>{timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.md,
    padding: spacing.md,
    rowGap: spacing.sm,
  },
  item: {
    gap: spacing.xs,
    width: '50%',
  },
  itemWide: {
    gap: spacing.xs,
    width: '100%',
  },
  label: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  status: {
    color: palette.positive,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  value: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
