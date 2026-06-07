import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Card, Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

type ProfileRowProps = {
  accent?: 'default' | 'danger';
  centered?: boolean;
  description?: string;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  value?: string;
};

export function ProfileRow({
  accent = 'default',
  centered = false,
  description,
  disabled = false,
  icon: Icon,
  label,
  onPress,
  showChevron = true,
  value,
}: ProfileRowProps) {
  const iconColor =
    accent === 'danger'
      ? palette.negative
      : disabled
        ? palette.offline
        : palette.textSecondary;
  const labelColor = accent === 'danger' ? palette.negative : palette.textPrimary;
  const valueColor = accent === 'danger' ? palette.negative : palette.textSecondary;
  const chevronColor =
    accent === 'danger'
      ? palette.negative
      : disabled
        ? palette.offline
        : palette.textSecondary;

  const content = (
    <View style={[styles.row, centered && styles.rowCentered, disabled && styles.rowDisabled]}>
      <View style={[styles.leading, centered && styles.leadingCentered]}>
        <View style={[styles.iconShell, centered && styles.iconShellCentered]}>
          <Icon color={iconColor} size={18} />
        </View>
        <View style={[styles.copy, centered && styles.copyCentered]}>
          <Text style={[styles.label, centered && styles.labelCentered, { color: labelColor }]}>
            {label}
          </Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      </View>
      <View style={[styles.trailing, centered && styles.trailingCentered]}>
        {value ? <Text style={[styles.value, { color: valueColor }]}>{value}</Text> : null}
        {showChevron ? (
          <ChevronRight color={chevronColor} size={18} />
        ) : null}
      </View>
    </View>
  );

  return (
    <Card style={styles.card}>
      {disabled || !onPress ? (
        content
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          accessibilityRole="button"
          onPress={onPress}
          style={styles.pressable}>
          {content}
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  copyCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  iconShell: {
    alignItems: 'center',
    backgroundColor: palette.elevated,
    borderRadius: radius.control,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  iconShellCentered: {
    left: 0,
    position: 'absolute',
  },
  label: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  labelCentered: {
    textAlign: 'center',
  },
  leading: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  leadingCentered: {
    justifyContent: 'center',
  },
  pressable: {
    minHeight: 56,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowCentered: {
    justifyContent: 'center',
  },
  rowDisabled: {
    opacity: 0.7,
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trailingCentered: {
    position: 'absolute',
    right: spacing.md,
  },
  value: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
