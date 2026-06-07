import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';

type ProfileSectionProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export function ProfileSection({ children, description, title }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  header: {
    gap: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
});
