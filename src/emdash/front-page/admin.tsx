import React, { useEffect, useState } from 'react'
import { Effect, Schema } from 'effect'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { EmDashApi, emDashApiRuntime } from '../services/api'
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

class FrontPageAdminError extends Schema.TaggedError<FrontPageAdminError>()(
  'FrontPageAdminError',
  {
    message: Schema.String,
    cause: Schema.Unknown,
  },
) {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

const fetchSettings = Effect.fn('fetchFrontPageSettings')(function* () {
  const api = yield* EmDashApi
  const response = yield* api.request(settingsEndpoint)
  return yield* api.parse<FrontPageConfig>(
    response,
    'Could not load front page settings',
  )
})

const saveSettings = Effect.fn('saveFrontPageSettings')(function* (
  config: FrontPageConfig,
) {
  const api = yield* EmDashApi
  const response = yield* api.request(saveEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  return yield* api.parse<FrontPageConfig>(
    response,
    'Could not save front page settings',
  )
})

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

function FrontPageForm({ initialData }: { initialData: FrontPageConfig }) {
  const tanstackQueryClient = useQueryClient()
  const [status, setTemporaryStatus, clearStatus] = useTemporaryState<
    string | null
  >(null, 3000)
  const [saveError, setSaveError] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: (config: FrontPageConfig) =>
      emDashApiRuntime.runPromise(saveSettings(config)),
    onSuccess: (data) => {
      tanstackQueryClient.setQueryData(settingsQueryKey, data)
    },
  })

  const form = useAppForm({
    defaultValues: initialData,
    onSubmit: ({ value, formApi }) => {
      clearStatus()
      setSaveError(null)

      return emDashApiRuntime.runPromise(
        Effect.tryPromise({
          try: () => saveMutation.mutateAsync(value),
          catch: (cause) =>
            new FrontPageAdminError({
              message: 'Could not save front page settings',
              cause,
            }),
        }).pipe(
          Effect.tap((data) =>
            Effect.sync(() => {
              formApi.reset(data)
              setTemporaryStatus('Saved')
            }),
          ),
          Effect.catch((cause) =>
            Effect.sync(() => setSaveError(cause.message)),
          ),
        ),
      )
    },
  })

  // Clear status when the form becomes dirty again
  useEffect(() => {
    if (!status) return

    const subscription = form.store.subscribe(() => {
      if (form.state.isDirty) clearStatus()
    })

    return () => subscription.unsubscribe()
  }, [clearStatus, status, form])

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (form.state.isDirty) event.preventDefault()
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [form])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
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
                <span className="text-kumo-subtle text-sm">
                  Unsaved changes
                </span>
              ) : null
            }
          </form.Subscribe>

          <div aria-live="polite" aria-atomic="true">
            {status && (
              <p className="text-kumo-success m-0 text-sm">{status}</p>
            )}
            {saveError && (
              <p className="text-kumo-danger m-0 text-sm">{saveError}</p>
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
    queryFn: () => emDashApiRuntime.runPromise(fetchSettings()),
  })

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 pb-16">
      <div className="mb-8">
        <h1 className="m-0 text-2xl font-bold text-pretty">Front Page</h1>
        <p className="text-kumo-subtle mt-1.5 text-sm">
          Manage homepage copy and section visibility.
        </p>
      </div>

      {settingsQuery.isPending && (
        <p className="text-kumo-subtle text-sm">Loading\u2026</p>
      )}

      {settingsQuery.isError && (
        <Card>
          <CardContent>
            <p className="text-kumo-danger m-0">
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
