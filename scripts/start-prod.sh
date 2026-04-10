#!/bin/sh
set -eu

APP_DIR="/app"
DATA_DIR="${EMDASH_DATA_DIR:-$APP_DIR/data}"
DB_PATH="${EMDASH_DB_PATH:-$DATA_DIR/data.db}"
UPLOADS_DIR="${EMDASH_UPLOADS_DIR:-$DATA_DIR/uploads}"

mkdir -p "$UPLOADS_DIR"

if [ ! -f "$DB_PATH" ] || ! bun --bun emdash doctor -d "$DB_PATH" --cwd "$APP_DIR" >/dev/null 2>&1; then
  bun --bun emdash init -d "$DB_PATH" --cwd "$APP_DIR"
  bun --bun emdash seed -d "$DB_PATH" --uploads-dir "$UPLOADS_DIR" --cwd "$APP_DIR" --on-conflict update
fi

exec bun ./dist/server/entry.mjs --host "${HOST:-::}" --port "${PORT:-3000}"
