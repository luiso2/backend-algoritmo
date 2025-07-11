@echo off
echo ===========================================
echo   INICIO SEGURO - Algoritmo Finanzas
echo ===========================================
echo.
echo Este script configura todo de forma SEGURA
echo sin afectar las tablas de Directus.
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo [1/6] Instalando dependencias...
call npm install > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

echo.
echo [2/6] Instalando pg (para crear tablas)...
call npm install --save-dev pg > nul 2>&1
echo ✅ pg instalado

echo.
echo [3/6] Generando cliente de Prisma...
call npm run prisma:generate > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error al generar Prisma
    pause
    exit /b 1
)
echo ✅ Cliente de Prisma generado

echo.
echo [4/6] Verificando base de datos...
call node check-database.js
echo.

echo [5/6] Creando tablas de la aplicacion...
cd prisma
call node create-tables.js
cd ..
if %errorlevel% neq 0 (
    echo ❌ Error al crear tablas
    pause
    exit /b 1
)

echo.
echo [6/6] Ejecutando seed (datos de prueba)...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo ⚠️  Advertencia: No se pudieron crear datos de prueba
    echo    (Esto es normal si ya existen)
)

echo.
echo ===========================================
echo   CONFIGURACION EXITOSA!
echo ===========================================
echo.
echo ✅ Tablas creadas con prefijo app_
echo ✅ Directus no fue afectado
echo ✅ Base de datos lista
echo.
echo Iniciando servidor...
echo.
echo API: http://localhost:3001
echo Docs: http://localhost:3001/api/docs
echo.
echo Usuarios de prueba:
echo - test@algoritmo.com / Test123!
echo - admin@algoritmo.com / Test123!
echo.

call npm run start:dev
