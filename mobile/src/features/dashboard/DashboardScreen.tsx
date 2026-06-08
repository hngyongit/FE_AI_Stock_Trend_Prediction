import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import type { MainTabScreenProps } from '@/app/navigation/navigation.types';

export function DashboardScreen() {
  const navigation = useNavigation<MainTabScreenProps<'Dashboard'>['navigation']>();

  return (
    <View style={styles.shell}>
      <DashboardHeader onNotificationPress={() => navigation.navigate('Alerts')} />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Dashboard</Text>
        <Text style={styles.title}>Market overview</Text>
        <Text style={styles.body}>
          Main operational dashboard modules will appear here.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('StockDetail', { symbol: 'FPT' })}
          style={styles.stockCard}>
          <View>
            <Text style={styles.stockSymbol}>FPT</Text>
            <Text style={styles.stockName}>FPT CORPORATION</Text>
          </View>
          <Text style={styles.stockAction}>View</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: palette.background,
    flex: 1,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  eyebrow: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.84,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  body: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: '90%',
  },
  stockAction: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  stockCard: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    padding: spacing.md,
  },
  stockName: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  stockSymbol: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
});
