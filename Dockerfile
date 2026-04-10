FROM oven/bun:1.3.11 AS build-base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

FROM build-base AS deps

COPY package.json bun.lock ./
COPY vendor ./vendor

RUN bun install --frozen-lockfile

FROM deps AS build

COPY . .

RUN bun --bun run build

FROM build-base AS prod-deps

COPY package.json bun.lock ./
COPY vendor ./vendor

RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.11 AS runtime

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends sqlite3 \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/data/uploads

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/vendor ./vendor
COPY --from=build /app/dist ./dist
COPY --from=build /app/.emdash ./.emdash
COPY --from=build /app/scripts/start-prod.sh ./scripts/start-prod.sh
COPY package.json bun.lock ./

RUN chmod +x ./scripts/start-prod.sh

EXPOSE 3000

CMD ["sh", "./scripts/start-prod.sh"]
