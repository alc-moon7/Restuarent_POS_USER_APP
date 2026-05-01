import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55',
        {
          'bg-pos-primary text-white shadow-lift hover:bg-pos-primaryDark':
            variant === 'primary',
          'border border-pos-line bg-white text-pos-slate hover:border-pos-primary/40 hover:text-pos-primary':
            variant === 'secondary',
          'bg-transparent text-pos-muted hover:bg-white hover:text-pos-slate':
            variant === 'ghost',
          'bg-pos-danger text-white hover:bg-red-700': variant === 'danger',
          'h-10 px-4 text-sm': size === 'sm',
          'h-12 px-5 text-sm': size === 'md',
          'h-14 px-6 text-base': size === 'lg',
        },
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
