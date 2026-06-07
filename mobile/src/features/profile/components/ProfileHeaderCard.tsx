import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import type { UserProfile } from '@/features/profile/types';

function getFallbackValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : '--';
}

function getInitials(fullName?: string) {
  const safeName = fullName?.trim();
  if (!safeName) {
    return '--';
  }

  const initials = safeName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || '--';
}

function getStatusTone(status?: string) {
  if (status === 'ACTIVE') {
    return {
      borderColor: palette.positive,
      textColor: palette.positive,
    };
  }

  if (status === 'INACTIVE') {
    return {
      borderColor: palette.warning,
      textColor: palette.warning,
    };
  }

  if (status === 'LOCKED' || status === 'BLOCKED') {
    return {
      borderColor: palette.negative,
      textColor: palette.negative,
    };
  }

  return {
    borderColor: palette.warning,
    textColor: palette.warning,
  };
}

function formatCreatedDate(value?: string) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function ProfileBadge({
  label,
  tone,
}: {
  label: string;
  tone: { borderColor: string; textColor: string };
}) {
  return (
    <View style={[styles.badge, { borderColor: tone.borderColor }]}>
      <Text style={[styles.badgeText, { color: tone.textColor }]}>{label}</Text>
    </View>
  );
}

export function ProfileHeaderCard({ profile }: { profile: UserProfile | null }) {
  const statusValue = getFallbackValue(profile?.status);
  const statusTone = getStatusTone(profile?.status);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(profile?.full_name)}</Text>
        </View>
        <View style={styles.identity}>
          <Text style={styles.name}>{getFallbackValue(profile?.full_name)}</Text>
          <Text style={styles.email}>{getFallbackValue(profile?.email)}</Text>
          <View style={styles.badges}>
            <ProfileBadge
              label={getFallbackValue(profile?.role)}
              tone={{ borderColor: palette.primary, textColor: palette.primary }}
            />
            <ProfileBadge label={statusValue} tone={statusTone} />
          </View>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Created</Text>
          <Text style={styles.metaValue}>{formatCreatedDate(profile?.created_at)}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  badge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  email: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  identity: {
    flex: 1,
    gap: spacing.sm,
  },
  metaItem: {
    flex: 1,
    gap: spacing.xs,
  },
  metaLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    borderTopColor: palette.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
  },
  metaValue: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  name: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
