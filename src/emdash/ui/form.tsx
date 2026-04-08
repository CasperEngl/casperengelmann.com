import React from 'react'
import {
  createFormHook,
  createFormHookContexts,
} from '@tanstack/react-form'

import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Switch } from './switch'
import { Button } from './button'

const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

// ---------------------------------------------------------------------------
// Field components — each reads its own field from context
// ---------------------------------------------------------------------------

function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>()
  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        name={field.name}
        autoComplete="off"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </div>
  )
}

function TextAreaField({
  label,
  rows = 4,
}: {
  label: string
  rows?: number
}) {
  const field = useFieldContext<string>()
  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Textarea
        id={field.name}
        name={field.name}
        autoComplete="off"
        rows={rows}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </div>
  )
}

function SwitchField({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={field.name} className="cursor-pointer">
        {label}
      </Label>
      <Switch
        id={field.name}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Form-level components — read the form instance from context
// ---------------------------------------------------------------------------

function SubmitButton({
  label = 'Save',
  pendingLabel,
}: {
  label?: string
  pendingLabel?: string
}) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(s) => s.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (pendingLabel ?? `${label}\u2026`) : label}
        </Button>
      )}
    </form.Subscribe>
  )
}

// ---------------------------------------------------------------------------
// Hook factory
// ---------------------------------------------------------------------------

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextAreaField,
    SwitchField,
  },
  formComponents: {
    SubmitButton,
  },
})
