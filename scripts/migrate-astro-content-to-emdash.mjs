#!/usr/bin/env node

// @effect-diagnostics effect/effectFnImplicitAny:off effect/missingEffectContext:off

import { createHash } from 'node:crypto'
import path from 'node:path'

import { NodeFileSystem } from '@effect/platform-node'
import { Config, Context, Effect, FileSystem, Layer, Schema } from 'effect'
import { FetchHttpClient, HttpClient } from 'effect/http'
import { load as loadYaml } from 'js-yaml'
import { Kysely, sql } from 'kysely'
import mime from 'mime/lite'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { mdxFromMarkdown } from 'mdast-util-mdx'
import { toString } from 'mdast-util-to-string'
import { mdxjs } from 'micromark-extension-mdxjs'
import {
  ContentRepository,
  MediaRepository,
  SchemaRegistry,
  ulid,
} from 'emdash'
import { runMigrations } from 'emdash/db'
import { createDialect } from 'emdash/db/sqlite'
import { mediaItemToValue } from 'emdash/media'
import { LocalStorage } from 'emdash/storage/local'
import { imageSize } from 'image-size'

const ROOT = process.cwd()
const MigrationConfig = Config.all({
  databaseUrl: Config.String('EMDASH_DB_URL').pipe(
    Config.withDefault('file:./data/data.db'),
  ),
  uploadsDirectory: Config.String('EMDASH_UPLOADS_DIR').pipe(
    Config.withDefault('./data/uploads'),
  ),
  mediaBaseUrl: Config.String('EMDASH_MEDIA_BASE_URL').pipe(
    Config.withDefault('/_emdash/api/media/file'),
  ),
})

const MigrationResources = Context.Service('app/MigrationResources')

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const verbose = args.has('--verbose')

let keyCounter = 0

class MigrationError extends Schema.TaggedError()('MigrationError', {
  operation: Schema.String,
  message: Schema.String,
  cause: Schema.Unknown,
}) {}

function errorMessage(cause) {
  return cause instanceof Error ? cause.message : String(cause)
}

function migrationError(operation, cause) {
  return new MigrationError({
    operation,
    message: `${operation}: ${errorMessage(cause)}`,
    cause,
  })
}

function fail(operation, message, cause = message) {
  return new MigrationError({ operation, message, cause })
}

function nextKey() {
  keyCounter += 1
  return `mig_${keyCounter.toString(36)}`
}

function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeFilename(filename) {
  const ext = path.extname(filename)
  const base = path.basename(filename, ext)
  const safeBase = slugify(base) || 'file'
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, '')
  return `${safeBase}${safeExt}`
}

function log(...parts) {
  console.log('[migrate]', ...parts)
}

function debug(...parts) {
  if (verbose) {
    console.log('[migrate:debug]', ...parts)
  }
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: source }
  }

  const frontmatter = loadYaml(match[1]) ?? {}
  if (frontmatter && typeof frontmatter !== 'object') {
    throw new Error('Frontmatter must deserialize into an object')
  }

  return {
    frontmatter,
    body: match[2],
  }
}

const walkFiles = Effect.fn('walkFiles')(function* (directory) {
  const fileSystem = yield* FileSystem.FileSystem
  const entries = yield* fileSystem.readDirectory(directory)
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry)
    const info = yield* fileSystem.stat(absolutePath)
    if (info.type === 'Directory') {
      files.push(...(yield* walkFiles(absolutePath)))
      continue
    }

    if (/\.(md|mdx)$/i.test(entry)) {
      files.push(absolutePath)
    }
  }

  return files.sort()
})

function parseMarkdownAst(markdown, extension) {
  const isMdx = extension.toLowerCase() === '.mdx'
  return fromMarkdown(markdown, {
    extensions: isMdx ? [mdxjs()] : [],
    mdastExtensions: isMdx ? [mdxFromMarkdown()] : [],
  })
}

function sliceSource(node, source) {
  const start = node?.position?.start?.offset
  const end = node?.position?.end?.offset
  if (typeof start === 'number' && typeof end === 'number') {
    return source.slice(start, end)
  }
  return null
}

function emptySpan() {
  return {
    _type: 'span',
    _key: nextKey(),
    text: '',
    marks: [],
  }
}

function createTextBlock(children, markDefs, style = 'normal', extra = {}) {
  return {
    _type: 'block',
    _key: nextKey(),
    style,
    children: children.length > 0 ? children : [emptySpan()],
    ...(markDefs.length > 0 ? { markDefs } : {}),
    ...extra,
  }
}

