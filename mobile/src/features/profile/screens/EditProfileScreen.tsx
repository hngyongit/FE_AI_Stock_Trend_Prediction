import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootScreenProps } from '@/app/navigation/navigation.types';
import type { AuthSession } from '@/features/auth/types';
import { ProfileChildHeader } from '@/features/profile/components/ProfileChildHeader';
import { ProfileRequestError, updateProfile } from '@/features/profile/services/profile.service';
import { persistRememberedSession } from '@/shared/services/tokenStorage';
import { Card, Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { useAuthStore } from '@/stores/auth.store';

export function EditProfileScreen({ navigation }: RootScreenProps<'EditProfile'>) {
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [fullName, setFullName] = useState(session?.user.full_name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => fullName.trim().length >= 2, [fullName]);

  const returnToProfile = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(async () => {
    if (!session?.accessToken) {
      clearSession();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    if (!canSubmit) {
      setError('Full name must be between 2 and 100 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const user = await updateProfile(session.accessToken, fullName);
      const nextSession: AuthSession = {
        ...session,
        user: {
          id: user.id ?? session.user.id,
          email: user.email ?? session.user.email,
          full_name: user.full_name ?? session.user.full_name,
          role: (user.role as AuthSession['user']['role']) ?? session.user.role,
          status: user.status ?? session.user.status,
        },
      };

      setSession(nextSession);
      await persistRememberedSession(nextSession);
      returnToProfile();
    } catch (error) {
      if (error instanceof ProfileRequestError && error.status === 401) {
        clearSession();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      setError(error instanceof Error ? error.message : 'Unable to update profile right now.');
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, clearSession, fullName, navigation, returnToProfile, session, setSession]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safeArea}>
        <ProfileChildHeader
          onBack={returnToProfile}
          subtitle="Update the name shown on your account"
          title="Edit Profile"
        />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}>
          <Card style={styles.card}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={palette.textSecondary}
              style={styles.input}
              value={fullName}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => {
                void handleSave();
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSubmitting) && styles.primaryButtonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
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
