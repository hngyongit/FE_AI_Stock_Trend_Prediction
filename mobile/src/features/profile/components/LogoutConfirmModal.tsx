import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

type LogoutConfirmModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  visible: boolean;
};

export function LogoutConfirmModal({
  onCancel,
  onConfirm,
  visible,
}: LogoutConfirmModalProps) {
  return (
    <Modal animationType="fade" visible={visible} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Log out?</Text>
          <Text style={styles.body}>
            You will need to sign in again to access your watchlist and market dashboard.
          </Text>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.dangerButton}>
              <Text style={styles.dangerButtonText}>Log out</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  body: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: palette.negative,
    borderRadius: radius.control,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  dangerButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: radius.control,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  sheet: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
    width: '100%',
  },
  title: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
});
