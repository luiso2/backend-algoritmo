FROM node:18-alpine AS builder

# Instalar OpenSSL y otras dependencias necesarias para Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

RUN apk add --no-cache openssl libc6-compat curl

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Cambiar al usuario no-root
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/api/health || exit 1

# Exponer el puerto
EXPOSE 3001

# Comando mejorado con mejor manejo de errores
CMD ["sh", "-c", "echo 'Iniciando aplicación...' && echo 'Variables de entorno:' && echo 'NODE_ENV='$NODE_ENV && echo 'PORT='$PORT && echo 'DATABASE_URL='${DATABASE_URL:0:30}'...' && echo 'Ejecutando migraciones...' && npx prisma migrate deploy && echo 'Migraciones completadas. Iniciando servidor...' && npm run start:prod"]
