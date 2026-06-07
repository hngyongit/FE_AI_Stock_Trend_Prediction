import { Text } from '@/shared/ui/primitives';
import { Card } from '@/shared/ui/primitives';
import { palette, radius, spacing } from '@/shared/design/tokens';

type AppBannerProps = {
  body: string;
  title: string;
  tone?: 'default' | 'success' | 'warning';
};

export function AppBanner({ body, title, tone = 'default' }: AppBannerProps) {
  const colors =
    tone === 'success'
      ? { borderColor: 'rgba(34, 197, 94, 0.28)', surface: 'rgba(34, 197, 94, 0.08)', titleColor: palette.positive }
      : tone === 'warning'
        ? { borderColor: 'rgba(255, 183, 134, 0.32)', surface: 'rgba(255, 183, 134, 0.08)', titleColor: palette.warning }
        : { borderColor: 'rgba(173, 198, 255, 0.2)', surface: 'rgba(173, 198, 255, 0.07)', titleColor: palette.primary };

  return (
    <Card
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.borderColor,
        borderRadius: radius.card,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}>
      <Text style={{ color: colors.titleColor, fontSize: 11, fontWeight: '700', letterSpacing: 0.72, textTransform: 'uppercase' }}>
        {title}
      </Text>
      <Text style={{ color: palette.textSecondary, fontSize: 13, lineHeight: 19, marginTop: spacing.xs }}>
        {body}
      </Text>
    </Card>
  );
}