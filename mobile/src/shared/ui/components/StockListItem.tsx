import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import {
    changeDirectionIcon,
    formatPercent,
    formatPrice,
    formatSignedNumber,
    formatVolume,
} from '@/shared/utils/format';

// ─── Types ───────────────────────────────────────────────────────────

export type StockListItemVariant = 'default' | 'compact' | 'expanded';

export type StockListItemProps = {
    symbol: string;
    companyName: string;
    exchangeCode?: string | null;
    price?: number | null;
    priceChange?: number | null;
    priceChangePercent?: number | null;
    volume?: number | null;
    /** Optional subtitle shown below company name (replaces exchange badge context) */
    subtitle?: string | null;
    /** Extra metadata displayed on the far right below price */
    rightMeta?: string | null;
    isPinned?: boolean;
    hasAlert?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
    /** Custom element rendered before the left text column */
    leftAccessory?: React.ReactNode;
    /** Custom element rendered after the right price column */
    rightAccessory?: React.ReactNode;
    variant?: StockListItemVariant;
};

// ─── Component ───────────────────────────────────────────────────────

export function StockListItem({
    symbol,
    companyName,
    exchangeCode,
    price,
    priceChange,
    priceChangePercent,
    volume,
    subtitle,
    rightMeta,
    isPinned,
    hasAlert,
    onPress,
    onLongPress,
    leftAccessory,
    rightAccessory,
    variant = 'default',
}: StockListItemProps) {
    const changeColor = useMemo(() => {
        if (priceChangePercent == null) return palette.textMuted;
        if (priceChangePercent > 0) return palette.positive;
        if (priceChangePercent < 0) return palette.negative;
        return palette.textMuted;
    }, [priceChangePercent]);

    const icon = changeDirectionIcon(priceChangePercent);

    return (
        <Pressable
            accessibilityHint={`View ${symbol} details`}
            accessibilityLabel={`${symbol} - ${companyName}`}
            accessibilityRole="button"
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
            ]}>
            <View style={styles.rowContent}>
                {/* Left accessory */}
                {leftAccessory && <View style={styles.leftAccessory}>{leftAccessory}</View>}

                {/* Left: text column */}
                <View style={styles.leftBlock}>
                    <View style={styles.tickerRow}>
                        <Text style={styles.symbol} numberOfLines={1}>
                            {symbol}
                        </Text>
                        {exchangeCode ? (
                            <View style={styles.exchangeBadge}>
                                <Text style={styles.exchangeText}>{exchangeCode}</Text>
                            </View>
                        ) : null}
                        {isPinned ? <Text style={styles.flagIcon}>📌</Text> : null}
                        {hasAlert ? <Text style={styles.flagIcon}>🔔</Text> : null}
                    </View>
                    <View style={styles.secondaryRow}>
                        <Text numberOfLines={1} style={styles.companyName}>
                            {subtitle ?? companyName}
                        </Text>
                    </View>
                </View>

                {/* Right: price column */}
                <View style={styles.rightBlock}>
                    {price != null ? (
                        <>
                            <Text style={styles.price}>{formatPrice(price)}</Text>
                            <View style={styles.changeRow}>
                                <Text style={[styles.changeText, { color: changeColor }]}>
                                    {icon} {formatPercent(priceChangePercent)}
                                </Text>
                                {priceChange != null && (
                                    <Text style={[styles.changeAbs, { color: changeColor }]}>
                                        {formatSignedNumber(priceChange)}
                                    </Text>
                                )}
                            </View>
                            {volume != null && (
                                <Text style={styles.volume}>Vol: {formatVolume(volume)}</Text>
                            )}
                            {rightMeta && <Text style={styles.rightMeta}>{rightMeta}</Text>}
                        </>
                    ) : (
                        <Text style={styles.noPrice}>—</Text>
                    )}
                </View>

                {/* Right accessory */}
                {rightAccessory && <View style={styles.rightAccessory}>{rightAccessory}</View>}
            </View>
        </Pressable>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    row: {
        minHeight: 76,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
    },
    rowContent: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rowPressed: {
        backgroundColor: palette.elevated,
    },
    leftAccessory: {
        marginRight: spacing.sm,
    },
    leftBlock: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
        paddingRight: spacing.sm,
    },
    tickerRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    symbol: {
        color: palette.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
    },
    exchangeBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        borderRadius: radius.pill,
        paddingHorizontal: spacing.xs + 2,
        paddingVertical: 1,
    },
    exchangeText: {
        color: palette.info,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    flagIcon: {
        fontSize: 11,
        lineHeight: 16,
    },
    secondaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    companyName: {
        color: palette.textSecondary,
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        flexShrink: 1,
    },
    rightBlock: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 96,
    },
    price: {
        color: palette.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
    },
    changeRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
    },
    changeAbs: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 14,
    },
    volume: {
        color: palette.textSecondary,
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 14,
    },
    rightMeta: {
        color: palette.textSecondary,
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 14,
    },
    noPrice: {
        color: palette.textMuted,
        fontSize: 14,
        fontWeight: '600',
    },
    rightAccessory: {
        marginLeft: spacing.sm,
    },
});
