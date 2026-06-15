import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { palette, radius, spacing } from '@/shared/design/tokens';

const CARD_BACKGROUND = '#081A2D';
const CARD_BORDER = 'rgba(173, 198, 255, 0.28)';
const GRID_DOT = 'rgba(148, 163, 184, 0.18)';
const GRID_LINE = 'rgba(59, 130, 246, 0.08)';
const GLOW = 'rgba(34, 197, 94, 0.18)';

export function useStartupScreenStyles(insets: { top: number; bottom: number }) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: '#111318',
          flex: 1,
        },
        gridBackground: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'space-between',
          paddingVertical: 10,
        },
        gridRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
        },
        gridDot: {
          backgroundColor: GRID_DOT,
          borderRadius: radius.pill,
          height: 2,
          width: 2,
        },
        shell: {
          alignItems: 'center',
          flex: 1,
          paddingBottom: Math.max(insets.bottom, spacing.md),
          paddingHorizontal: spacing.md,
          paddingTop: Math.max(insets.top, spacing.md),
        },
        topDivider: {
          backgroundColor: GRID_LINE,
          height: 1,
          marginTop: spacing.xl,
          width: '88%',
        },
        card: {
          alignItems: 'center',
          backgroundColor: CARD_BACKGROUND,
          borderColor: CARD_BORDER,
          borderRadius: 12,
          borderWidth: 1,
          flex: 1,
          marginTop: spacing.md,
          maxWidth: 360,
          overflow: 'hidden',
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xl,
          width: '100%',
          shadowColor: '#020B14',
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.22,
          shadowRadius: 30,
        },
        cardTopDivider: {
          backgroundColor: 'rgba(17, 37, 58, 0.75)',
          height: 1,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 162,
        },
        brandCore: {
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 128,
        },
        brandHaloOuter: {
          alignItems: 'center',
          backgroundColor: 'rgba(7, 28, 44, 0.82)',
          borderColor: GLOW,
          borderRadius: radius.pill,
          borderWidth: 1,
          height: 74,
          justifyContent: 'center',
          position: 'relative',
          width: 74,
        },
        brandHaloInner: {
          alignItems: 'center',
          borderColor: 'rgba(59, 130, 246, 0.16)',
          borderRadius: radius.pill,
          borderWidth: 1,
          height: 58,
          justifyContent: 'center',
          width: 58,
        },
        brandBadge: {
          alignItems: 'center',
          backgroundColor: 'rgba(59, 130, 246, 0.14)',
          borderColor: 'rgba(173, 198, 255, 0.12)',
          borderRadius: radius.pill,
          borderWidth: 1,
          height: 38,
          justifyContent: 'center',
          width: 38,
        },
        brandMiniBadge: {
          alignItems: 'center',
          backgroundColor: '#123252',
          borderColor: 'rgba(173, 198, 255, 0.24)',
          borderRadius: radius.pill,
          borderWidth: 1,
          bottom: -2,
          height: 16,
          justifyContent: 'center',
          position: 'absolute',
          right: -2,
          width: 16,
        },
        brandName: {
          color: palette.primarySoft,
          fontSize: 25,
          fontWeight: '800',
          letterSpacing: 0.5,
          marginTop: spacing.lg,
          textAlign: 'center',
        },
        brandSubhead: {
          color: '#D8E2EF',
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 2.1,
          marginTop: spacing.xs,
          textAlign: 'center',
        },
        statusBlock: {
          marginTop: spacing.xl + spacing.sm,
          width: '100%',
        },
        statusRow: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
        },
        statusDot: {
          backgroundColor: palette.positive,
          borderRadius: radius.pill,
          height: 6,
          shadowColor: palette.positive,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.65,
          shadowRadius: 6,
          width: 6,
        },
        statusText: {
          color: palette.textSecondary,
          flex: 1,
          fontSize: 10,
          lineHeight: 14,
        },
        progressTrack: {
          backgroundColor: 'rgba(173, 198, 255, 0.14)',
          borderRadius: radius.pill,
          height: 1,
          marginTop: spacing.md,
          overflow: 'hidden',
          width: '100%',
        },
        progressFill: {
          backgroundColor: palette.positive,
          borderRadius: radius.pill,
          height: 1,
          shadowColor: palette.positive,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 6,
          width: 96,
        },
        errorBlock: {
          alignItems: 'center',
          marginTop: spacing.lg,
          width: '100%',
        },
        errorText: {
          color: palette.warning,
          fontSize: 12,
          lineHeight: 18,
          textAlign: 'center',
        },
        retryButton: {
          alignItems: 'center',
          backgroundColor: 'rgba(59, 130, 246, 0.14)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          borderRadius: radius.pill,
          borderWidth: 1,
          justifyContent: 'center',
          marginTop: spacing.md,
          minHeight: 40,
          minWidth: 140,
          paddingHorizontal: spacing.md,
        },
        retryButtonPressed: {
          opacity: 0.72,
        },
        retryText: {
          color: palette.primarySoft,
          fontSize: 12,
          fontWeight: '700',
        },
        cardFooterSpacer: {
          flex: 1,
        },
        versionText: {
          color: 'rgba(148, 163, 184, 0.62)',
          fontSize: 9,
          fontWeight: '600',
          letterSpacing: 0.6,
          marginTop: spacing.md,
        },
      }),
    [insets.bottom, insets.top],
  );
}
