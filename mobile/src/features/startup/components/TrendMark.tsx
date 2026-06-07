import { StyleSheet, View } from 'react-native';

import { palette } from '@/shared/design/tokens';

type TrendMarkProps = {
  size: number;
};

export function TrendMark({ size }: TrendMarkProps) {
  const strokeWidth = Math.max(1.35, size * 0.016);
  const dotSize = Math.max(size * 0.08, 5);
  const sparkleSize = size * 0.18;
  const smallSparkleSize = size * 0.12;

  const styles = StyleSheet.create({
    mark: { height: size, position: 'relative', width: size },
    axisHorizontal: {
      backgroundColor: 'rgba(173, 198, 255, 0.26)',
      bottom: '21%', height: strokeWidth, left: '16%', right: '12%', position: 'absolute',
    },
    axisVertical: {
      backgroundColor: 'rgba(173, 198, 255, 0.26)',
      bottom: '21%', left: '16%', position: 'absolute', top: '21%', width: strokeWidth,
    },
    trendOne: {
      backgroundColor: palette.primary, borderRadius: 999, bottom: '37%',
      height: strokeWidth * 1.15, left: '23%', position: 'absolute',
      transform: [{ rotate: '-24deg' }], width: '30%',
    },
    trendTwo: {
      backgroundColor: palette.primary, borderRadius: 999, bottom: '46%',
      height: strokeWidth * 1.15, left: '47%', position: 'absolute',
      transform: [{ rotate: '-43deg' }], width: '34%',
    },
    dot: {
      backgroundColor: palette.primary, borderRadius: 999, height: dotSize,
      position: 'absolute', width: dotSize,
    },
    dotStart: { bottom: '31%', left: '20%' },
    dotMid: { bottom: '44%', left: '46%' },
    dotEnd: { bottom: '66%', left: '72%' },
    sparkle: { height: sparkleSize, position: 'absolute', width: sparkleSize },
    smallSparkle: { height: smallSparkleSize, opacity: 0.72, position: 'absolute', width: smallSparkleSize },
    sparkleVertical: {
      backgroundColor: palette.primary, borderRadius: 999,
      bottom: 0, left: '46%', position: 'absolute', top: 0, width: strokeWidth,
    },
    sparkleHorizontal: {
      backgroundColor: palette.primary, borderRadius: 999,
      height: strokeWidth, left: 0, position: 'absolute', right: 0, top: '46%',
    },
    sparklePrimary: { right: '17%', top: '13%' },
    sparkleSecondary: { left: '25%', top: '20%' },
  });

  return (
    <View style={styles.mark}>
      <View style={styles.axisHorizontal} />
      <View style={styles.axisVertical} />
      <View style={styles.trendOne} />
      <View style={styles.trendTwo} />
      <View style={[styles.dot, styles.dotStart]} />
      <View style={[styles.dot, styles.dotMid]} />
      <View style={[styles.dot, styles.dotEnd]} />
      <View style={[styles.sparkle, styles.sparklePrimary]}>
        <View style={styles.sparkleVertical} />
        <View style={styles.sparkleHorizontal} />
      </View>
      <View style={[styles.smallSparkle, styles.sparkleSecondary]}>
        <View style={styles.sparkleVertical} />
        <View style={styles.sparkleHorizontal} />
      </View>
    </View>
  );
}