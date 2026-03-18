# Stage 1: React Client bauen
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Produktions-Server
FROM node:22-alpine

WORKDIR /app

# Server-Dependencies installieren
COPY server/package*.json ./
RUN npm ci --production

# Server-Code kopieren
COPY server/ ./

# Gebauten Client kopieren
COPY --from=client-builder /app/client/dist ./public

# Fonts für PDF-Export kopieren
COPY --from=client-builder /app/client/public/fonts ./public/fonts

# Verzeichnisse erstellen
RUN mkdir -p /app/data /app/uploads/files /app/uploads/covers

# Umgebung setzen
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "--experimental-sqlite", "src/index.js"]
