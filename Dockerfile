FROM node:22

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

RUN mkdir -p /app/data/uploads

COPY . .

RUN bun install

RUN bun run build

EXPOSE $PORT

CMD node ./dist/server/entry.mjs --host "${HOST:-::}" --port "${PORT:-3000}"
