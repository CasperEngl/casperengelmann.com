FROM node:20

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

COPY . .

RUN bun install

RUN bun run build

ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE $PORT

CMD node ./dist/server/entry.mjs --host $HOST --port $PORT
