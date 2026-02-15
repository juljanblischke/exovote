import clsx from 'clsx';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  glass?: boolean;
};

export function Card({ className, glass, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[var(--border)] p-6',
        glass ? 'glass' : 'bg-[var(--card)] text-[var(--card-foreground)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
