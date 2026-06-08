'use client';
import React from 'react';
import { Switch as RNSwitch } from 'react-native';
import { tva } from '@/shared/ui/utils/tva';
import type { VariantProps } from '@/shared/ui/utils/tva';

const switchStyle = tva({
  base: '',
  variants: {
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
});

type ISwitchProps = React.ComponentProps<typeof RNSwitch> &
  VariantProps<typeof switchStyle>;

const Switch = React.forwardRef<
  React.ComponentRef<typeof RNSwitch>,
  ISwitchProps
>(function Switch({ className, size = 'md', ...props }, ref) {
  return (
    <RNSwitch
      ref={ref}
      {...props}
      className={switchStyle({ size, class: className })}
    />
  );
});

Switch.displayName = 'Switch';
export { Switch };
