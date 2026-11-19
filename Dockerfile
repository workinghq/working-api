FROM node:26-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

FROM base AS migrations

CMD ["npx", "prisma", "migrate", "deploy"]

FROM base AS build

RUN npx prisma generate && npm run build && npm prune --omit=dev

FROM node:26-alpine AS prod

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
