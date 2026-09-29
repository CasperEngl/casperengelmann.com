import { fileURLToPath } from 'node:url'

import { definePlugin } from 'emdash'

// EmDash only ships `datetime`. Date-only fields are `string` fields with
// `widget: "date:date"` and a `YYYY-MM-DD` validation pattern. Datetime
// fields opt into the shadcn picker with `widget: "date:datetime"`.
const DATE_PLUGIN_ID = 'date'

const pluginVersion = '0.1.0'
const pluginEntrypoint = fileURLToPath(import.meta.url)
const pluginAdminEntry = fileURLToPath(new URL('./admin.tsx', import.meta.url))

export function datePlugin() {
  return {
    id: DATE_PLUGIN_ID,
    version: pluginVersion,
    format: 'native',
    entrypoint: pluginEntrypoint,
    adminEntry: pluginAdminEntry,
    options: {},
  }
}

export function createPlugin() {
  return definePlugin({
    id: DATE_PLUGIN_ID,
    version: pluginVersion,
    admin: {
      entry: pluginAdminEntry,
      fieldWidgets: [
        {
          name: 'date',
          label: 'Date',
          fieldTypes: ['string'],
        },
        {
          name: 'datetime',
          label: 'Date and time',
          fieldTypes: ['datetime'],
        },
      ],
    },
  })
}

export default createPlugin
