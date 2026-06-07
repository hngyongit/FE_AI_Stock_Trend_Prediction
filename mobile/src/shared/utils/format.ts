/**
 * Format a stock price with locale thousand separators.
 * Examples: 135000 → "135,000", 118400 → "118,400"
 */
export function formatPrice(value: number | null | undefined): string {
    if (value == null) return '—';
    return value.toLocaleString('en-US');
}

/**
 * Format a percentage change with sign and fixed decimals.
 * Examples: 1.12 → "+1.12%", -0.64 → "-0.64%", 0 → "0.00%"
 */
export function formatPercent(value: number | null | undefined): string {
    if (value == null) return '—';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format trading volume with B/M/K suffixes.
 * Examples: 2500000 → "2.5M", 1500000000 → "1.5B", 85000 → "85.0K"
 */
export function formatVolume(value: number | null | undefined): string {
    if (value == null) return '—';
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toLocaleString('en-US');
}

/**
 * Format a signed number with explicit +/− prefix.
 * Examples: 1500 → "+1,500", -500 → "-500", 0 → "0"
 */
export function formatSignedNumber(value: number | null | undefined): string {
    if (value == null) return '—';
    if (value > 0) return `+${value.toLocaleString('en-US')}`;
    if (value < 0) return value.toLocaleString('en-US');
    return '0';
}

/**
 * Determine the change direction indicator (▲ ▼ –).
 */
export function changeDirectionIcon(value: number | null | undefined): string {
    if (value == null) return '–';
    if (value > 0) return '▲';
    if (value < 0) return '▼';
    return '–';
}
