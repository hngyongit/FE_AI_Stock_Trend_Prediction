import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

function SkeletonRow() {
  return (
    <Card style={styles.listCard}>
      <View style={styles.row}>
        <Skeleton style={styles.icon} />
        <View style={styles.copy}>
          <Skeleton style={styles.lineShort} />
          <Skeleton style={styles.lineLong} />
        </View>
      </View>
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.shell}>
      <Card style={styles.heroCard}>
        <View style={styles.headerRow}>
          <Skeleton style={styles.avatar} />
          <View style={styles.copy}>
            <Skeleton style={styles.name} />
            <Skeleton style={styles.lineLong} />
            <View style={styles.badges}>
              <Skeleton style={styles.badge} />
              <Skeleton style={styles.badge} />
            </View>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Skeleton style={styles.metaLine} />
          <Skeleton style={styles.metaLine} />
        </View>
      </Card>

      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: radius.pill,
    height: 56,
    width: 56,
  },
  badge: {
    borderRadius: radius.pill,
    height: 22,
    width: 72,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  icon: {
    borderRadius: radius.control,
    height: 36,
    width: 36,
  },
  lineLong: {
    borderRadius: radius.control,
    height: 14,
    width: '72%',
  },
  lineShort: {
    borderRadius: radius.control,
    height: 14,
    width: '48%',
  },
  listCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
  },
  metaLine: {
    borderRadius: radius.control,
    height: 14,
    width: '42%',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  name: {
    borderRadius: radius.control,
    height: 20,
    width: '56%',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shell: {
    gap: spacing.md,
  },
});
