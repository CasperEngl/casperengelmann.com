import React, { useEffect, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useAppForm } from '../ui/form'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { useTemporaryState } from '../hooks/use-temporary-state'

type FrontPageConfig = {
  heroCommand: string
  heroCommandFlag: string
  heroName: string
  heroLocation: string
  heroInterests: string
  projectsTitle: string
  starredTitle: string
  experienceTitle: string
  contactTitle: string
  showProjects: boolean
  showStarred: boolean
  showExperience: boolean
  showContact: boolean
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

const settingsEndpoint = '/_emdash/api/plugins/front-page-config/settings'
const saveEndpoint = '/_emdash/api/plugins/front-page-config/settings/save'
const settingsQueryKey = ['front-page-settings'] as const

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

async function parseResponse<T>(response: Response) {
  const payload: unknown = await response.json()
  const hasError =
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    payload.error

  if (!response.ok || hasError) {
    const message =
      typeof payload === 'object' &&
        payload !== null &&
        'error' in payload &&
        payload.error &&
        typeof payload.error === 'object' &&
        'message' in payload.error &&
        typeof payload.error.message === 'string'
        ? payload.error.message
        : 'Request failed'

    throw new Error(message)
  }

  return (
    typeof payload === 'object' && payload !== null && 'data' in payload
      ? payload.data
      : payload
  ) as T
}

async function fetchSettings() {
  return parseResponse<FrontPageConfig>(
    await fetch(settingsEndpoint),
  )
}

async function saveSettings(config: FrontPageConfig) {
  return parseResponse<FrontPageConfig>(
    await fetch(saveEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-EmDash-Request': '1',
      },
      body: JSON.stringify(config),
    }),
  )
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

function FrontPageForm({ initialData }: { initialData: FrontPageConfig }) {
  const tanstackQueryClient = useQueryClient()
  const [status, setTemporaryStatus, clearStatus] =
    useTemporaryState<string | null>(null, 3000)
  const [saveError, setSaveError] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: (data) => {
      tanstackQueryClient.setQueryData(settingsQueryKey, data)
    },
  })

  const form = useAppForm({
    defaultValues: initialData,
    onSubmit: async ({ value, formApi }) => {
      clearStatus()
      setSaveError(null)

      try {
        const data = await saveMutation.mutateAsync(value)
        formApi.reset(data)
        setTemporaryStatus('Saved')
      } catch (cause) {
        setSaveError(
          cause instanceof Error
            ? cause.message
            : 'Failed to save. Check your connection and try again.',
        )
      }
    },
  })

  // Clear status when the form becomes dirty again
  useEffect(() => {
    if (!status) return

    const subscription = form.store.subscribe(() => {
      if (form.state.isDirty) clearStatus()
    })

    return () => subscription.unsubscribe()
  }, [clearStatus, status, form.store, form.state.isDirty])

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (form.state.isDirty) event.preventDefault()
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [form.state.isDirty])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="grid gap-6"
    >
      <form.AppForm>
        {/* Hero */}
        <Card>
          <CardHeader>
            <CardTitle>Hero</CardTitle>
            <CardDescription>
              The terminal block visitors see at the top of the page.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <form.AppField name="heroCommand">
                {(field) => <field.TextField label="Command" />}
              </form.AppField>
              <form.AppField name="heroCommandFlag">
                {(field) => <field.TextField label="Command Flag" />}
              </form.AppField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.AppField name="heroName">
                {(field) => <field.TextField label="Name" />}
              </form.AppField>
              <form.AppField name="heroLocation">
                {(field) => <field.TextField label="Location" />}
              </form.AppField>
            </div>
            <form.AppField name="heroInterests">
              {(field) => <field.TextAreaField label="Interests" rows={3} />}
            </form.AppField>
          </CardContent>
        </Card>

        {/* Section titles */}
        <Card>
          <CardHeader>
            <CardTitle>Section Titles</CardTitle>
            <CardDescription>
              Headings displayed above each content block.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="projectsTitle">
              {(field) => <field.TextField label="Projects" />}
            </form.AppField>
            <form.AppField name="starredTitle">
              {(field) => <field.TextField label="Currently Exploring" />}
            </form.AppField>
            <form.AppField name="experienceTitle">
              {(field) => <field.TextField label="Experience" />}
            </form.AppField>
            <form.AppField name="contactTitle">
              {(field) => <field.TextField label="Contact" />}
            </form.AppField>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
            <CardDescription>
              Choose which sections appear on the homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <form.AppField name="showProjects">
              {(field) => <field.SwitchField label="Projects" />}
            </form.AppField>
            <form.AppField name="showStarred">
              {(field) => <field.SwitchField label="Currently Exploring" />}
            </form.AppField>
            <form.AppField name="showExperience">
              {(field) => <field.SwitchField label="Experience" />}
            </form.AppField>
            <form.AppField name="showContact">
              {(field) => <field.SwitchField label="Contact" />}
            </form.AppField>
          </CardContent>
        </Card>

        {/* Save bar */}
        <div className="flex flex-wrap items-center gap-3">
          <form.SubmitButton
            label="Save Front Page"
            pendingLabel="Saving Front Page\u2026"
          />

          <form.Subscribe selector={(s) => s.isDirty}>
            {(isDirty) =>
              isDirty ? (
                <span className="text-sm text-kumo-subtle">
                  Unsaved changes
                </span>
              ) : null
            }
          </form.Subscribe>

          <div aria-live="polite" aria-atomic="true">
            {status && (
              <p className="m-0 text-sm text-kumo-success">{status}</p>
            )}
            {saveError && (
              <p className="m-0 text-sm text-kumo-danger">{saveError}</p>
            )}
          </div>
        </div>
      </form.AppForm>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

function FrontPageSettingsPage() {
  const settingsQuery = useQuery({
    queryKey: settingsQueryKey,
    queryFn: fetchSettings,
  })

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 pb-16">
      <div className="mb-8">
        <h1 className="m-0 text-2xl font-bold text-pretty">Front Page</h1>
        <p className="mt-1.5 text-sm text-kumo-subtle">
          Manage homepage copy and section visibility.
        </p>
      </div>

      {settingsQuery.isPending && (
        <p className="text-sm text-kumo-subtle">Loading\u2026</p>
      )}

      {settingsQuery.isError && (
        <Card>
          <CardContent>
            <p className="m-0 text-kumo-danger">
              {settingsQuery.error.message}. Check your connection and try
              again.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </CardContent>
        </Card>
      )}

      {settingsQuery.isSuccess && (
        <FrontPageForm initialData={settingsQuery.data} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Export — wrap in QueryClientProvider for standalone admin page
// ---------------------------------------------------------------------------

function FrontPageAdmin() {
  return (
    <QueryClientProvider client={queryClient}>
      <FrontPageSettingsPage />
    </QueryClientProvider>
  )
}

export const pages = {
  '/': FrontPageAdmin,
}
