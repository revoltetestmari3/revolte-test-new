FROM node:22.23.0-alpine3.22 AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22.23.0-alpine3.22 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY . .
RUN npm run build

FROM node:22.23.0-alpine3.22 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/package-lock.json ./package-lock.json

USER node
EXPOSE 8080
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "8080"]
