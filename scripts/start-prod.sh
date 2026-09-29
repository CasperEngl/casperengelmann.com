#!/bin/sh
set -eu

APP_DIR="/app"
DATA_DIR="${EMDASH_DATA_DIR:-$APP_DIR/data}"
DB_PATH="${EMDASH_DB_PATH:-$DATA_DIR/data.db}"
UPLOADS_DIR="${EMDASH_UPLOADS_DIR:-$DATA_DIR/uploads}"

mkdir -p "$UPLOADS_DIR"

# EmDash 1.0 has no `date` field type. Convert fields created by the old
# vendored build to string fields that use the date plugin widget.
if [ -f "$DB_PATH" ] && [ -n "$(sqlite3 "$DB_PATH" "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '_emdash_fields'")" ]; then
  sqlite3 "$DB_PATH" <<'SQL'
UPDATE _emdash_fields
SET type = 'string',
    widget = 'date:date',
    validation = '{"pattern":"^\\d{4}-\\d{2}-\\d{2}$"}'
WHERE type = 'date';
SQL
fi

if [ ! -f "$DB_PATH" ] || ! bun --bun emdash doctor -d "$DB_PATH" --cwd "$APP_DIR" >/dev/null 2>&1; then
  bun --bun emdash init -d "$DB_PATH" --cwd "$APP_DIR"
  bun --bun emdash seed -d "$DB_PATH" --uploads-dir "$UPLOADS_DIR" --cwd "$APP_DIR" --on-conflict update
fi

exec bun ./dist/server/entry.mjs --host "${HOST:-::}" --port "${PORT:-3000}"
