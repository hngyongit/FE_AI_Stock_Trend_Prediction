import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

function ProfileStatusChip({ status }: { status?: string }) {
  if (!status) {
    return null;
  }

  const tone =
    status === 'ACTIVE'
      ? { borderColor: palette.positive, textColor: palette.positive }
      : status === 'INACTIVE'
        ? { borderColor: palette.warning, textColor: palette.warning }
        : status === 'LOCKED' || status === 'BLOCKED'
          ? { borderColor: palette.negative, textColor: palette.negative }
          : { borderColor: palette.warning, textColor: palette.warning };

  return (
    <View style={[styles.statusChip, { borderColor: tone.borderColor }]}>
      <Text style={[styles.statusChipText, { color: tone.textColor }]}>{status}</Text>
    </View>
  );
}

export function ProfileScreenHeader({ status }: { status?: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Account &amp; app preferences</Text>
      </View>
      <ProfileStatusChip status={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  statusChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
});
