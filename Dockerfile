FROM node:18-alpine AS builder

# Instalar OpenSSL y otras dependencias necesarias para Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]