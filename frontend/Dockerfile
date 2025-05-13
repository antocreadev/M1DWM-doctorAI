FROM node:20-alpine AS base

# Installer les dépendances uniquement lorsque nécessaire
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install

# Reconstruire l'application source uniquement lorsque nécessaire
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Image de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier le contenu nécessaire
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Utiliser l'utilisateur non-root
USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]