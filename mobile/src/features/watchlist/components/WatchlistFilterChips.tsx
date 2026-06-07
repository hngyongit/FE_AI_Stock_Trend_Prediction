import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

type Chip = {
    key: string;
    label: string;
};

const FILTER_CHIPS: Chip[] = [
    { key: 'all', label: 'All' },
    { key: 'gainers', label: 'Gainers' },
    { key: 'losers', label: 'Losers' },
    { key: 'hose', label: 'HOSE' },
];

type WatchlistFilterChipsProps = {
    activeChip: string;
    onChipChange: (key: string) => void;
};

export function WatchlistFilterChips({ activeChip, onChipChange }: WatchlistFilterChipsProps) {
    const renderChip = useCallback(
        (chip: Chip) => {
            const isActive = activeChip === chip.key;
            return (
                <Pressable
                    key={chip.key}
                    accessibilityHint={`Filter by ${chip.label}`}
                    accessibilityLabel={chip.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => onChipChange(chip.key)}
                    style={({ pressed }) => [
                        styles.chip,
                        isActive && styles.chipActive,
                        pressed && styles.chipPressed,
                    ]}>
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {chip.label}
                    </Text>
                </Pressable>
            );
        },
        [activeChip, onChipChange],
    );

    return (
        <View style={styles.shell}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {FILTER_CHIPS.map(renderChip)}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    shell: {
        marginBottom: spacing.sm,
    },
    scrollContent: {
        gap: spacing.sm,
    },
    chip: {
        backgroundColor: palette.surface,
        borderColor: palette.border,
        borderRadius: radius.pill,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
    },
    chipActive: {
        backgroundColor: palette.primary,
        borderColor: palette.primary,
    },
    chipPressed: {
        opacity: 0.8,
    },
    chipText: {
        color: palette.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
});
