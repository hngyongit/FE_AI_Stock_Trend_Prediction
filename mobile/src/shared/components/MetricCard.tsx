import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing } from '@/shared/design/tokens';

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'up' | 'down' | 'warning';
};

export function MetricCard({ label, value, detail, tone = 'neutral' }: MetricCardProps) {
  const toneColor =
    tone === 'up' ? palette.up : tone === 'down' ? palette.down : tone === 'warning' ? palette.warning : palette.textMuted;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={[styles.detail, { color: toneColor }]}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    gap: spacing.xs,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    backgroundColor: palette.surface,
    padding: spacing.md,
  },
  label: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  detail: {
    fontSize: 12,
    fontWeight: '500',
  },
});
