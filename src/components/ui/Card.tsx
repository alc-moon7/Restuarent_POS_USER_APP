import type { HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-card border border-pos-line bg-white shadow-soft',
        className,
      )}
      {...props}
    />
  );
}
