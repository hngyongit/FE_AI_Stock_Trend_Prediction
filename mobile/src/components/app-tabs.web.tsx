import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing } from '@/shared/design/tokens';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <View style={styles.tabBar}>
          <Text style={styles.brand}>AI Stock Trend</Text>
          <TabTrigger name="dashboard" href="/" asChild>
            <TabButton>Dashboard</TabButton>
          </TabTrigger>
          <TabTrigger name="watchlist" href={'/watchlist' as never} asChild>
            <TabButton>Watchlist</TabButton>
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={[styles.tabButton, isFocused && styles.activeTab]}>
      <Text style={[styles.tabText, isFocused && styles.activeTabText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  tabBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    top: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    backgroundColor: palette.surfaceLow,
    padding: spacing.xs,
  },
  brand: {
    flex: 1,
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
  },
  tabButton: {
    borderRadius: radius.control,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeTab: {
    backgroundColor: palette.surfaceHigh,
  },
  tabText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: palette.text,
  },
});
