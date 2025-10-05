import clsx from 'clsx';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export const LoadingSpinner = ({ label = 'Loading...', className }: LoadingSpinnerProps) => (
  <div role="status" aria-live="polite" className={clsx('flex items-center gap-3', className)}>
    <span className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    <span className="text-sm text-slate-600">{label}</span>
  </div>
);
