import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing } from '@/shared/design/tokens';

type StatusBadgeProps = {
  label: string;
  tone?: 'neutral' | 'up' | 'down' | 'warning' | 'primary';
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const color =
    tone === 'up'
      ? palette.up
      : tone === 'down'
        ? palette.down
        : tone === 'warning'
          ? palette.warning
          : tone === 'primary'
            ? palette.primary
            : palette.textMuted;

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
