import { StyleSheet, View } from 'react-native';

type IconProps = {
  color: string;
  size: number;
};

export function BrandTrendIcon({ color, size }: IconProps) {
  const stroke = Math.max(1.35, size * 0.08);

  return (
    <View style={{ height: size, position: 'relative', width: size }}>
      <View style={[styles.absolute, { backgroundColor: `${color}45`, bottom: size * 0.16, height: stroke, left: size * 0.08, right: size * 0.08 }]} />
      <View style={[styles.absolute, { backgroundColor: `${color}45`, bottom: size * 0.16, left: size * 0.08, top: size * 0.14, width: stroke }]} />
      <View
        style={[
          styles.absolute,
          {
            backgroundColor: color,
            borderRadius: 999,
            bottom: size * 0.34,
            height: stroke,
            left: size * 0.18,
            transform: [{ rotate: '-20deg' }],
            width: size * 0.32,
          },
        ]}
      />
      <View
        style={[
          styles.absolute,
          {
            backgroundColor: color,
            borderRadius: 999,
            bottom: size * 0.49,
            height: stroke,
            left: size * 0.42,
            transform: [{ rotate: '-38deg' }],
            width: size * 0.28,
          },
        ]}
      />
      <View style={[styles.dot, { backgroundColor: color, bottom: size * 0.27, height: size * 0.11, left: size * 0.14, width: size * 0.11 }]} />
      <View style={[styles.dot, { backgroundColor: color, bottom: size * 0.41, height: size * 0.11, left: size * 0.39, width: size * 0.11 }]} />
      <View style={[styles.dot, { backgroundColor: color, bottom: size * 0.6, height: size * 0.11, left: size * 0.64, width: size * 0.11 }]} />
      <View style={[styles.sparkleBarV, { backgroundColor: color, height: size * 0.16, right: size * 0.04, top: size * 0.04, width: stroke }]} />
      <View style={[styles.sparkleBarH, { backgroundColor: color, height: stroke, right: 0, top: size * 0.1, width: size * 0.16 }]} />
    </View>
  );
}

export function DashboardIcon({ color, size }: IconProps) {
  const cell = size * 0.4;
  const gap = size * 0.08;
  const borderWidth = Math.max(1.25, size * 0.08);

  return (
    <View style={{ height: size, position: 'relative', width: size }}>
      {[0, 1, 2, 3].map((index) => {
        const row = index > 1 ? 1 : 0;
        const col = index % 2;

        return (
          <View
            key={index}
            style={{
              borderColor: color,
              borderRadius: size * 0.06,
              borderWidth,
              height: cell,
              left: col === 0 ? 0 : cell + gap,
              position: 'absolute',
              top: row === 0 ? 0 : cell + gap,
              width: cell,
            }}
          />
        );
      })}
    </View>
  );
}

export function WatchlistIcon({ color, size }: IconProps) {
  const stroke = Math.max(1.2, size * 0.08);
  const rowWidth = size * 0.62;

  return (
    <View style={{ height: size, position: 'relative', width: size }}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.absolute,
            {
              backgroundColor: color,
              borderRadius: 999,
              height: stroke,
              left: size * 0.26,
              top: size * (0.16 + index * 0.27),
              width: rowWidth,
            },
          ]}
        />
      ))}
      {[0, 1, 2].map((index) => (
        <View
          key={`dot-${index}`}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              height: size * 0.12,
              left: size * 0.02,
              top: size * (0.11 + index * 0.27),
              width: size * 0.12,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function AlertsIcon({ color, size }: IconProps) {
  const stroke = Math.max(1.3, size * 0.08);

  return (
    <View style={{ height: size, position: 'relative', width: size }}>
      <View
        style={{
          borderColor: color,
          borderRadius: size * 0.22,
          borderTopLeftRadius: size * 0.4,
          borderTopRightRadius: size * 0.4,
          borderWidth: stroke,
          height: size * 0.58,
          left: size * 0.18,
          position: 'absolute',
          top: size * 0.1,
          width: size * 0.64,
        }}
      />
      <View style={[styles.absolute, { backgroundColor: color, borderRadius: 999, height: stroke, left: size * 0.2, top: size * 0.68, width: size * 0.6 }]} />
      <View style={[styles.dot, { backgroundColor: color, bottom: size * 0.06, height: size * 0.12, left: size * 0.44, width: size * 0.12 }]} />
    </View>
  );
}

export function SearchIcon({ color, size }: IconProps) {
  const stroke = Math.max(1.35, size * 0.08);

  return (
    <View style={{ height: size, position: 'relative', width: size }}>
      <View
        style={{
          borderColor: color,
          borderRadius: 999,
          borderWidth: stroke,
          height: size * 0.54,
          left: size * 0.06,
          position: 'absolute',
          top: size * 0.06,
          width: size * 0.54,
        }}
      />
      <View
        style={[
          styles.absolute,
          {
            backgroundColor: color,
            borderRadius: 999,
            height: stroke,
            right: size * 0.04,
            top: size * 0.58,
            transform: [{ rotate: '44deg' }],
            width: size * 0.34,
          },
        ]}
      />
    </View>
  );
}

export function ProfileIcon({ color, size }: IconProps) {
  const stroke = Math.max(1.25, size * 0.08);

  return (
    <View style={{ height: size, position: 'relative', width: size }}>
      <View
        style={{
          borderColor: color,
          borderRadius: 999,
          borderWidth: stroke,
          height: size * 0.34,
          left: size * 0.29,
          position: 'absolute',
          top: size * 0.08,
          width: size * 0.34,
        }}
      />
      <View
        style={{
          borderColor: color,
          borderTopLeftRadius: size * 0.3,
          borderTopRightRadius: size * 0.3,
          borderWidth: stroke,
          borderBottomWidth: 0,
          height: size * 0.36,
          left: size * 0.14,
          position: 'absolute',
          top: size * 0.5,
          width: size * 0.72,
        }}
      />
    </View>
  );
}

export function BellIcon({ color, size }: IconProps) {
  return <AlertsIcon color={color} size={size} />;
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
  dot: {
    borderRadius: 999,
    position: 'absolute',
  },
  sparkleBarV: {
    position: 'absolute',
  },
  sparkleBarH: {
    position: 'absolute',
  },
});
