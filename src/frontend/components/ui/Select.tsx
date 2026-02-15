'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'flex h-10 w-full appearance-none rounded-xl border bg-[var(--background)] px-3 py-2 pr-8 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-[var(--destructive)] focus-visible:ring-[var(--destructive)]'
              : 'border-[var(--input)]',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-5 w-5 text-[var(--muted-foreground)]" />
      </div>
    );
  },
);

Select.displayName = 'Select';
