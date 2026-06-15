import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { BrandTrendIcon, BellIcon } from '@/app/navigation/NavigationIcons';
import { useAppShellStore } from '@/stores/app-shell.store';

type DashboardHeaderProps = {
    badgeLabel?: string;
    onNotificationPress: () => void;
};

export function DashboardHeader({ badgeLabel, onNotificationPress }: DashboardHeaderProps) {
    const insets = useSafeAreaInsets();
    const { unreadNotifications } = useAppShellStore();

    return (
        <View style={[styles.shell, { paddingTop: insets.top + spacing.sm }]}>
            <View style={styles.row}>
                <View style={styles.brandCol}>
                    <BrandTrendIcon color={palette.primary} size={20} />
                    <Text style={styles.brandText}>AI STOCK TREND</Text>
                </View>

                <View style={styles.actions}>
                    {badgeLabel ? (
                        <View style={styles.marketBadge}>
                            <Text style={styles.marketLabel}>{badgeLabel}</Text>
                        </View>
                    ) : null}

                    <Pressable
                        accessibilityHint="Open notification center"
                        accessibilityLabel="Notifications"
                        accessibilityRole="button"
                        onPress={onNotificationPress}
                        style={({ pressed }) => [styles.bellButton, pressed && styles.bellPressed]}>
                        <BellIcon color={palette.textSecondary} size={18} />
                        {unreadNotifications > 0 ? (
                            <View style={styles.badgeBubble}>
                                <Text style={styles.badgeText}>
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </Text>
                            </View>
                        ) : null}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    shell: {
        backgroundColor: palette.background,
        paddingBottom: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    brandCol: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    brandText: {
        color: palette.primary,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1.28,
    },
    actions: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    marketBadge: {
        alignItems: 'center',
        backgroundColor: palette.surface,
        borderColor: palette.border,
        borderRadius: radius.pill,
        borderWidth: 1,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs + 2,
    },
    marketLabel: {
        color: palette.primarySoft,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    bellButton: {
        alignItems: 'center',
        backgroundColor: palette.surface,
        borderColor: palette.border,
        borderRadius: radius.pill,
        borderWidth: 1,
        height: 38,
        justifyContent: 'center',
        width: 38,
    },
    bellPressed: {
        opacity: 0.74,
    },
    badgeBubble: {
        alignItems: 'center',
        backgroundColor: palette.primary,
        borderRadius: radius.pill,
        justifyContent: 'center',
        minWidth: 16,
        paddingHorizontal: 3,
        position: 'absolute',
        right: -2,
        top: -2,
    },
    badgeText: {
        color: '#08111A',
        fontSize: 9,
        fontWeight: '800',
    },
});
