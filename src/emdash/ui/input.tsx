import React from 'react'
import { cn } from '~/utils/cn'

export type InputProps = React.ComponentProps<'input'>

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-kumo-line bg-kumo-base px-3 py-2 text-sm text-kumo-default',
        'placeholder:text-kumo-placeholder',
        'transition-shadow duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-line focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
