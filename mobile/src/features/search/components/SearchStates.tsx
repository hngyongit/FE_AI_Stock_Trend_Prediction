import { StyleSheet, View } from 'react-native';

import { palette, spacing } from '@/shared/design/tokens';
import { Text } from '@/shared/ui';

export function EmptySearchState({ query }: { query: string }) {
  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.emptyShell}>
      <Text style={styles.emptyTitle}>
        {hasQuery ? 'No matching stocks found' : 'Browse trending opportunities above'}
      </Text>
      <Text style={styles.emptyBody}>
        {hasQuery
          ? 'Try another ticker, company name, or market keyword.'
          : 'Use the search field to jump directly into a stock detail screen.'}
      </Text>
    </View>
  );
}

export function ErrorSearchState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.emptyShell}>
      <Text style={styles.emptyTitle}>Could not load search data</Text>
      <Text style={styles.emptyBody}>{message}</Text>
      <Text onPress={onRetry} style={styles.retryLink}>
        Tap to retry
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyShell: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: 44,
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyBody: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryLink: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
