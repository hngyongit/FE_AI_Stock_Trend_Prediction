import { BellPlus, PlusCircle } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

export function ActionButtons() {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" style={styles.primaryButton}>
        <BellPlus color={palette.textPrimary} size={18} />
        <Text style={styles.primaryText}>Create Alert</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.secondaryButton}>
        <PlusCircle color={palette.textPrimary} size={18} />
        <Text style={styles.secondaryText}>Add to Watchlist</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: radius.control,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 44,
    justifyContent: 'center',
  },
  primaryText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: radius.control,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 44,
    justifyContent: 'center',
  },
  secondaryText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
