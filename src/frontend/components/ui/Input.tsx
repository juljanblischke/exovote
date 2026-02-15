'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'flex h-10 w-full rounded-xl border bg-[var(--background)] px-3 py-2 text-sm transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-[var(--destructive)] focus-visible:ring-[var(--destructive)]'
            : 'border-[var(--input)]',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
