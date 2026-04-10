export interface StatementLike {
  reader: boolean
  all(...params: unknown[]): unknown[]
  iterate(...params: unknown[]): IterableIterator<unknown>
  run(...params: unknown[]): {
    changes: number | bigint
    lastInsertRowid: number | bigint
  }
}

export interface DatabaseLike {
  close(): void
  prepare(sql: string): StatementLike
}

function normalizeParams(params: unknown[]): unknown[] {
  if (params.length !== 1) {
    return params
  }

  const [value] = params
  return Array.isArray(value) ? value : params
}

function wrapBunDatabase(database: {
  close(): void
  exec?(sql: string): unknown
  prepare(
    sql: string,
  ): Omit<StatementLike, 'reader'> & { columnNames?: string[] }
}): DatabaseLike {
  return {
    close() {
      database.close()
    },
    prepare(sql: string) {
      const statement = database.prepare(sql)

      return {
        get reader() {
          return (
            Array.isArray(statement.columnNames) &&
            statement.columnNames.length > 0
          )
        },
        all(...params: unknown[]) {
          return statement.all(...normalizeParams(params))
        },
        iterate(...params: unknown[]) {
          return statement.iterate(...normalizeParams(params))
        },
        run(...params: unknown[]) {
          return statement.run(...normalizeParams(params))
        },
      }
    },
  }
}

export async function createSqliteDatabase(
  dbPath: string,
): Promise<DatabaseLike> {
  if ('Bun' in globalThis) {
    const { Database } = await import('bun:sqlite')
    const sqlite = new Database(dbPath)

    sqlite.run('PRAGMA journal_mode = WAL')
    sqlite.run('PRAGMA foreign_keys = ON')

    return wrapBunDatabase(sqlite)
  }

  const { default: BetterSqlite3 } = await import('better-sqlite3')
  const sqlite = new BetterSqlite3(dbPath)

  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  return sqlite as unknown as DatabaseLike
}
