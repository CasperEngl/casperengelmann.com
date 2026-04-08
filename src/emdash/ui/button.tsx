import React from 'react'
import { cn } from '~/utils/cn'

type ButtonVariant = 'default' | 'outline' | 'ghost'
type ButtonSize = 'default' | 'sm' | 'lg'

export type ButtonProps = React.ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  default: cn(
    'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
    'hover:bg-neutral-800 dark:hover:bg-neutral-200',
    'active:bg-neutral-950 dark:active:bg-neutral-300',
  ),
  outline: cn(
    'border border-kumo-line bg-transparent',
    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    'active:bg-neutral-200 dark:active:bg-neutral-700',
  ),
  ghost: cn(
    'bg-transparent',
    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    'active:bg-neutral-200 dark:active:bg-neutral-700',
  ),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
}

export function Button({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium',
        'cursor-pointer select-none',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-line focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}
