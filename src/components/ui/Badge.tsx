import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
  icon?: ReactNode;
};

export function Badge({
  className,
  tone = 'primary',
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold',
        {
          'border-pos-primary/20 bg-pos-primary/10 text-pos-primary':
            tone === 'primary',
          'border-pos-success/20 bg-pos-success/10 text-pos-success':
            tone === 'success',
          'border-pos-warning/20 bg-pos-warning/10 text-pos-warning':
            tone === 'warning',
          'border-pos-danger/20 bg-pos-danger/10 text-pos-danger':
            tone === 'danger',
          'border-pos-info/20 bg-pos-info/10 text-pos-info': tone === 'info',
          'border-pos-line bg-pos-background text-pos-muted': tone === 'muted',
        },
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
