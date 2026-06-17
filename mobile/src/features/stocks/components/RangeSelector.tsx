import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import type { StockTimeframe } from '@/features/stocks/types';
import {
  timeframeOptions,
  timeframeLabels,
} from '@/features/stocks/utils/stockDetailCalculations';

type RangeSelectorProps = {
  active: StockTimeframe;
  onChange: (timeframe: StockTimeframe) => void;
};

export function RangeSelector({ active, onChange }: RangeSelectorProps) {
  return (
    <View style={styles.shell}>
      {timeframeOptions.map((timeframe) => {
        const isActive = timeframe === active;

        return (
          <Pressable
            accessibilityRole="button"
            key={timeframe}
            onPress={() => onChange(timeframe)}
            style={[styles.option, isActive && styles.optionActive]}>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {timeframeLabels[timeframe]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  labelActive: {
    color: palette.textPrimary,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.control,
    flex: 1,
    height: 36,
    justifyContent: 'center',
  },
  optionActive: {
    backgroundColor: palette.elevated,
    borderColor: palette.primary,
    borderWidth: 1,
  },
  shell: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    padding: spacing.xs,
  },
});
