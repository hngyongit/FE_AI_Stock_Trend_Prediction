// Shared UI barrel exports.
// Feature screens should import from here: import { Box, Text, AppButton } from "@/shared/ui"
// Never import directly from GlueStack primitives in feature screens.

// Layout primitives
export { Box, VStack, HStack, Divider, Card } from './primitives';

// Text
export { Text } from './primitives';

// Interactive
export { Pressable, Button } from './primitives';

// Form controls
export { Input, Checkbox, Switch } from './primitives';

// Feedback
export { Spinner, Toast, Modal, Skeleton } from './primitives';

// Provider
export { ThemeProvider } from './primitives';
export { useToast } from './primitives';

// Icons
export { Icon } from './primitives';
export { Avatar, AvatarBadge, AvatarGroup } from './primitives';
export { Badge, BadgeText, BadgeIcon } from './primitives';

// Shared composed components (added as they are migrated)
export { MetricCard } from './components/MetricCard';
export { StatusBadge } from './components/StatusBadge';
export { FeaturePlaceholderScreen } from './components/FeaturePlaceholderScreen';
export { StockListItem } from './components/StockListItem';
export type { StockListItemProps, StockListItemVariant } from './components/StockListItem';

// Layout components
export { AppScreen } from './layout/AppScreen';