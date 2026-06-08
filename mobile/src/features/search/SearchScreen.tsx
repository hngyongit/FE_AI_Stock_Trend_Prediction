import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet } from 'react-native';

import type { MainTabScreenProps } from '@/app/navigation/navigation.types';
import { Text } from '@/shared/ui';
import { FeaturePlaceholderScreen } from '@/shared/ui/components/FeaturePlaceholderScreen';
import { palette, radius, spacing } from '@/shared/design/tokens';

export function SearchScreen() {
  const navigation = useNavigation<MainTabScreenProps<'Search'>['navigation']>();

  return (
    <FeaturePlaceholderScreen
      body="Ticker search, instrument lookup, and quick command navigation can slot into this surface without disturbing the protected app frame."
      eyebrow="Search"
      footer={
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('StockDetail', { symbol: 'FPT' })}
          style={styles.footerButton}>
          <Text style={styles.footerButtonText}>Open FPT Detail</Text>
        </Pressable>
      }
      title="Discovery console"
    />
  );
}

const styles = StyleSheet.create({
  footerButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: radius.control,
    height: 44,
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  footerButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
