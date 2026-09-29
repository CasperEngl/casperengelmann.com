import '../admin.css'

import React, { useEffect, useState } from 'react'
import { TZDate } from '@date-fns/tz'
import { format, parse } from 'date-fns'
import { Effect } from 'effect'
import { CalendarIcon } from 'lucide-react'
import { cn } from '~/utils/cn'

import { Button } from '../shadcn/button'
import { Calendar } from '../shadcn/calendar'
import { Field, FieldGroup, FieldLabel } from '../shadcn/field'
import { Input } from '../shadcn/input'
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover'
import { EmDashApi, emDashApiRuntime } from '../services/api'

type FieldWidgetProps = {
  value: unknown
  onChange: (value: unknown) => void
  label: string
  id: string
  required?: boolean
  minimal?: boolean
}

const DATE_FORMAT = 'yyyy-MM-dd'
const TIME_FORMAT = 'HH:mm'

function toDate(value: unknown) {
  if (typeof value !== 'string' || value === '') return undefined
  const date = parse(value, DATE_FORMAT, new Date())
  return Number.isNaN(date.getTime()) ? undefined : date
}

const loadSiteTimezone = Effect.fn('loadSiteTimezone')(function* () {
  const api = yield* EmDashApi
  const response = yield* api.request('/_emdash/api/manifest')
  const manifest = yield* api.parse<{ timezone?: string }>(
    response,
    'Could not load site timezone',
  )
  return manifest.timezone ?? 'UTC'
})

function useSiteTimezone() {
  const [timezone, setTimezone] = useState<string>()

  useEffect(() => {
    let active = true
    emDashApiRuntime.runFork(
      loadSiteTimezone().pipe(
        Effect.tap((value) =>
          Effect.sync(() => {
            if (active) setTimezone(value)
          }),
        ),
        Effect.catch(() => Effect.void),
      ),
    )
    return () => {
      active = false
    }
  }, [])

  return timezone
}

function toZonedDate(value: unknown, timezone: string) {
  if (typeof value !== 'string' || value === '') return undefined
  const date = new TZDate(value, timezone)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toUtcIsoString(day: Date, time: string, timezone: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  const date = new TZDate(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hours,
    minutes,
    timezone,
  )
  return new Date(date.getTime()).toISOString()
}

function WidgetLabel({
  id,
  label,
  required,
  minimal,
}: Omit<FieldWidgetProps, 'value' | 'onChange'>) {
  if (minimal) return null
  return (
    <FieldLabel htmlFor={id}>
      {label}
      {required && <span className="text-destructive">*</span>}
    </FieldLabel>
  )
}

type DatePopoverProps = {
  id: string
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  required?: boolean
  disabled?: boolean
  className?: string
}

function DatePopover({
  id,
  date,
  onSelect,
  required,
  disabled,
  className,
}: DatePopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            data-empty={!date}
            disabled={disabled}
            className={cn(
              'data-[empty=true]:text-muted-foreground justify-start font-normal',
              className,
            )}
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        {date ? format(date, 'PPP') : 'Pick a date'}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          onSelect={(next) => {
            onSelect(next)
            setOpen(false)
          }}
        />
        {!required && date && (
          <Button
            variant="ghost"
            size="sm"
            className="mx-2.5 mb-2.5"
            onClick={() => {
              onSelect(undefined)
              setOpen(false)
            }}
          >
            Clear
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

function DateField({ value, onChange, ...props }: FieldWidgetProps) {
  return (
    <Field>
      <WidgetLabel {...props} />
      <DatePopover
        id={props.id}
        date={toDate(value)}
        required={props.required}
        className="w-full"
        onSelect={(date) => onChange(date ? format(date, DATE_FORMAT) : null)}
      />
    </Field>
  )
}

function DateTimeField({ value, onChange, ...props }: FieldWidgetProps) {
  const timezone = useSiteTimezone()
  const date = timezone ? toZonedDate(value, timezone) : undefined
  const time = date ? format(date, TIME_FORMAT) : '00:00'

  return (
    <Field>
      <WidgetLabel {...props} />
      <FieldGroup className="flex-row gap-2">
        <DatePopover
          id={props.id}
          date={date}
          required={props.required}
          disabled={!timezone}
          className="flex-1"
          onSelect={(day) =>
            onChange(
              day && timezone ? toUtcIsoString(day, time, timezone) : null,
            )
          }
        />
        <Input
          type="time"
          aria-label={`${props.label} time`}
          value={date ? time : ''}
          disabled={!timezone || !date}
          onChange={(event) => {
            if (date && timezone && event.target.value) {
              onChange(toUtcIsoString(date, event.target.value, timezone))
            }
          }}
          className="w-32 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </FieldGroup>
    </Field>
  )
}

export const fields = {
  date: DateField,
  datetime: DateTimeField,
}
