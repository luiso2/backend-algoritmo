#!/bin/bash
# Script para verificar el estado del despliegue de Algoritmo Backend en Railway

echo "🔍 Verificando el estado del despliegue..."
echo ""

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Información del proyecto
PROJECT_ID="22a97d6a-8aff-42f5-97ee-a1118c5dbaa4"
BACKEND_URL="https://algoritmo-backend-production.up.railway.app"

echo "📋 Información del Proyecto:"
echo "   ID: $PROJECT_ID"
echo "   URL: $BACKEND_URL"
echo ""

# Verificar si el backend responde
echo "🌐 Verificando conectividad..."
if curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL | grep -q "200\|301\|302"; then
    echo -e "   ${GREEN}✓ El backend está respondiendo${NC}"
else
    echo -e "   ${RED}✗ El backend no está respondiendo aún${NC}"
    echo -e "   ${YELLOW}⏳ Espera unos minutos más para que complete el despliegue${NC}"
fi

echo ""
echo "📝 Próximos pasos:"
echo "   1. Ve a https://railway.app/project/$PROJECT_ID"
echo "   2. Revisa los logs del servicio 'algoritmo-backend'"
echo "   3. Verifica que las migraciones de Prisma se ejecutaron"
echo "   4. Prueba los endpoints en $BACKEND_URL/api"
echo ""
echo "🔗 Enlaces útiles:"
echo "   - Dashboard: https://railway.app/project/$PROJECT_ID"
echo "   - Logs: https://railway.app/project/$PROJECT_ID/service/9a9d3036-a0b4-4904-9787-627bb16267b3"
echo "   - Base de datos: https://railway.app/project/$PROJECT_ID/service/9f275b20-da91-4f57-a06f-51a23fe1b3f3"