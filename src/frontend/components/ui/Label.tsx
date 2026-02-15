import clsx from 'clsx';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={clsx(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-[var(--destructive)]">*</span>}
    </label>
  );
}