function appendText(children, text, marks = []) {
  if (!text) {
    return
  }

  const previous = children.at(-1)
  const sameMarks =
    previous &&
    previous._type === 'span' &&
    JSON.stringify(previous.marks ?? []) === JSON.stringify(marks)

  if (sameMarks) {
    previous.text += text
    return
  }

  children.push({
    _type: 'span',
    _key: nextKey(),
    text,
    marks,
  })
}

function convertInlineNodes(nodes, markdownSource, activeMarks = []) {
  const children = []
  const markDefs = []

  function walk(node, marks) {
    switch (node.type) {
      case 'text':
        appendText(children, node.value, marks)
        return
      case 'inlineCode':
        appendText(children, node.value, [...marks, 'code'])
        return
      case 'strong':
        for (const child of node.children ?? []) {
          walk(child, [...marks, 'strong'])
        }
        return
      case 'emphasis':
        for (const child of node.children ?? []) {
          walk(child, [...marks, 'em'])
        }
        return
      case 'delete':
        for (const child of node.children ?? []) {
          walk(child, [...marks, 'strike-through'])
        }
        return
      case 'break':
        appendText(children, '\n', marks)
        return
      case 'link': {
        const markKey = nextKey()
        markDefs.push({
          _key: markKey,
          _type: 'link',
          href: node.url,
        })
        for (const child of node.children ?? []) {
          walk(child, [...marks, markKey])
        }
        return
      }
      case 'image':
        appendText(children, node.alt || node.url || '', marks)
        return
      case 'html':
      case 'mdxTextExpression':
      case 'mdxJsxTextElement':
      case 'mdxFlowExpression':
      case 'mdxJsxFlowElement':
      case 'mdxjsEsm': {
        appendText(
          children,
          sliceSource(node, markdownSource) ?? toString(node),
          marks,
        )
        return
      }
      default:
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            walk(child, marks)
          }
          return
        }
        appendText(children, toString(node), marks)
    }
  }

  for (const node of nodes) {
    walk(node, activeMarks)
  }

  return {
    children: children.length > 0 ? children : [emptySpan()],
    markDefs,
  }
}

function nodeHasOnlyImages(node) {
  return (node.children ?? []).every((child) => {
    if (child.type === 'image') {
      return true
    }
    return child.type === 'text' && child.value.trim() === ''
  })
}

const resolveAssetInput = Effect.fn('resolveAssetInput')(
  function* (input, sourceFile) {
    if (!input) {
      return null
    }

    if (/^https?:\/\//i.test(input)) {
      const client = yield* HttpClient.HttpClient
      const response = yield* client.get(input)
      if (response.status < 200 || response.status >= 300) {
        return yield* fail(
          'Download remote asset',
          `Failed to download remote asset: ${input} (${response.status})`,
        )
      }

      const url = new URL(input)
      const arrayBuffer = yield* response.arrayBuffer
      const buffer = Buffer.from(arrayBuffer)
      const contentTypeHeader = response.headers['content-type']?.split(';')[0]
      const filenameFromUrl = path.basename(url.pathname) || 'remote-asset'
      const filename = sanitizeFilename(filenameFromUrl)

      return {
        buffer,
        filename,
        mimeType:
          contentTypeHeader ??
          mime.getType(filename) ??
          'application/octet-stream',
        originalPath: input,
      }
    }

    const fileSystem = yield* FileSystem.FileSystem
    const candidates = []

    if (path.isAbsolute(input)) {
      candidates.push(input)
      candidates.push(path.join(ROOT, 'public', input.replace(/^\/+/, '')))
      candidates.push(path.join(ROOT, input.replace(/^\/+/, '')))
    } else {
      candidates.push(path.resolve(path.dirname(sourceFile), input))
      candidates.push(path.resolve(ROOT, input))
      candidates.push(path.resolve(ROOT, 'public', input))
      candidates.push(path.resolve(ROOT, 'src', input))
    }

    for (const candidate of candidates) {
      const buffer = yield* fileSystem
        .readFile(candidate)
        .pipe(Effect.catch(() => Effect.succeed(null)))
      if (buffer) {
        return {
          buffer,
          filename: sanitizeFilename(path.basename(candidate)),
          mimeType: mime.getType(candidate) ?? 'application/octet-stream',
          originalPath: candidate,
        }
      }
    }

    return yield* fail(
      'Resolve asset',
      `Could not resolve asset "${input}" from ${sourceFile}`,
    )
  },
)

function getImageMetadata(buffer) {
  return Effect.try({
    try: () => imageSize(buffer),
    catch: (cause) => migrationError('Read image metadata', cause),
  }).pipe(
    Effect.map((metadata) => ({
      width: metadata.width ?? undefined,
      height: metadata.height ?? undefined,
    })),
    Effect.catch(() => Effect.succeed({})),
  )
}

