import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

export function ProfileErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>Unable to load profile</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBody: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  errorTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.primary,
    borderRadius: radius.control,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  retryButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
