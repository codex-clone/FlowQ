import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary-dark',
  secondary: 'bg-secondary text-white hover:opacity-90 focus-visible:ring-secondary',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200'
};

export const Button = ({
  variant = 'primary',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variantStyles[variant],
        (disabled || isLoading) && 'cursor-not-allowed opacity-60',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute left-3 inline-flex h-4 w-4 animate-spin rounded-full border border-white border-t-transparent" />
      )}
      <span className={clsx(isLoading && 'opacity-0')}>{children}</span>
      <span className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition duration-300 ease-out hover:opacity-20" />
    </button>
  );
};
