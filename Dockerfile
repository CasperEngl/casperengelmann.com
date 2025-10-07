FROM node:20

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

COPY . .

RUN bun install

RUN bun run build

EXPOSE 3000

CMD node ./dist/server/entry.mjs --host 0.0.0.0 --port 3000
