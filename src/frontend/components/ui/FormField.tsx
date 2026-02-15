import clsx from 'clsx';
import { Label } from './Label';

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  help?: string;
  className?: string;
  children: React.ReactNode;
};

export function FormField({ label, htmlFor, required, error, help, className, children }: FormFieldProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {help && !error && (
        <p className="text-xs text-[var(--muted-foreground)]">{help}</p>
      )}
      {error && (
        <p className="text-xs text-[var(--destructive)]">{error}</p>
      )}
    </div>
  );
}
