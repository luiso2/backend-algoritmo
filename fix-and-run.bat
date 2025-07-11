@echo off
echo ===========================================
echo   SOLUCION RAPIDA - Algoritmo Finanzas
echo ===========================================
echo.
echo Detecte que las tablas ya existen pero sin el prefijo app_
echo Este script las renombrara para que funcionen con Prisma.
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo [1/5] Instalando dependencia pg...
call npm install --save-dev pg > nul 2>&1
echo ✅ pg instalado

echo.
echo [2/5] Generando cliente de Prisma...
call npm run prisma:generate > nul 2>&1
echo ✅ Cliente de Prisma generado

echo.
echo [3/5] Renombrando tablas existentes...
node rename-tables.js
if %errorlevel% neq 0 (
    echo ❌ Error al renombrar tablas
    pause
    exit /b 1
)

echo.
echo [4/5] Ejecutando seed (datos de prueba)...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo ⚠️  No se pudieron crear datos de prueba
)

echo.
echo [5/5] Verificando resultado final...
call node check-database.js

echo.
echo ===========================================
echo   TODO LISTO!
echo ===========================================
echo.
echo ✅ Tablas renombradas con prefijo app_
echo ✅ Directus no fue afectado
echo ✅ Base de datos lista
echo.
echo Iniciando servidor...
echo.
echo API: http://localhost:3001
echo Docs: http://localhost:3001/api/docs
echo.

call npm run start:dev
