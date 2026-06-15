import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';

type DashboardSectionProps = {
  children: ReactNode;
  subtitle: string;
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function DashboardSection({
  children,
  subtitle,
  title,
  actionLabel,
  onActionPress,
}: DashboardSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {actionLabel && onActionPress ? (
          <TouchableOpacity activeOpacity={0.82} onPress={onActionPress}>
            <Text style={styles.action}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  action: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
