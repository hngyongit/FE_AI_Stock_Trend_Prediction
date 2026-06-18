import { ArrowRight, Crown, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import type { UserProfile } from '@/features/profile/types';

function isActivePro(profile: UserProfile | null) {
  return profile?.plan === 'PRO' && profile?.subscription_status === 'ACTIVE';
}

function formatExpiry(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function ProfileUpgradeCard({
  onPress,
  profile,
}: {
  onPress: () => void;
  profile: UserProfile | null;
}) {
  const activePro = isActivePro(profile);
  const expiry = formatExpiry(profile?.subscription_expires_at);

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.card, activePro ? styles.cardPro : styles.cardFree, pressed && styles.pressed]}>
          <View style={[styles.glowOne, !pressed && styles.glowHidden]} />
          <View style={[styles.glowTwo, !pressed && styles.glowHidden]} />

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Crown color="#F8FAFC" size={18} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.eyebrow}>{activePro ? 'PRO active' : 'Go Pro'}</Text>
              <Text style={styles.title}>
                {activePro ? 'Premium benefits are unlocked' : 'Unlock the Pro plan from your profile'}
              </Text>
            </View>
            <ArrowRight color="#F8FAFC" size={18} />
          </View>

          <Text style={styles.body}>
            {activePro
              ? `Your PRO plan is active${expiry ? ` until ${expiry}` : ''}. Tap to review benefits and payment details.`
              : 'Tap to see PRO benefits, pricing, and a one-step upgrade button for mobile users.'}
          </Text>

          <View style={styles.chips}>
            <View style={styles.chip}>
              <Sparkles color="#FCD34D" size={14} />
              <Text style={styles.chipText}>50-stock watchlist</Text>
            </View>
            <View style={styles.chip}>
              <Sparkles color="#93C5FD" size={14} />
              <Text style={styles.chipText}>Premium access</Text>
            </View>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    color: '#DBEAFE',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.md,
    position: 'relative',
  },
  cardFree: {
    backgroundColor: '#1D4ED8',
    borderColor: '#60A5FA',
  },
  cardPro: {
    backgroundColor: '#312E81',
    borderColor: '#A78BFA',
  },
  chip: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  chipText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  glowOne: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.pill,
    height: 150,
    opacity: 1,
    position: 'absolute',
    right: -50,
    top: -40,
    width: 150,
  },
  glowHidden: {
    opacity: 0,
  },
  glowTwo: {
    backgroundColor: 'rgba(191, 219, 254, 0.12)',
    borderRadius: radius.pill,
    height: 130,
    left: -40,
    opacity: 1,
    position: 'absolute',
    top: 60,
    width: 130,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.26)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 12,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  pressed: {
    opacity: 0.92,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
});
