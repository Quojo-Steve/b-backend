# Stage 1: install dependencies (needs prisma/schema.prisma present for postinstall)
FROM node:18-alpine AS deps

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

# Stage 2: build TypeScript
FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Stage 3: production runtime
FROM node:18-alpine AS runtime

LABEL maintainer="BRACE"

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma

# Install production deps only; postinstall (prisma generate) runs against the schema copied above
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4000

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs \
    && mkdir -p /app/uploads/news /app/uploads/press-releases /app/uploads/partners \
    && chown -R nodejs:nodejs /app

VOLUME ["/app/uploads"]

USER nodejs

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
