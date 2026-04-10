/**
 * SQLite runtime adapter
 *
 * Creates a Kysely dialect for Bun SQLite or better-sqlite3.
 * Loaded at runtime via virtual module.
 */

import type { Dialect } from "kysely";

import type { SqliteConfig } from "./adapters.js";

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

async function createDatabase(filePath: string): Promise<DatabaseLike> {
	if (typeof Bun !== "undefined") {
		const { Database } = await import("bun:sqlite");
		return wrapBunDatabase(new Database(filePath));
	}

	const BetterSqlite3 = require("better-sqlite3");
	return new BetterSqlite3(filePath);
}

/**
 * Create a SQLite dialect from config
 */
export function createDialect(config: SqliteConfig): Dialect {
	const { SqliteDialect } = require("kysely");

	// Parse URL to get file path
	const url = config.url;
	const filePath = url.startsWith("file:") ? url.slice(5) : url;

	return new SqliteDialect({
		database: () => createDatabase(filePath),
	});
}
