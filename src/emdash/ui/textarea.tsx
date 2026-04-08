import React from 'react'
import { cn } from '~/utils/cn'

export type TextareaProps = React.ComponentProps<'textarea'>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-[5rem] w-full rounded-lg border border-kumo-line bg-kumo-base px-3 py-2 text-sm text-kumo-default',
        'resize-y',
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
