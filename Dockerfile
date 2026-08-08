# node:20-bookworm-slim (not alpine) avoids musl/native-module build friction
# with better-sqlite3, which needs to compile against glibc.
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
# better-sqlite3 ships prebuilt native binaries and prefers them over
# compiling from source. On some Docker Desktop / ARM64 host combinations
# that prebuilt binary segfaults on first use (reproduced even with a
# plain in-memory database, ruling out filesystem/volume causes). Removing
# it forces better-sqlite3 to fall back to compiling from source against
# this exact container's glibc/kernel, which is more reliable than trusting
# a prebuilt binary built elsewhere.
RUN rm -rf node_modules/better-sqlite3/prebuilds \
  && cd node_modules/better-sqlite3 \
  && npx node-gyp rebuild --release \
  && node -e "const Database=require('.'); const db=new Database(':memory:'); db.exec('CREATE TABLE t(x)'); db.prepare('INSERT INTO t VALUES (1)').run(); if (db.prepare('SELECT * FROM t').get().x !== 1) throw new Error('sanity check failed'); console.log('better-sqlite3 native build OK')"

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "run", "start:migrate"]
