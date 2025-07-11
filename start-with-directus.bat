@echo off
echo ===========================================
echo   Configurando Prisma con Directus
echo ===========================================
echo.
echo IMPORTANTE: La base de datos ya contiene tablas de Directus.
echo Las tablas de la aplicacion usaran el prefijo "app_" para evitar conflictos.
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo [1/4] Generando cliente de Prisma...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo Error al generar el cliente de Prisma
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Sincronizando esquema con la base de datos...
echo Nota: Usando 'db push' para no afectar las tablas de Directus
call npx prisma db push --skip-generate
if %errorlevel% neq 0 (
    echo Error al sincronizar el esquema
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Ejecutando seed (datos de prueba)...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo Advertencia: No se pudieron crear los datos de prueba
    echo Esto puede ser porque ya existen datos en la base
)

echo.
echo [4/4] Iniciando el servidor...
echo.
echo ===========================================
echo   Configuracion Exitosa!
echo ===========================================
echo.
echo Tablas de Directus: directus_*
echo Tablas de la App: app_*
echo.
echo API disponible en: http://localhost:3001
echo Documentacion: http://localhost:3001/api/docs
echo.
echo Credenciales de prueba:
echo   test@algoritmo.com / Test123!
echo   admin@algoritmo.com / Test123!
echo.

call npm run start:dev
