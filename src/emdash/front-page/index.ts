import { fileURLToPath } from 'node:url'

import { z } from 'astro/zod'
import { Context, Effect, Layer, Schema } from 'effect'
import { definePlugin } from 'emdash'

import {
  defaultFrontPageConfig,
  frontPageConfigSchema,
  frontPageConfigUpdateSchema,
  FRONT_PAGE_PLUGIN_ID,
  normalizeFrontPageConfig,
} from '../../lib/front-page-config.server'

const pluginVersion = '0.1.0'
const settingsKey = 'settings:homepage'
const pluginEntrypoint = fileURLToPath(import.meta.url)
const pluginAdminEntry = fileURLToPath(new URL('./admin.tsx', import.meta.url))

type FrontPagePluginContext = {
  input?: unknown
  kv: FrontPageKeyValueStore
  request: Request
}

type FrontPageKeyValueStore = {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<void>
}

const adminPages = [
  {
    path: '/',
    label: 'Front Page',
    icon: 'house',
  },
]

function toObject(value: unknown) {
  return value && typeof value === 'object' ? value : {}
}

class MethodNotAllowedError extends Schema.TaggedError<MethodNotAllowedError>()(
  'MethodNotAllowedError',
  { message: Schema.String },
) {}

class FrontPageSettingsError extends Schema.TaggedError<FrontPageSettingsError>()(
  'FrontPageSettingsError',
  { operation: Schema.String, cause: Schema.Unknown },
) {}

class FrontPageSettingsStore extends Context.Service<
  FrontPageSettingsStore,
  {
    readonly get: () => Effect.Effect<unknown, FrontPageSettingsError>
    readonly set: (
      value: unknown,
    ) => Effect.Effect<void, FrontPageSettingsError>
  }
>()('app/FrontPageSettingsStore') {}

const frontPageSettingsStoreLayer = (kv: FrontPageKeyValueStore) =>
  Layer.succeed(FrontPageSettingsStore, {
    get: Effect.fn('FrontPageSettingsStore.get')(() =>
      Effect.tryPromise({
        try: () => kv.get(settingsKey),
        catch: (cause) =>
          new FrontPageSettingsError({
            operation: 'Load front page settings',
            cause,
          }),
      }),
    ),
    set: Effect.fn('FrontPageSettingsStore.set')((value: unknown) =>
      Effect.tryPromise({
        try: () => kv.set(settingsKey, value),
        catch: (cause) =>
          new FrontPageSettingsError({
            operation: 'Save front page settings',
            cause,
          }),
      }),
    ),
  })

const loadSettings = Effect.fn('loadFrontPageSettings')(function* () {
  const store = yield* FrontPageSettingsStore
  const value = yield* store.get()
  return normalizeFrontPageConfig(value ?? defaultFrontPageConfig)
})

const saveSettings = Effect.fn('saveFrontPageSettings')(function* (
  method: string,
  input: unknown,
) {
  if (method !== 'POST') {
    return yield* new MethodNotAllowedError({ message: 'Method not allowed' })
  }

  const store = yield* FrontPageSettingsStore
  const stored = yield* store.get()
  const current = normalizeFrontPageConfig(stored)
  const nextConfig = normalizeFrontPageConfig({
    ...current,
    ...toObject(input),
  })

  yield* store.set(nextConfig)

  return nextConfig
})

export function frontPagePlugin() {
  return {
    id: FRONT_PAGE_PLUGIN_ID,
    version: pluginVersion,
    format: 'native',
    entrypoint: pluginEntrypoint,
    adminEntry: pluginAdminEntry,
    adminPages,
    options: {},
  }
}

export function createPlugin() {
  return definePlugin({
    id: FRONT_PAGE_PLUGIN_ID,
    version: pluginVersion,
    routes: {
      settings: {
        handler: (ctx: FrontPagePluginContext) =>
          Effect.runPromise(
            loadSettings().pipe(
              Effect.provide(frontPageSettingsStoreLayer(ctx.kv)),
            ),
          ),
      },
      'settings/save': {
        input: z.union([frontPageConfigSchema, frontPageConfigUpdateSchema]),
        handler: (ctx: FrontPagePluginContext) =>
          Effect.runPromise(
            saveSettings(ctx.request.method, ctx.input).pipe(
              Effect.provide(frontPageSettingsStoreLayer(ctx.kv)),
            ),
          ),
      },
    },
    admin: {
      pages: adminPages,
    },
  })
}

export default createPlugin
