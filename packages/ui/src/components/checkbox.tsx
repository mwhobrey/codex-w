import * as React from 'react';
import { cn } from '../lib/utils';

export const Checkbox = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border border-input bg-secondary text-primary accent-primary focus-visible:ring-2 focus-visible:ring-ring/30',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Checkbox.displayName = 'Checkbox';
