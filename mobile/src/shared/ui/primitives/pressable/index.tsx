'use client';
import React from 'react';
import { Pressable as RNPressable } from 'react-native';

import { tva } from '@/shared/ui/utils/tva';
import type { VariantProps } from '@/shared/ui/utils/tva';

const pressableStyle = tva({
  base: '',
});

type IPressableProps = React.ComponentProps<typeof RNPressable> &
  VariantProps<typeof pressableStyle>;

const Pressable = React.forwardRef<
  React.ComponentRef<typeof RNPressable>,
  IPressableProps
>(function Pressable({ className, ...props }, ref) {
  return (
    <RNPressable
      {...props}
      ref={ref}
      className={pressableStyle({ class: className })}
    />
  );
});

Pressable.displayName = 'Pressable';

export { Pressable };
