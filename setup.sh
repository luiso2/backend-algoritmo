#!/bin/bash

echo "🚀 Iniciando configuración de Algoritmo Finanzas Backend..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

echo "✅ Dependencias del sistema verificadas"

# Instalar dependencias de Node
echo "📦 Instalando dependencias de Node.js..."
npm install

# Iniciar servicios con Docker Compose
echo "🐳 Iniciando servicios de base de datos..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de base de datos..."
npx prisma migrate dev --name init

# Ejecutar seed
echo "🌱 Poblando base de datos con datos iniciales..."
npm run prisma:seed

echo "✨ ¡Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Revisa y ajusta las variables de entorno en .env"
echo "2. Inicia el servidor con: npm run start:dev"
echo "3. Accede a la documentación en: http://localhost:3001/api/docs"
echo "4. PgAdmin disponible en: http://localhost:5050"
echo "   - Email: admin@algoritmo.com"
echo "   - Password: admin123"
echo ""
echo "🎉 ¡Listo para desarrollar!"
