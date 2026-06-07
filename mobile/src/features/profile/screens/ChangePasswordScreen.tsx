import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootScreenProps } from '@/app/navigation/navigation.types';
import { ProfileChildHeader } from '@/features/profile/components/ProfileChildHeader';
import {
  changePassword,
  ProfileRequestError,
} from '@/features/profile/services/profile.service';
import { Text, Card } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { useAuthStore } from '@/stores/auth.store';

export function ChangePasswordScreen({ navigation }: RootScreenProps<'ChangePassword'>) {
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      currentPassword.trim().length > 0 &&
      newPassword.trim().length >= 8 &&
      newPassword === confirmPassword,
    [confirmPassword, currentPassword, newPassword],
  );

  const returnToProfile = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSubmit = useCallback(async () => {
    if (!session?.accessToken) {
      clearSession();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    if (!canSubmit) {
      setError('Please make sure the new password is at least 8 characters and matches.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await changePassword(session.accessToken, currentPassword, newPassword);
      returnToProfile();
    } catch (error) {
      if (error instanceof ProfileRequestError && error.status === 401) {
        clearSession();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      setError(error instanceof Error ? error.message : 'Unable to change password right now.');
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, clearSession, currentPassword, navigation, newPassword, returnToProfile, session]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safeArea}>
        <ProfileChildHeader
          onBack={returnToProfile}
          subtitle="Use your current password before setting a new one"
          title="Change Password"
        />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}>
          <Card style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>CURRENT PASSWORD</Text>
              <TextInput
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={palette.textSecondary}
                secureTextEntry
                style={styles.input}
                value={currentPassword}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>NEW PASSWORD</Text>
              <TextInput
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={palette.textSecondary}
                secureTextEntry
                style={styles.input}
                value={newPassword}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
              <TextInput
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor={palette.textSecondary}
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => {
                void handleSubmit();
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSubmitting) && styles.primaryButtonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Updating...' : 'Update password'}
              </Text>
            </Pressable>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  content: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    color: palette.negative,
    fontSize: 12,
    lineHeight: 16,
  },
  field: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: radius.control,
    borderWidth: 1,
    color: palette.textPrimary,
    fontSize: 14,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  label: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: radius.control,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  scrollView: {
    backgroundColor: palette.background,
    flex: 1,
  },
});
