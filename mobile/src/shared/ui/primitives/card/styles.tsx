import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { isWeb } from '@gluestack-ui/utils/nativewind-utils';
const baseStyle = isWeb ? 'flex flex-col relative z-0' : '';

export const cardStyle = tva({
  base: `${baseStyle} border border-outline-300 bg-background-200`,
  variants: {
    size: {
      sm: 'p-3 rounded-md',
      md: 'p-card rounded-md',
      lg: 'p-card rounded-lg',
    },
    variant: {
      elevated: 'bg-background-200 border-outline-300',
      outline: 'bg-transparent border-outline-300',
      ghost: 'rounded-none',
      filled: 'bg-background-300 border-outline-300',
    },
  },
});
