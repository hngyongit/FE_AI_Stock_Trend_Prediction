import { tva, isWeb } from '@/shared/ui/utils/tva';
const baseStyle = isWeb
  ? 'font-sans tracking-sm bg-transparent border-0 box-border display-inline list-none margin-0 padding-0 position-relative text-start no-underline whitespace-pre-wrap word-wrap-break-word'
  : '';

export const headingStyle = tva({
  base: `text-typography-900 font-heading font-semibold tracking-normal my-0 ${baseStyle}`,
  variants: {
    isTruncated: {
      true: 'truncate',
    },
    bold: {
      true: 'font-bold',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    sub: {
      true: 'text-xs',
    },
    italic: {
      true: 'italic',
    },
    highlight: {
      true: 'bg-yellow-500',
    },
    size: {
      '5xl': 'text-price-display',
      '4xl': 'text-price-mobile',
      '3xl': 'text-screen-title',
      '2xl': 'text-section-title',
      'xl': 'text-section-title',
      'lg': 'text-card-title',
      'md': 'text-card-title',
      'sm': 'text-body',
      'xs': 'text-secondary-info',
    },
  },
});
