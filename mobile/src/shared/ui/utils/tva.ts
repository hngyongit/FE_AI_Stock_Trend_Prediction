import { tv, type VariantProps } from 'tailwind-variants';
import { Platform } from 'react-native';

export { tv as tva };
export type { VariantProps };

export const isWeb = Platform.OS === 'web';