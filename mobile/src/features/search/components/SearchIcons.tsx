import { Path } from 'react-native-svg';

import { Icon } from '@/shared/ui';

type SearchIconProps = {
  color?: string;
  size?: number;
};

export function SearchGlassIcon({ color, size = 18 }: SearchIconProps) {
  return (
    <Icon color={color} size={size} viewBox="0 0 24 24">
      <Path
        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Icon>
  );
}

export function TrendingArrowIcon({ color, size = 18 }: SearchIconProps) {
  return (
    <Icon color={color} size={size} viewBox="0 0 24 24">
      <Path
        d="M4 15L10 9L14 13L20 7M20 7H15M20 7V12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Icon>
  );
}
