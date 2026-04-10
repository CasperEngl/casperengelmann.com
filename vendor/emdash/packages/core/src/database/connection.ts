import { Kysely, SqliteDialect } from "kysely";

import type { Database } from "./types.js";

export interface DatabaseConfig {
	url: string;
	authToken?: string;
}

export class EmDashDatabaseError extends Error {
	constructor(
		message: string,
		public override cause?: unknown,
	) {
		super(message);
		this.name = "EmDashDatabaseError";
	}
}

interface StatementLike {
	all(...params: unknown[]): unknown[];
	iterate(...params: unknown[]): IterableIterator<unknown>;
	run(...params: unknown[]): {
		changes?: number | bigint;
		lastInsertRowid?: number | bigint;
	};
}

interface DatabaseLike {
	close(): void;
	prepare(sql: string): StatementLike & { reader?: boolean };
}

function normalizeParams(params: unknown[]): unknown[] {
	if (params.length !== 1) {
		return params;
	}

	const [value] = params;
	return Array.isArray(value) ? value : params;
}

function wrapBunDatabase(database: {
	close(): void;
	exec(sql: string): unknown;
	prepare(sql: string): StatementLike & { columnNames?: string[] };
}): DatabaseLike {
	return {
		close() {
			database.close();
		},
		prepare(sql: string) {
			const statement = database.prepare(sql);

			return {
				get reader() {
					return Array.isArray(statement.columnNames) && statement.columnNames.length > 0;
				},
				all(...params: unknown[]) {
					return statement.all(...normalizeParams(params));
				},
				iterate(...params: unknown[]) {
					return statement.iterate(...normalizeParams(params));
				},
				run(...params: unknown[]) {
					return statement.run(...normalizeParams(params));
				},
			};
		},
	};
}

async function createSqliteDatabase(dbPath: string): Promise<DatabaseLike> {
	if (typeof Bun !== "undefined") {
		const { Database } = await import("bun:sqlite");
		const sqlite = new Database(dbPath);

		sqlite.exec("PRAGMA journal_mode = WAL");
		sqlite.exec("PRAGMA foreign_keys = ON");

		return wrapBunDatabase(sqlite);
	}

	const { default: BetterSqlite3 } = await import("better-sqlite3");
	const sqlite = new BetterSqlite3(dbPath);

	// Enable WAL mode for crash safety — writes go to a write-ahead log
	// before being applied, preventing FTS5 shadow table corruption on
	// process kill during content writes. No-op for :memory: databases.
	sqlite.pragma("journal_mode = WAL");

	// Enable foreign key constraints
	sqlite.pragma("foreign_keys = ON");

	return sqlite;
}

/**
 * Creates a Kysely database instance
 * Supports:
 * - file:./path/to/db.sqlite (local SQLite)
 * - :memory: (in-memory SQLite for testing)
 * - libsql://... (Turso/libSQL with auth token) - TODO
 */
export function createDatabase(config: DatabaseConfig): Kysely<Database> {
	try {
		// Handle file-based SQLite
		if (config.url.startsWith("file:") || config.url === ":memory:") {
			const dbPath = config.url === ":memory:" ? ":memory:" : config.url.replace("file:", "");

			const dialect = new SqliteDialect({
				database: () => createSqliteDatabase(dbPath),
			});

			return new Kysely<Database>({ dialect });
		}

		// Handle libSQL (Turso)
		if (config.url.startsWith("libsql:")) {
			if (!config.authToken) {
				throw new EmDashDatabaseError("Auth token required for remote libSQL database");
			}
			// LibSQL implementation would use @libsql/kysely-libsql
			throw new EmDashDatabaseError("LibSQL not yet implemented");
		}

		throw new EmDashDatabaseError(`Unsupported database URL scheme: ${config.url}`);
	} catch (error) {
		if (error instanceof EmDashDatabaseError) {
			throw error;
		}
		throw new EmDashDatabaseError("Failed to create database", error);
	}
}
