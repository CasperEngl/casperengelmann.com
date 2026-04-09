FROM oven/bun:1.3.11

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/data/uploads

COPY . .

RUN bun install --frozen-lockfile

RUN bun run build

EXPOSE 3000

CMD ["sh", "-lc", "exec bun ./dist/server/entry.mjs --host \"${HOST:-::}\" --port \"${PORT:-3000}\""]
