import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  label: string;
  loadingLabel: string;
  className?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, isLoading, label, loadingLabel, ...props }, ref) => {
    return (
      <button ref={ref} disabled={isLoading} className={cn('flex items-center justify-center gap-2', className)} {...props} >
        {isLoading ? loadingLabel : label}
        {isLoading && <Loader2 className="animate-spin" />}
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };