import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { Card } from '../../../components/ui/card';
import { Text } from '../../../components/ui/text';
import { AppScreen } from '@/shared/components/AppScreen';
import { palette, radius, spacing } from '@/shared/design/tokens';

type FeaturePlaceholderScreenProps = {
  body: string;
  eyebrow: string;
  footer?: ReactNode;
  title: string;
};

export function FeaturePlaceholderScreen({
  body,
  eyebrow,
  footer,
  title,
}: FeaturePlaceholderScreenProps) {
  return (
    <AppScreen footer={footer}>
      <Card style={styles.card}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surfaceLow,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    minHeight: 220,
    padding: spacing.md,
  },
  eyebrow: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.84,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: spacing.sm,
  },
  body: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
    maxWidth: '90%',
  },
});
