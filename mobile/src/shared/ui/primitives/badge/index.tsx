import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeProps = {
  children?: React.ReactNode;
  action?: 'error' | 'warning' | 'success' | 'info' | 'muted';
  size?: 'sm' | 'md' | 'lg';
};

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  error: { bg: 'transparent', text: '#EF4444', border: '#EF4444' },
  warning: { bg: 'transparent', text: '#F59E0B', border: '#F59E0B' },
  success: { bg: 'transparent', text: '#22C55E', border: '#22C55E' },
  info: { bg: 'transparent', text: '#3B82F6', border: '#3B82F6' },
  muted: { bg: 'transparent', text: '#64748B', border: '#64748B' },
};

function Badge({ children, action = 'muted', size = 'md' }: BadgeProps) {
  const c = COLORS[action];
  return (
    <View style={[styles.badge, { borderColor: c.border }]}>
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: c.text }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function BadgeText({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[styles.text, style]}>{children}</Text>;
}
function BadgeIcon({ children }: { children?: React.ReactNode }) {
  return <View style={{ width: 14, height: 14 }}>{children}</View>;
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

Badge.displayName = 'Badge';
BadgeText.displayName = 'BadgeText';
BadgeIcon.displayName = 'BadgeIcon';

export { Badge, BadgeText, BadgeIcon };
