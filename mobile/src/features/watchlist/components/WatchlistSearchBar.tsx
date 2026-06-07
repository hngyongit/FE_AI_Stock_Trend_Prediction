import { StyleSheet, TextInput, View } from 'react-native';

import { palette, radius, spacing } from '@/shared/design/tokens';

type WatchlistSearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
};

export function WatchlistSearchBar({
    value,
    onChangeText,
    placeholder = 'Search ticker...',
}: WatchlistSearchBarProps) {
    return (
        <View style={styles.shell}>
            <TextInput
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
                value={value}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    shell: {
        backgroundColor: palette.surface,
        borderColor: palette.border,
        borderRadius: radius.control,
        borderWidth: 1,
        marginBottom: spacing.sm,
    },
    input: {
        color: palette.textPrimary,
        fontSize: 14,
        lineHeight: 20,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
    },
});
