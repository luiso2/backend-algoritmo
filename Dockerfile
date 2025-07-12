FROM node:18-alpine

# Instalar dependencias básicas
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3001

# Comando simple de inicio
CMD ["sh", "-c", "echo '🚀 Iniciando aplicación...' && echo 'Variables:' && echo 'NODE_ENV='$NODE_ENV && echo 'PORT='$PORT && echo 'DATABASE_URL='${DATABASE_URL:0:50}'...' && npx prisma migrate deploy && echo '✅ Migraciones completadas' && npm run start:prod"]