function toMediaValue(media) {
  return mediaItemToValue('local', {
    id: media.id,
    filename: media.filename,
    mimeType: media.mimeType,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    alt: media.alt ?? undefined,
    meta: {},
  })
}

function hashBuffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function readValue(spec, context) {
  if (typeof spec === 'function') {
    return spec(context)
  }

  if (typeof spec === 'string') {
    return context.frontmatter[spec]
  }

  if (spec && typeof spec === 'object' && 'from' in spec) {
    if (typeof spec.from === 'function') {
      return spec.from(context)
    }
    if (typeof spec.from === 'string') {
      return context.frontmatter[spec.from]
    }
  }

  return spec
}

function normalizeDateField(value) {
  if (value == null || value === '') {
    return null
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  const stringValue = String(value)
  if (/^\d{4}-\d{2}$/.test(stringValue)) {
    return `${stringValue}-01`
  }

  return stringValue
}

const upsertSeo = Effect.fn('upsertSeo')(
  function* (db, collectionSlug, contentId, input) {
    const hasAnyField = Object.values(input).some(
      (value) => value !== undefined && value !== null,
    )
    if (!hasAnyField) {
      return
    }

    const now = new Date().toISOString()

    yield* Effect.tryPromise({
      try: () =>
        sql`
    INSERT INTO _emdash_seo (
      collection, content_id,
      seo_title, seo_description, seo_image, seo_canonical, seo_no_index,
      created_at, updated_at
    ) VALUES (
      ${collectionSlug}, ${contentId},
      ${input.title ?? null}, ${input.description ?? null},
      ${input.image ?? null}, ${input.canonical ?? null},
      ${input.noIndex ? 1 : 0},
      ${now}, ${now}
    )
    ON CONFLICT (collection, content_id) DO UPDATE SET
      seo_title = ${input.title ?? null},
      seo_description = ${input.description ?? null},
      seo_image = ${input.image ?? null},
      seo_canonical = ${input.canonical ?? null},
      seo_no_index = ${input.noIndex ? 1 : 0},
      updated_at = ${now}
  `.execute(db),
      catch: (cause) => migrationError('Upsert SEO metadata', cause),
    })
  },
)

const ensureByline = Effect.fn('ensureByline')(function* (db, rawByline) {
  const input =
    typeof rawByline === 'string'
      ? {
          slug: slugify(rawByline),
          displayName: rawByline,
          isGuest: true,
        }
      : {
          slug:
            rawByline.slug ?? slugify(rawByline.name ?? rawByline.displayName),
          displayName: rawByline.displayName ?? rawByline.name,
          bio: rawByline.bio ?? null,
          websiteUrl: rawByline.websiteUrl ?? rawByline.url ?? null,
          avatarMediaId: rawByline.avatarMediaId ?? null,
          isGuest: rawByline.isGuest ?? true,
        }

  if (!input.slug || !input.displayName) {
    return yield* fail(
      'Validate byline',
      `Invalid byline input: ${JSON.stringify(rawByline)}`,
    )
  }

  const existing = yield* Effect.tryPromise({
    try: () =>
      db
        .selectFrom('_emdash_bylines')
        .selectAll()
        .where('slug', '=', input.slug)
        .executeTakeFirst(),
    catch: (cause) => migrationError('Find existing byline', cause),
  })

  if (existing) {
    return existing
  }

  const now = new Date().toISOString()
  const id = ulid()

  yield* Effect.tryPromise({
    try: () =>
      db
        .insertInto('_emdash_bylines')
        .values({
          id,
          slug: input.slug,
          display_name: input.displayName,
          bio: input.bio ?? null,
          avatar_media_id: input.avatarMediaId ?? null,
          website_url: input.websiteUrl ?? null,
          user_id: null,
          is_guest: input.isGuest ? 1 : 0,
          created_at: now,
          updated_at: now,
        })
        .execute(),
    catch: (cause) => migrationError('Create byline', cause),
  })

  return yield* Effect.tryPromise({
    try: () =>
      db
        .selectFrom('_emdash_bylines')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow(),
    catch: (cause) => migrationError('Load created byline', cause),
  })
})

const setContentBylines = Effect.fn('setContentBylines')(
  function* (db, collectionSlug, contentId, bylines) {
    yield* Effect.tryPromise({
      try: () =>
        db
          .deleteFrom('_emdash_content_bylines')
          .where('collection_slug', '=', collectionSlug)
          .where('content_id', '=', contentId)
          .execute(),
      catch: (cause) => migrationError('Clear content bylines', cause),
    })

    for (const [index, byline] of bylines.entries()) {
      yield* Effect.tryPromise({
        try: () =>
          db
            .insertInto('_emdash_content_bylines')
            .values({
              id: ulid(),
              collection_slug: collectionSlug,
              content_id: contentId,
              byline_id: byline.id,
              sort_order: index,
              role_label: byline.roleLabel ?? null,
              created_at: new Date().toISOString(),
            })
            .execute(),
        catch: (cause) => migrationError('Attach content byline', cause),
      })
    }

    yield* Effect.tryPromise({
      try: () =>
        sql`
    UPDATE ${sql.ref(`ec_${collectionSlug}`)}
    SET primary_byline_id = ${bylines[0]?.id ?? null}
    WHERE id = ${contentId}
  `.execute(db),
      catch: (cause) => migrationError('Set the primary content byline', cause),
    })
  },
)

const ensureTaxonomyTerm = Effect.fn('ensureTaxonomyTerm')(
  function* (db, taxonomyName, rawTerm) {
    const label =
      typeof rawTerm === 'string' ? rawTerm : (rawTerm.label ?? rawTerm.name)
    const slug =
      typeof rawTerm === 'string'
        ? slugify(rawTerm)
        : (rawTerm.slug ?? slugify(label))
    const parentSlug =
      typeof rawTerm === 'object' ? (rawTerm.parentSlug ?? null) : null

    if (!label || !slug) {
      return yield* fail(
        'Validate taxonomy term',
        `Invalid taxonomy term: ${JSON.stringify(rawTerm)}`,
      )
    }

    const existing = yield* Effect.tryPromise({
      try: () =>
        db
          .selectFrom('taxonomies')
          .selectAll()
          .where('name', '=', taxonomyName)
          .where('slug', '=', slug)
          .executeTakeFirst(),
      catch: (cause) => migrationError('Find existing taxonomy term', cause),
    })

    if (existing) {
      return existing
    }

    let parentId = null
    if (parentSlug) {
      const parent = yield* Effect.tryPromise({
        try: () =>
          db
            .selectFrom('taxonomies')
            .selectAll()
            .where('name', '=', taxonomyName)
            .where('slug', '=', parentSlug)
            .executeTakeFirst(),
        catch: (cause) => migrationError('Find parent taxonomy term', cause),
      })

      parentId = parent?.id ?? null
    }

    const id = ulid()
    yield* Effect.tryPromise({
      try: () =>
        db
          .insertInto('taxonomies')
          .values({
            id,
            name: taxonomyName,
            slug,
            label,
            parent_id: parentId,
            data: null,
          })
          .execute(),
      catch: (cause) => migrationError('Create taxonomy term', cause),
    })

    return yield* Effect.tryPromise({
      try: () =>
        db
          .selectFrom('taxonomies')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirstOrThrow(),
      catch: (cause) => migrationError('Load created taxonomy term', cause),
    })
  },
)

const setTaxonomyTerms = Effect.fn('setTaxonomyTerms')(
  function* (db, collectionSlug, contentId, taxonomyName, termIds) {
    const existingRows = yield* Effect.tryPromise({
      try: () =>
        db
          .selectFrom('content_taxonomies')
          .innerJoin(
            'taxonomies',
            'taxonomies.id',
            'content_taxonomies.taxonomy_id',
          )
          .select(['content_taxonomies.taxonomy_id as taxonomy_id'])
          .where('content_taxonomies.collection', '=', collectionSlug)
          .where('content_taxonomies.entry_id', '=', contentId)
          .where('taxonomies.name', '=', taxonomyName)
          .execute(),
      catch: (cause) => migrationError('Load content taxonomy terms', cause),
    })

    const existingIds = new Set(existingRows.map((row) => row.taxonomy_id))
    const nextIds = new Set(termIds)

    const toDelete = [...existingIds].filter((id) => !nextIds.has(id))
    if (toDelete.length > 0) {
      yield* Effect.tryPromise({
        try: () =>
          db
            .deleteFrom('content_taxonomies')
            .where('collection', '=', collectionSlug)
            .where('entry_id', '=', contentId)
            .where('taxonomy_id', 'in', toDelete)
            .execute(),
        catch: (cause) =>
          migrationError('Remove stale content taxonomy terms', cause),
      })
    }

    const toInsert = [...nextIds].filter((id) => !existingIds.has(id))
    if (toInsert.length > 0) {
      yield* Effect.tryPromise({
        try: () =>
          db
            .insertInto('content_taxonomies')
            .values(
              toInsert.map((taxonomyId) => ({
                collection: collectionSlug,
                entry_id: contentId,
                taxonomy_id: taxonomyId,
              })),
            )
            .onConflict((builder) => builder.doNothing())
            .execute(),
        catch: (cause) =>
          migrationError('Attach content taxonomy terms', cause),
      })
    }
  },
)

const COLLECTION_MIGRATIONS = [
  {
    collection: 'experience',
    sourceDir: 'src/content/experience',
    bodyField: 'body',
    slug: ({ frontmatter, slug }) => frontmatter.slug ?? slug,
    status: ({ frontmatter }) => frontmatter.status ?? 'published',
    publishedAt: ({ frontmatter }) => frontmatter.publishedAt ?? null,
    fields: {
      title: ({ frontmatter }) =>
        frontmatter.title ?? `${frontmatter.role} at ${frontmatter.company}`,
      company: 'company',
      role: 'role',
      start_date: ({ frontmatter }) =>
        normalizeDateField(frontmatter.startDate),
      end_date: ({ frontmatter }) => normalizeDateField(frontmatter.endDate),
      link: 'link',
    },
    bylines: null,
    taxonomies: {},
    seo: null,
  },
]

function normalizeArray(value) {
  if (value == null) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

class EmDashMigrator {
  constructor({ db, contentRepo, mediaRepo, schemaRegistry, storage }) {
    this.db = db
    this.contentRepo = contentRepo
    this.mediaRepo = mediaRepo
    this.schemaRegistry = schemaRegistry
    this.storage = storage
    this.report = {
      created: 0,
      updated: 0,
      mediaCreated: 0,
      mediaReused: 0,
      warnings: [],
    }
  }

  ensureSchema = Effect.fn('EmDashMigrator.ensureSchema')(
    function* (collectionSlug) {
      const collection = yield* Effect.tryPromise({
        try: () => this.schemaRegistry.getCollectionWithFields(collectionSlug),
        catch: (cause) => migrationError('Load collection schema', cause),
      })
      if (!collection) {
        const availableCollections = yield* Effect.tryPromise({
          try: () => this.schemaRegistry.listCollections(),
          catch: (cause) => migrationError('List collection schemas', cause),
        })
        const availableSlugs = availableCollections
          .map((item) => item.slug)
          .sort()
        const availableLabel =
          availableSlugs.length > 0 ? availableSlugs.join(', ') : '(none)'
        return yield* fail(
          'Validate collection schema',
          `Collection "${collectionSlug}" does not exist in the current EmDash database.\n` +
            `Available collections: ${availableLabel}\n` +
            `If this repo's schema seed has not been applied yet, run:\n` +
            `bunx emdash seed --database ./data/data.db --uploads-dir ./data/uploads --cwd . --on-conflict update\n` +
            `Then rerun the migration.`,
        )
      }
      return collection
    },
  )

  ensureMediaFromReference = Effect.fn(
    'EmDashMigrator.ensureMediaFromReference',
  )(function* (reference, context, options = {}) {
    if (!reference) {
      return null
    }

    const asset = yield* resolveAssetInput(reference, context.sourceFile)
    const contentHash = hashBuffer(asset.buffer)
    const existing = yield* Effect.tryPromise({
      try: () => this.mediaRepo.findByContentHash(contentHash),
      catch: (cause) => migrationError('Find existing media', cause),
    })

    if (existing) {
      this.report.mediaReused += 1
      return {
        media: existing,
        url: this.storage.getPublicUrl(existing.storageKey),
        value: toMediaValue(existing),
      }
    }

    const storageKey = `migrated/${context.collection}/${context.slug}/${contentHash.slice(0, 12)}-${asset.filename}`
    const metadata = yield* getImageMetadata(asset.buffer)

    if (!dryRun) {
      yield* Effect.tryPromise({
        try: () =>
          this.storage.upload({
            key: storageKey,
            body: asset.buffer,
            contentType: asset.mimeType,
          }),
        catch: (cause) => migrationError('Upload migrated media', cause),
      })
    }

    const mediaInput = {
      filename: asset.filename,
      mimeType: asset.mimeType,
      size: asset.buffer.length,
      width: metadata.width,
      height: metadata.height,
      alt: options.alt ?? null,
      caption: options.caption ?? null,
      storageKey,
      contentHash,
      status: 'ready',
    }

    const media = dryRun
      ? {
          id: `dry_${contentHash.slice(0, 16)}`,
          createdAt: new Date().toISOString(),
          authorId: null,
          dominantColor: null,
          blurhash: null,
          ...mediaInput,
        }
      : yield* Effect.tryPromise({
          try: () => this.mediaRepo.create(mediaInput),
          catch: (cause) => migrationError('Create migrated media', cause),
        })

    this.report.mediaCreated += 1

    return {
      media,
      url: this.storage.getPublicUrl(storageKey),
      value: toMediaValue(media),
    }
  })

  convertMarkdownToPortableText = Effect.fn(
    'EmDashMigrator.convertMarkdownToPortableText',
  )(function* (markdown, context) {
    const extension = path.extname(context.sourceFile) || '.md'
    const ast = yield* Effect.try({
      try: () => parseMarkdownAst(markdown, extension),
      catch: (cause) => migrationError('Parse Markdown', cause),
    })
    const blocks = []

    for (const node of ast.children ?? []) {
      blocks.push(...(yield* this.convertBlockNode(node, markdown, context)))
    }

    return blocks
  })

  convertBlockNode = Effect.fn('EmDashMigrator.convertBlockNode')(function* (
    node,
    markdownSource,
    context,
    listMeta = null,
  ) {
    switch (node.type) {
      case 'paragraph': {
        if (nodeHasOnlyImages(node)) {
          const imageBlocks = []
          for (const child of node.children ?? []) {
            if (child.type !== 'image') {
              continue
            }
            const uploaded = yield* this.ensureMediaFromReference(
              child.url,
              context,
              {
                alt: child.alt ?? '',
                caption: child.title ?? null,
              },
            )

            if (!uploaded) {
              continue
            }

            imageBlocks.push({
              _type: 'image',
              _key: nextKey(),
              asset: {
                _ref: uploaded.media.id,
                url: uploaded.url,
              },
              alt: child.alt ?? '',
              caption: child.title ?? undefined,
              width: uploaded.media.width ?? undefined,
              height: uploaded.media.height ?? undefined,
            })
          }
          return imageBlocks
        }

        const { children, markDefs } = convertInlineNodes(
          node.children ?? [],
          markdownSource,
        )
        return [
          createTextBlock(
            children,
            markDefs,
            listMeta?.style ?? 'normal',
            listMeta ?? {},
          ),
        ]
      }
      case 'heading': {
        const { children, markDefs } = convertInlineNodes(
          node.children ?? [],
          markdownSource,
        )
        return [
          createTextBlock(children, markDefs, `h${Math.min(node.depth, 6)}`),
        ]
      }
      case 'blockquote': {
        const blocks = []
        for (const child of node.children ?? []) {
          if (child.type === 'paragraph') {
            const { children, markDefs } = convertInlineNodes(
              child.children ?? [],
              markdownSource,
            )
            blocks.push(createTextBlock(children, markDefs, 'blockquote'))
            continue
          }
          blocks.push(
            ...(yield* this.convertBlockNode(child, markdownSource, context)),
          )
        }
        return blocks
      }
      case 'list': {
        const blocks = []
        for (const item of node.children ?? []) {
          blocks.push(
            ...(yield* this.convertListItem(item, markdownSource, context, {
              listItem: node.ordered ? 'number' : 'bullet',
              level: (listMeta?.level ?? 0) + 1,
            })),
          )
        }
        return blocks
      }
      case 'code':
        return [
          {
            _type: 'code',
            _key: nextKey(),
            code: node.value,
            ...(node.lang ? { language: node.lang } : {}),
            ...(node.meta ? { filename: node.meta } : {}),
          },
        ]
      case 'thematicBreak':
        return [
          {
            _type: 'break',
            _key: nextKey(),
            style: 'line',
          },
        ]
      case 'image': {
        const uploaded = yield* this.ensureMediaFromReference(
          node.url,
          context,
          {
            alt: node.alt ?? '',
            caption: node.title ?? null,
          },
        )

        if (!uploaded) {
          return []
        }

        return [
          {
            _type: 'image',
            _key: nextKey(),
            asset: {
              _ref: uploaded.media.id,
              url: uploaded.url,
            },
            alt: node.alt ?? '',
            caption: node.title ?? undefined,
            width: uploaded.media.width ?? undefined,
            height: uploaded.media.height ?? undefined,
          },
        ]
      }
      case 'html':
      case 'mdxjsEsm':
      case 'mdxFlowExpression':
      case 'mdxJsxFlowElement': {
        const rawSource = sliceSource(node, markdownSource) ?? toString(node)
        this.report.warnings.push(
          `${path.relative(ROOT, context.sourceFile)} contains unsupported ${node.type}; stored as an mdx code block for manual review.`,
        )
        return [
          {
            _type: 'code',
            _key: nextKey(),
            code: rawSource,
            language: node.type.startsWith('mdx') ? 'mdx' : 'html',
          },
        ]
      }
      default:
        if (Array.isArray(node.children)) {
          const blocks = []
          for (const child of node.children) {
            blocks.push(
              ...(yield* this.convertBlockNode(
                child,
                markdownSource,
                context,
                listMeta,
              )),
            )
          }
          return blocks
        }

        this.report.warnings.push(
          `${path.relative(ROOT, context.sourceFile)} contains unsupported node type "${node.type}".`,
        )
        return []
    }
  })

  convertListItem = Effect.fn('EmDashMigrator.convertListItem')(
    function* (item, markdownSource, context, listMeta) {
      const blocks = []

      for (const child of item.children ?? []) {
        if (child.type === 'paragraph') {
          const { children, markDefs } = convertInlineNodes(
            child.children ?? [],
            markdownSource,
          )
          blocks.push(createTextBlock(children, markDefs, 'normal', listMeta))
          continue
        }

        if (child.type === 'list') {
          blocks.push(
            ...(yield* this.convertBlockNode(child, markdownSource, context, {
              ...listMeta,
              level: listMeta.level,
            })),
          )
          continue
        }

        blocks.push(
          ...(yield* this.convertBlockNode(child, markdownSource, context)),
        )
      }

      return blocks
    },
  )

  resolveFieldValue = Effect.fn('EmDashMigrator.resolveFieldValue')(
    function* (spec, context) {
      const rawValue = readValue(spec, context)

      if (
        spec &&
        typeof spec === 'object' &&
        !Array.isArray(spec) &&
        hasOwn(spec, 'kind')
      ) {
        switch (spec.kind) {
          case 'image': {
            if (!rawValue) {
              return null
            }
            const uploaded = yield* this.ensureMediaFromReference(
              rawValue,
              context,
              {
                alt: spec.altFrom ? context.frontmatter[spec.altFrom] : '',
                caption: spec.captionFrom
                  ? context.frontmatter[spec.captionFrom]
                  : null,
              },
            )
            return uploaded?.value ?? null
          }
          case 'imageUrl': {
            if (!rawValue) {
              return null
            }
            const uploaded = yield* this.ensureMediaFromReference(
              rawValue,
              context,
              {
                alt: spec.altFrom ? context.frontmatter[spec.altFrom] : '',
                caption: spec.captionFrom
                  ? context.frontmatter[spec.captionFrom]
                  : null,
              },
            )
            return uploaded?.url ?? null
          }
          case 'portableText':
            return rawValue
              ? yield* this.convertMarkdownToPortableText(
                  String(rawValue),
                  context,
                )
              : []
          default:
            return rawValue ?? null
        }
      }

      return rawValue ?? null
    },
  )

  migrateCollection = Effect.fn('EmDashMigrator.migrateCollection')(
    function* (config) {
      const fileSystem = yield* FileSystem.FileSystem
      const collection = yield* this.ensureSchema(config.collection)
      const absoluteSourceDir = path.resolve(ROOT, config.sourceDir)
      const files = yield* walkFiles(absoluteSourceDir)

      log(`Migrating ${files.length} files into "${config.collection}"`)

      for (const sourceFile of files) {
        const source = yield* fileSystem.readFileString(sourceFile)
        const { frontmatter, body } = yield* Effect.try({
          try: () => parseFrontmatter(source),
          catch: (cause) =>
            migrationError(`Parse frontmatter in ${sourceFile}`, cause),
        })
        const relativePath = path.relative(absoluteSourceDir, sourceFile)
        const slugFromPath = relativePath
          .replace(/\.(md|mdx)$/i, '')
          .replace(/\\/g, '/')
        const context = {
          collection: config.collection,
          sourceFile,
          source,
          frontmatter,
          slug: slugFromPath,
        }

        const slug = readValue(config.slug, context)
        if (!slug) {
          return yield* fail(
            'Resolve content slug',
            `Could not determine slug for ${sourceFile}`,
          )
        }

        context.slug = String(slug)

        const status = String(readValue(config.status, context) ?? 'draft')
        const publishedAt = readValue(config.publishedAt, context) ?? null

        const data = {}
        for (const [fieldName, spec] of Object.entries(config.fields ?? {})) {
          const value = yield* this.resolveFieldValue(spec, context)
          if (value !== undefined) {
            data[fieldName] = value
          }
        }

        data[config.bodyField ?? 'body'] =
          yield* this.convertMarkdownToPortableText(body, context)

        const existing = dryRun
          ? null
          : yield* Effect.tryPromise({
              try: () =>
                this.contentRepo.findBySlug(config.collection, context.slug),
              catch: (cause) =>
                migrationError('Find existing content entry', cause),
            })
        const mode = existing ? 'update' : 'create'

        debug(`${mode} ${config.collection}/${context.slug}`)

        const content = dryRun
          ? {
              id: `dry_${config.collection}_${context.slug}`,
              slug: context.slug,
              type: config.collection,
              status,
              data,
              publishedAt,
            }
          : existing
            ? yield* Effect.tryPromise({
                try: () =>
                  this.contentRepo.update(config.collection, existing.id, {
                    slug: context.slug,
                    status,
                    publishedAt,
                    data,
                  }),
                catch: (cause) => migrationError('Update content entry', cause),
              })
            : yield* Effect.tryPromise({
                try: () =>
                  this.contentRepo.create({
                    type: config.collection,
                    slug: context.slug,
                    status,
                    publishedAt,
                    data,
                  }),
                catch: (cause) => migrationError('Create content entry', cause),
              })

        if (mode === 'create') {
          this.report.created += 1
        } else {
          this.report.updated += 1
        }

        if (config.bylines) {
          const bylineValues = normalizeArray(
            readValue(config.bylines.field, context),
          )
          const bylines = []
          for (const value of bylineValues) {
            const byline = yield* ensureByline(this.db, value)
            bylines.push({
              id: byline.id,
              roleLabel: config.bylines.roleLabel ?? null,
            })
          }
          if (!dryRun) {
            yield* setContentBylines(
              this.db,
              config.collection,
              content.id,
              bylines,
            )
          }
        }

        for (const taxonomyConfig of Object.values(config.taxonomies ?? {})) {
          const values = normalizeArray(
            readValue(taxonomyConfig.field, context),
          )
          const termIds = []
          for (const value of values) {
            const term = yield* ensureTaxonomyTerm(
              this.db,
              taxonomyConfig.taxonomy,
              value,
            )
            termIds.push(term.id)
          }
          if (!dryRun) {
            yield* setTaxonomyTerms(
              this.db,
              config.collection,
              content.id,
              taxonomyConfig.taxonomy,
              termIds,
            )
          }
        }

        if (config.seo && collection.hasSeo && !dryRun) {
          const seo = {}
          for (const [key, spec] of Object.entries(config.seo)) {
            seo[key] = yield* this.resolveFieldValue(spec, context)
          }
          yield* upsertSeo(this.db, config.collection, content.id, seo)
        }
      }
    },
  )
}

const MigrationResourcesLayer = Layer.effect(
  MigrationResources,
  Effect.gen(function* () {
    const config = yield* MigrationConfig
    const fileSystem = yield* FileSystem.FileSystem
    const uploadsDir = path.resolve(ROOT, config.uploadsDirectory)
    yield* fileSystem.makeDirectory(uploadsDir, { recursive: true })

    const db = yield* Effect.acquireRelease(
      Effect.sync(
        () =>
          new Kysely({
            dialect: createDialect({ url: config.databaseUrl }),
          }),
      ),
      (database) =>
        Effect.tryPromise({
          try: () => database.destroy(),
          catch: (cause) => migrationError('Close the EmDash database', cause),
        }).pipe(Effect.orDie),
    )

    yield* Effect.tryPromise({
      try: () => runMigrations(db),
      catch: (cause) => migrationError('Run EmDash database migrations', cause),
    })

    return {
      db,
      contentRepo: new ContentRepository(db),
      mediaRepo: new MediaRepository(db),
      schemaRegistry: new SchemaRegistry(db),
      storage: new LocalStorage({
        directory: uploadsDir,
        baseUrl: config.mediaBaseUrl,
      }),
    }
  }),
)

const main = Effect.fn('main')(function* () {
  const resources = yield* MigrationResources
  const migrator = new EmDashMigrator(resources)

  for (const config of COLLECTION_MIGRATIONS) {
    yield* migrator.migrateCollection(config)
  }

  yield* Effect.log(
    dryRun
      ? `Dry run complete. Would create ${migrator.report.created} entries, update ${migrator.report.updated}, create ${migrator.report.mediaCreated} media items, reuse ${migrator.report.mediaReused} media items.`
      : `Migration complete. Created ${migrator.report.created} entries, updated ${migrator.report.updated}, created ${migrator.report.mediaCreated} media items, reused ${migrator.report.mediaReused} media items.`,
  )

  for (const warning of migrator.report.warnings) {
    yield* Effect.logWarning(warning)
  }
})

await Effect.runPromise(
  main().pipe(
    Effect.provide(
      MigrationResourcesLayer.pipe(
        Layer.provideMerge(
          Layer.mergeAll(NodeFileSystem.layer, FetchHttpClient.layer),
        ),
      ),
    ),
  ),
)
