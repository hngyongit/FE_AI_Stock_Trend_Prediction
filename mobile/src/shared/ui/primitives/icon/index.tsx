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
      <Svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        color={color}
      >
        {children}
      </Svg>
    </View>
  );
}

// ─── Common icons ─────────────────────────────────────────────────

function ChevronRight(props: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <Path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

function ChevronLeft(props: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <Path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

function X(props: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <Path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

function Check(props: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <Path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

function AlertCircle(props: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 8V12" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 16H12.01" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export { Icon, ChevronRight, ChevronLeft, X, Check, AlertCircle };
export type { IconProps };
