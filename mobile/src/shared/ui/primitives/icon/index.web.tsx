import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  children?: React.ReactNode;
  viewBox?: string;
  style?: any;
};

function Icon({
  size = 24,
  color = '#F8FAFC',
  strokeWidth = 2,
  children,
  viewBox = '0 0 24 24',
  style,
}: IconProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={viewBox} fill="none" color={color}>
        {children}
      </Svg>
    </View>
  );
}

export { Icon };
export type { IconProps };
