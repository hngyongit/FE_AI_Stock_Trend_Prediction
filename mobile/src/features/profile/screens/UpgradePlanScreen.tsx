import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bolt, Crown, ShieldCheck, Star, TrendingUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootScreenProps } from '@/app/navigation/navigation.types';
import { clearPersistedSession } from '@/shared/services/tokenStorage';
import { Card, Text, useToast } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { useAuthStore } from '@/stores/auth.store';
import { useProfile } from '@/features/profile/hooks/useProfile';
import {
  createSubscriptionPayment,
  openSubscriptionCheckout,
  SubscriptionRequestError,
} from '@/features/profile/services/subscription.service';

const BENEFITS = [
  {
    icon: Crown,
    text: 'Expand your watchlist from 5 stocks to 50 stocks.',
  },
  {
    icon: TrendingUp,
    text: 'Unlock premium workflows and deeper stock-following capability.',
  },
  {
    icon: ShieldCheck,
    text: 'Keep your plan status synced directly from the backend subscription service.',
  },
];

function isActivePro(plan?: string, status?: string) {
  return plan === 'PRO' && status === 'ACTIVE';
}

function formatExpiry(value?: string | null) {
  if (!value) {
    return 'No active expiry date';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'No active expiry date';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function UpgradePlanScreen({ navigation }: RootScreenProps<'UpgradePlan'>) {
  const { showToast } = useToast();
  const clearSession = useAuthStore((state) => state.clearSession);
  const session = useAuthStore((state) => state.session);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnauthorized = useCallback(() => {
    clearSession();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [clearSession, navigation]);

  const { error, isLoading, profile, refresh, retry } = useProfile({
    onUnauthorized: handleUnauthorized,
  });

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const effectiveProfile = profile ?? session?.user ?? null;
  const activePro = isActivePro(
    effectiveProfile?.plan,
    effectiveProfile?.subscription_status,
  );

  const planLabel = useMemo(() => {
    if (activePro) {
      return 'PRO active';
    }

    return effectiveProfile?.plan === 'PRO' ? 'PRO pending' : 'FREE plan';
  }, [activePro, effectiveProfile?.plan]);

  const handleUpgrade = useCallback(async () => {
    const accessToken = useAuthStore.getState().session?.accessToken;

    if (!accessToken) {
      await clearPersistedSession();
      clearSession();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payment = await createSubscriptionPayment(accessToken);
      showToast(
        'Redirecting to payment',
        'The PayOS checkout page is opening in your browser.',
        'info',
      );
      await openSubscriptionCheckout(payment.checkoutUrl);
      void refresh();
    } catch (error) {
      if (error instanceof SubscriptionRequestError && error.status === 401) {
        await clearPersistedSession();
        clearSession();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to start the upgrade flow right now.';

      showToast('Upgrade unavailable', message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [clearSession, navigation, refresh, showToast]);

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: spacing.xl,
            paddingTop: spacing.sm,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Card style={styles.hero}>
          <View style={styles.heroGlowPrimary} />
          <View style={styles.heroGlowSecondary} />
          <View style={styles.heroBadge}>
            <Crown color="#F8FAFC" size={20} />
          </View>
          <Text style={styles.heroEyebrow}>AI Stock Trend Pro</Text>
          <Text style={styles.heroTitle}>See the benefits and upgrade in one tap</Text>
          <Text style={styles.heroBody}>
            This mobile page is built for user accounts that want a clear PRO offer and a direct upgrade button.
          </Text>

          <View style={styles.planRow}>
            <View style={styles.planChip}>
              <Star color="#FCD34D" size={14} />
              <Text style={styles.planChipText}>{planLabel}</Text>
            </View>
            <Text style={styles.price}>50,000 VND / 30 days</Text>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>PRO benefits</Text>
          <View style={styles.benefitList}>
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <View key={benefit.text} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Icon color={palette.primarySoft} size={18} />
                  </View>
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Current subscription</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan</Text>
            <Text style={styles.summaryValue}>{effectiveProfile?.plan ?? 'FREE'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text style={styles.summaryValue}>{effectiveProfile?.subscription_status ?? 'NONE'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expires on</Text>
            <Text style={styles.summaryValue}>{formatExpiry(effectiveProfile?.subscription_expires_at)}</Text>
          </View>
          {error ? (
            <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry loading account data</Text>
            </Pressable>
          ) : null}
        </Card>

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting || isLoading || activePro}
          onPress={() => {
            void handleUpgrade();
          }}
          style={({ pressed }) => [
            styles.upgradeButton,
            (pressed || isSubmitting) && styles.upgradeButtonPressed,
            (isLoading || activePro) && styles.upgradeButtonDisabled,
          ]}>
          {isSubmitting ? (
            <ActivityIndicator color={palette.textPrimary} size="small" />
          ) : (
            <View style={styles.upgradeContent}>
              <Bolt color={palette.textPrimary} size={18} />
              <Text style={styles.upgradeText}>
                {activePro ? 'Your PRO plan is already active' : 'Upgrade to PRO'}
              </Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  backButtonText: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  benefitIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  benefitList: {
    gap: spacing.md,
  },
  benefitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  benefitText: {
    color: palette.textPrimary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  hero: {
    backgroundColor: '#1D4ED8',
    borderColor: '#60A5FA',
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.md,
    position: 'relative',
  },
  heroBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  heroBody: {
    color: '#DBEAFE',
    fontSize: 14,
    lineHeight: 20,
  },
  heroEyebrow: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  heroGlowPrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 140,
    height: 180,
    position: 'absolute',
    right: -65,
    top: -55,
    width: 180,
  },
  heroGlowSecondary: {
    backgroundColor: 'rgba(191, 219, 254, 0.12)',
    borderRadius: 120,
    bottom: -50,
    height: 140,
    position: 'absolute',
    right: 50,
    width: 140,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  planChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.26)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  planChipText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  planRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  price: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.control,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  retryText: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  summaryLabel: {
    color: palette.textSecondary,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  summaryValue: {
    color: palette.textPrimary,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'right',
  },
  upgradeButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: radius.card,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonPressed: {
    opacity: 0.88,
  },
  upgradeContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  upgradeText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
});
