import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-2xl border border-pos-line bg-white px-4 text-sm font-semibold text-pos-slate outline-none transition placeholder:text-pos-muted/70 focus:border-pos-primary focus:ring-4 focus:ring-pos-primary/10',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-none rounded-2xl border border-pos-line bg-white px-4 py-3 text-sm font-semibold text-pos-slate outline-none transition placeholder:text-pos-muted/70 focus:border-pos-primary focus:ring-4 focus:ring-pos-primary/10',
        className,
      )}
      {...props}
    />
  );
}
