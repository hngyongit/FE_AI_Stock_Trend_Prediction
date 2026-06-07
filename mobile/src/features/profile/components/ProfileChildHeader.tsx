import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';

type ProfileChildHeaderProps = {
  onBack: () => void;
  subtitle: string;
  title: string;
};

export function ProfileChildHeader({ onBack, subtitle, title }: ProfileChildHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <ArrowLeft color={palette.textPrimary} size={18} />
        </Pressable>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  shell: {
    backgroundColor: palette.background,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
});
