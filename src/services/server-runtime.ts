import { Layer, ManagedRuntime } from 'effect'

import { Database } from '~/lib/db'

import { ContentCollections } from './content-collections'

const SiteLayer = Layer.mergeAll(Database.layer, ContentCollections.layer)

export const siteRuntime = ManagedRuntime.make(SiteLayer)
