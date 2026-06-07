import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LockKeyhole, LogOut, UserRoundPen } from 'lucide-react-native';

import type { MainTabScreenProps } from '@/app/navigation/navigation.types';
import { Text } from '@/shared/ui';
import { clearPersistedSession } from '@/shared/services/tokenStorage';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { logoutCurrentSession } from '@/features/auth/services/auth.service';
import { LogoutConfirmModal } from '@/features/profile/components/LogoutConfirmModal';
import { ProfileHeaderCard } from '@/features/profile/components/ProfileHeaderCard';
import { ProfileRow } from '@/features/profile/components/ProfileRow';
import { ProfileScreenHeader } from '@/features/profile/components/ProfileScreenHeader';
import { ProfileSection } from '@/features/profile/components/ProfileSection';
import { ProfileSkeleton } from '@/features/profile/components/ProfileSkeleton';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useAuthStore } from '@/stores/auth.store';

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();
  const clearSession = useAuthStore((state) => state.clearSession);
  const session = useAuthStore((state) => state.session);
  const sessionUser = useAuthStore((state) => state.session?.user);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleUnauthorized = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const { error, isLoading, isRefreshing, profile, refresh, retry } = useProfile({
    onUnauthorized: handleUnauthorized,
  });
  const effectiveProfile = profile ?? sessionUser ?? null;
  const showSkeleton = isLoading && !effectiveProfile;

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    try {
      if (session?.accessToken) {
        await logoutCurrentSession(session.accessToken);
      }
    } catch {
      // Clear local auth state even if the remote logout request fails.
    }

    await clearPersistedSession();
    clearSession();
  }, [clearSession, session]);

  const openEditPanel = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const openPasswordPanel = useCallback(() => {
    navigation.navigate('ChangePassword');
  }, [navigation]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.shell}>
        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingBottom: spacing.xl + insets.bottom,
              paddingTop: insets.top + spacing.sm,
            },
          ]}
          refreshControl={
            <RefreshControl
              onRefresh={refresh}
              refreshing={isRefreshing}
              tintColor={palette.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}>
          <ProfileScreenHeader status={effectiveProfile?.status} />

          {showSkeleton ? <ProfileSkeleton /> : null}

          {!showSkeleton ? (
            <View style={styles.sections}>
              <ProfileHeaderCard profile={effectiveProfile} />

              {error ? (
                <View style={styles.inlineError}>
                  <Text style={styles.inlineErrorText}>
                    {error}
                  </Text>
                  <Pressable accessibilityRole="button" onPress={retry}>
                    <Text style={styles.inlineRetryText}>Retry</Text>
                  </Pressable>
                </View>
              ) : null}

              <ProfileSection
                description="Account actions"
                title="Actions">
                <View style={styles.group}>
                  <ProfileRow
                    centered
                    icon={UserRoundPen}
                    label="Edit user information"
                    onPress={openEditPanel}
                    showChevron={false}
                  />
                  <ProfileRow
                    centered
                    icon={LockKeyhole}
                    label="Change password"
                    onPress={openPasswordPanel}
                    showChevron={false}
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={1}
                    onPress={() => setShowLogoutModal(true)}
                    style={styles.logoutButton}>
                    <LogOut color={palette.negative} size={18} />
                    <Text style={styles.logoutText}>Log out</Text>
                  </TouchableOpacity>
                </View>
              </ProfileSection>
            </View>
          ) : null}
        </ScrollView>
      </View>

      <LogoutConfirmModal
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          void handleLogout();
        }}
        visible={showLogoutModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  inlineError: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inlineErrorText: {
    color: palette.textSecondary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  inlineRetryText: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  logoutButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: '#2B1316',
    borderColor: '#EF4444',
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    width: '100%',
  },
  logoutText: {
    color: palette.negative,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  scrollView: {
    backgroundColor: palette.background,
    flex: 1,
  },
  sections: {
    gap: spacing.lg,
  },
  shell: {
    backgroundColor: palette.background,
    flex: 1,
  },
});
