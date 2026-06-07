import { View } from 'react-native';

import { Card, Skeleton } from '@/shared/ui/primitives';
import { palette, radius, spacing } from '@/shared/design/tokens';

export function LoadingSkeleton() {
  return (
    <View style={{ gap: spacing.md }}>
      <Card style={styles.skeletonCard}>
        <Skeleton style={styles.skeletonHero} />
        <Skeleton style={styles.skeletonLineShort} />
        <Skeleton style={styles.skeletonLineLong} />
      </Card>
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} style={styles.skeletonMetric}>
            <Skeleton style={styles.skeletonMetricTitle} />
            <Skeleton style={styles.skeletonMetricValue} />
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = {
  skeletonCard: {
    backgroundColor: palette.surfaceLow,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  } as const,
  skeletonHero: {
    borderRadius: radius.card,
    height: 140,
    width: '100%',
  } as const,
  skeletonLineShort: {
    borderRadius: radius.control,
    height: 14,
    width: '34%',
  } as const,
  skeletonLineLong: {
    borderRadius: radius.control,
    height: 12,
    width: '78%',
  } as const,
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  } as const,
  skeletonMetric: {
    backgroundColor: palette.surfaceLow,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexBasis: '47%',
    gap: spacing.sm,
    padding: spacing.md,
  } as const,
  skeletonMetricTitle: {
    borderRadius: radius.control,
    height: 11,
    width: '48%',
  } as const,
  skeletonMetricValue: {
    borderRadius: radius.control,
    height: 22,
    width: '62%',
  } as const,
};