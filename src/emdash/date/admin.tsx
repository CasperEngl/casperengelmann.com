import React from 'react'

import { Input } from '../ui/input'
import { Label } from '../ui/label'

type DateFieldProps = {
  value: unknown
  onChange: (value: unknown) => void
  label: string
  id: string
  required?: boolean
  minimal?: boolean
}

function DateField({
  value,
  onChange,
  label,
  id,
  required,
  minimal,
}: DateFieldProps) {
  return (
    <div className="grid gap-2">
      {!minimal && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-kumo-danger ms-0.5">*</span>}
        </Label>
      )}
      <Input
        id={id}
        type="date"
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value || null)}
        required={required}
      />
    </div>
  )
}

export const fields = {
  date: DateField,
}
