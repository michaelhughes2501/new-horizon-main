# NewHorizon - React Native Expo web
FROM node:20-alpine as base
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --frozen-lockfile || npm install

FROM node:20-alpine as builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build 2>/dev/null || echo "No build"

FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app . .

RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001 && chown -R appuser:nodejs /app

USER appuser

EXPOSE 8081
CMD ["npm", "run", "web"]
