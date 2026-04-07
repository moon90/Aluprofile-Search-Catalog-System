import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_hsl(var(--primary)/0.9)] hover:bg-primary/95 hover:shadow-[0_14px_28px_-16px_hsl(var(--primary)/0.95)]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[0_8px_22px_-18px_rgba(15,23,42,0.5)] hover:bg-secondary/90',
        outline:
          'border border-input bg-background/90 text-foreground shadow-[0_8px_18px_-18px_rgba(15,23,42,0.45)] hover:border-primary/35 hover:bg-accent hover:text-accent-foreground',
        ghost: 'text-foreground hover:bg-accent/80 hover:text-accent-foreground',
        destructive: 'bg-red-600 text-white shadow-[0_10px_24px_-16px_rgba(220,38,38,0.85)] hover:bg-red-700',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }
