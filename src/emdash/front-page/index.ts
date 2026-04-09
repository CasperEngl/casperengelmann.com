import { fileURLToPath } from 'node:url'

import { z } from 'astro/zod'
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
  kv: {
    get: (key: string) => Promise<unknown>
    set: (key: string, value: unknown) => Promise<void>
  }
  request: Request
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
        handler: async (ctx: FrontPagePluginContext) =>
          normalizeFrontPageConfig(
            (await ctx.kv.get(settingsKey)) ?? defaultFrontPageConfig,
          ),
      },
      'settings/save': {
        input: z.union([frontPageConfigSchema, frontPageConfigUpdateSchema]),
        handler: async (ctx: FrontPagePluginContext) => {
          if (ctx.request.method !== 'POST') {
            throw new Error('Method not allowed')
          }

          const current = normalizeFrontPageConfig(await ctx.kv.get(settingsKey))
          const nextConfig = normalizeFrontPageConfig({
            ...current,
            ...toObject(ctx.input),
          })

          await ctx.kv.set(settingsKey, nextConfig)

          return nextConfig
        },
      },
    },
    admin: {
      pages: adminPages,
    },
  })
}

export default createPlugin
