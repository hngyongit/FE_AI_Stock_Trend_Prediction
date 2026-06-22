import { useCallback, useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlertCircle, ChevronLeft } from '@/shared/ui/primitives/icon';
import { palette, radius, spacing } from '@/shared/design/tokens';
import type { WatchlistOverlimitItem } from '@/features/watchlist/types';

type WatchlistOverlimitModalProps = {
    open: boolean;
    items: WatchlistOverlimitItem[];
    limit: number;
    onTrimSuccess: () => void;
    onTrimItems: (keepStockIds: string[]) => void;
    isTrimming: boolean;
    onBackToDashboard: () => void;
};

function getStockId(item: WatchlistOverlimitItem): string {
    return String(item.stock_id || '');
}

function getStockSymbol(item: WatchlistOverlimitItem): string {
    return String(item.stock_code || '--');
}

function getStockName(item: WatchlistOverlimitItem): string {
    return String(item.stock_name || '--');
}

export function WatchlistOverlimitModal({
    open,
    items,
    limit,
    onTrimSuccess,
    onTrimItems,
    isTrimming,
    onBackToDashboard,
}: WatchlistOverlimitModalProps) {
    const insets = useSafeAreaInsets();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const toggleStock = useCallback(
        (stockId: string) => {
            setErrorMessage(null);

            setSelectedIds((prev) => {
                if (prev.includes(stockId)) {
                    return prev.filter((id) => id !== stockId);
                }

                if (prev.length >= limit) {
                    setErrorMessage(`You can only keep ${limit} stocks.`);
                    return prev;
                }

                return [...prev, stockId];
            });
        },
        [limit],
    );

    const handleConfirmTrim = useCallback(async () => {
        if (selectedIds.length === 0) {
            setErrorMessage('Please select at least one stock to keep.');
            return;
        }

        if (selectedIds.length > limit) {
            setErrorMessage(`You can only keep ${limit} stocks.`);
            return;
        }

        setErrorMessage(null);
        onTrimItems(selectedIds);
        onTrimSuccess();
    }, [selectedIds, limit, onTrimItems, onTrimSuccess]);

    const handleClose = useCallback(() => {
        setSelectedIds([]);
        setErrorMessage(null);
    }, []);

    const selectionLabel = useMemo(
        () => `${selectedIds.length}/${limit} selected`,
        [selectedIds.length, limit],
    );

    return (
        <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
            onDismiss={handleClose}
        >
            <View style={styles.overlay}>
                {/* Back button — top-left corner of the dim overlay */}
                <View style={[styles.backButtonContainer, { top: insets.top + spacing.sm }]}>
                    <Pressable
                        accessibilityHint="Go back to dashboard"
                        accessibilityLabel="Back"
                        accessibilityRole="button"
                        hitSlop={12}
                        onPress={onBackToDashboard}
                        style={({ pressed }) => [
                            styles.backButton,
                            pressed && styles.backButtonPressed,
                        ]}
                    >
                        <ChevronLeft size={22} color={palette.textPrimary} strokeWidth={2.5} />
                    </Pressable>
                </View>

                <View
                    style={[
                        styles.panel,
                        { paddingTop: insets.top + spacing.md },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={styles.titleRow}>
                                <AlertCircle size={20} color="#FCD34D" />
                                <Text style={styles.title}>
                                    Watchlist limit reached
                                </Text>
                            </View>
                            <Text style={styles.description}>
                                Your current plan only allows you to keep up to{' '}
                                <Text style={styles.descriptionBold}>
                                    {limit}
                                </Text>{' '}
                                stocks. Select the stocks you want to keep, or
                                upgrade your plan to continue using a larger
                                watchlist.
                            </Text>
                        </View>
                    </View>

                    {/* Select box */}
                    <View style={styles.selectBox}>
                        <View style={styles.selectHeader}>
                            <Text style={styles.selectHeaderLabel}>
                                Select stocks to keep
                            </Text>
                            <Text style={styles.selectHeaderCount}>
                                {selectionLabel}
                            </Text>
                        </View>

                        <ScrollView
                            style={styles.selectList}
                            contentContainerStyle={styles.selectListContent}
                        >
                            {items.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>
                                        No watchlist items found.
                                    </Text>
                                </View>
                            ) : (
                                items.map((item) => {
                                    const stockId = getStockId(item);
                                    const selected =
                                        selectedIds.includes(stockId);

                                    return (
                                        <Pressable
                                            key={stockId}
                                            accessibilityHint={`${selected ? 'Deselect' : 'Select'} ${getStockSymbol(item)}`}
                                            accessibilityLabel={`${getStockSymbol(item)} - ${getStockName(item)}`}
                                            accessibilityRole="button"
                                            accessibilityState={{
                                                selected,
                                            }}
                                            onPress={() =>
                                                toggleStock(stockId)
                                            }
                                            style={({ pressed }) => [
                                                styles.stockItem,
                                                selected &&
                                                styles.stockItemSelected,
                                                pressed &&
                                                styles.stockItemPressed,
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    selected &&
                                                    styles.checkboxSelected,
                                                ]}
                                            >
                                                {selected && (
                                                    <Text
                                                        style={
                                                            styles.checkboxMark
                                                        }
                                                    >
                                                        ✓
                                                    </Text>
                                                )}
                                            </View>

                                            <View style={styles.stockItemInfo}>
                                                <Text
                                                    style={styles.stockItemSymbol}
                                                >
                                                    {getStockSymbol(item)}
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.stockItemName
                                                    }
                                                    numberOfLines={1}
                                                >
                                                    {getStockName(item)}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>

                    {/* Error message */}
                    {errorMessage && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>
                                {errorMessage}
                            </Text>
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable
                            accessibilityHint="Navigate to upgrade screen"
                            accessibilityLabel="Upgrade Plan"
                            accessibilityRole="button"
                            onPress={() => {
                                // Close modal — user can navigate via profile
                                handleClose();
                            }}
                            style={({ pressed }) => [
                                styles.actionButton,
                                styles.actionButtonSecondary,
                                pressed && styles.actionButtonPressed,
                            ]}
                        >
                            <Text style={styles.actionButtonSecondaryText}>
                                Upgrade Plan
                            </Text>
                        </Pressable>

                        <Pressable
                            accessibilityHint="Confirm selected stocks"
                            accessibilityLabel="Keep Selected Stocks"
                            accessibilityRole="button"
                            disabled={isTrimming || selectedIds.length === 0}
                            onPress={handleConfirmTrim}
                            style={({ pressed }) => [
                                styles.actionButton,
                                styles.actionButtonPrimary,
                                (isTrimming || selectedIds.length === 0) &&
                                styles.actionButtonDisabled,
                                pressed && styles.actionButtonPressed,
                            ]}
                        >
                            <Text style={styles.actionButtonPrimaryText}>
                                {isTrimming
                                    ? 'Saving...'
                                    : 'Keep Selected Stocks'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(2, 6, 23, 0.78)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    panel: {
        width: '100%',
        maxWidth: 600,
        maxHeight: '88%',
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.9)',
        borderRadius: 20,
        overflow: 'hidden',
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(51, 65, 85, 0.8)',
    },
    headerContent: {
        gap: spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    backButtonContainer: {
        position: 'absolute',
        left: spacing.md,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.7)',
    },
    backButtonPressed: {
        opacity: 0.7,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
    },
    title: {
        color: palette.textPrimary,
        fontSize: 20,
        fontWeight: '700',
    },
    description: {
        color: palette.textSecondary,
        fontSize: 14,
        lineHeight: 22,
    },
    descriptionBold: {
        color: palette.textPrimary,
        fontWeight: '700',
    },
    selectBox: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.85)',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: palette.background,
    },
    selectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(51, 65, 85, 0.85)',
    },
    selectHeaderLabel: {
        color: palette.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    selectHeaderCount: {
        color: palette.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    selectList: {
        maxHeight: 300,
    },
    selectListContent: {
        padding: spacing.sm + 2,
    },
    emptyState: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    emptyStateText: {
        color: palette.textSecondary,
        fontSize: 14,
    },
    stockItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm + 4,
        paddingHorizontal: spacing.sm + 2,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.9)',
        borderRadius: 12,
        backgroundColor: palette.background,
        marginBottom: spacing.xs + 2,
    },
    stockItemSelected: {
        borderColor: 'rgba(59, 130, 246, 0.95)',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
    },
    stockItemPressed: {
        opacity: 0.8,
    },
    stockItemInfo: {
        flex: 1,
        marginLeft: spacing.sm,
        gap: spacing.xs / 2,
    },
    stockItemSymbol: {
        color: palette.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    stockItemName: {
        color: palette.textSecondary,
        fontSize: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: palette.textSecondary,
        marginRight: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        borderColor: palette.primary,
        backgroundColor: palette.primary,
    },
    checkboxMark: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    errorContainer: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm + 2,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm + 2,
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.35)',
        borderRadius: 10,
        backgroundColor: 'rgba(127, 29, 29, 0.25)',
    },
    errorText: {
        color: '#FECACA',
        fontSize: 13,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm + 2,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm + 4,
        borderRadius: 8,
    },
    actionButtonPrimary: {
        backgroundColor: palette.primary,
    },
    actionButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: palette.border,
    },
    actionButtonDisabled: {
        opacity: 0.5,
    },
    actionButtonPressed: {
        opacity: 0.8,
    },
    actionButtonPrimaryText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtonSecondaryText: {
        color: palette.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
});
