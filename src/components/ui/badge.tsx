import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        interactive:
          'border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer',
        active: 'border-transparent bg-primary text-primary-foreground cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
);
export interface BadgeProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof badgeVariants> {}

/** Renders as a focusable <button> when `onClick` is provided. */
function Badge({ className, variant, onClick, ...props }: BadgeProps) {
  const clickable = typeof onClick === 'function';
  const Component = clickable ? 'button' : 'span';
  return (
    <Component
      type={clickable ? 'button' : undefined}
      className={cn(badgeVariants({ variant }), className)}
      onClick={onClick}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
