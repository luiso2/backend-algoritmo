@echo off
echo ========================================
echo   ARREGLAR ERROR 502 EN RAILWAY
echo ========================================
echo.

echo ✅ Agregando archivos modificados...
git add .

echo ✅ Haciendo commit...
git commit -m "Fix: Hacer Redis opcional para Railway, resolver error 502 - App module actualizado - Validation schema mejorado - Dockerfile optimizado - Variables de entorno corregidas"

echo ✅ Subiendo cambios a GitHub...
git push origin main

echo.
echo ========================================
echo   CAMBIOS SUBIDOS EXITOSAMENTE
echo ========================================
echo.
echo 🚀 Ahora ve a Railway y configura las variables:
echo    https://railway.app/project/22a97d6a-8aff-42f5-97ee-a1118c5dbaa4
echo.
echo 📋 Variables a configurar:
echo    - NODE_ENV=production
echo    - PORT=3001
echo    - JWT_SECRET=algoritmo-jwt-secret-key-2024-secure-production-change-this
echo    - JWT_REFRESH_SECRET=algoritmo-refresh-secret-key-2024-secure-production-change-this
echo    - CORS_ORIGINS=http://localhost:5173,http://localhost:3000
echo    - ENCRYPTION_KEY=algoritmo2024securekeyfor32chars
echo    - EMAIL_FROM=noreply@algoritmo.com
echo    - EMAIL_FROM_NAME=Algoritmo Finanzas
echo.
echo ⚠️  ELIMINAR estas variables si existen:
echo    - REDIS_HOST
echo    - REDIS_PORT
echo    - REDIS_PASSWORD
echo    - REDIS_URL
echo.
echo 🎯 Railway hará redeploy automáticamente
echo 🔗 Prueba: https://algoritmo-backend-production.up.railway.app/api
echo.
pause
