FROM node:22-slim AS build

WORKDIR /app

ENV CI=true

COPY package.json pnpm-lock.yaml /app/

RUN --mount=type=cache,target=/root/.local/share \
    set -xe; \
    corepack enable; \
    pnpm install --prefer-offline --frozen-lockfile

COPY . /app/

RUN --mount=type=cache,target=/root/.local/share \
    set -xe; \
    pnpm run build; \
    pnpm prune --prod

FROM node:22-slim AS release

WORKDIR /app

COPY package.json pnpm-lock.yaml start.mjs /app/
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

CMD node --enable-source-maps start.mjs
