@echo off
echo ===========================================
echo   Algoritmo Finanzas Backend - Setup
echo ===========================================
echo.

REM Verificar que estamos en el directorio correcto
cd /d D:\DESARROLLO\refine-finanzas\backend

echo [1/5] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo Error al instalar las dependencias
    pause
    exit /b %errorlevel%
)
echo.

echo [2/5] Generando cliente de Prisma...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo Error al generar el cliente de Prisma
    pause
    exit /b %errorlevel%
)
echo.

echo [3/5] Aplicando migraciones de base de datos...
call npm run prisma:migrate:deploy
if %errorlevel% neq 0 (
    echo Error al aplicar las migraciones. Intentando con prisma:migrate...
    call npm run prisma:migrate
    if %errorlevel% neq 0 (
        echo Error al migrar la base de datos
        pause
        exit /b %errorlevel%
    )
)
echo.

echo [4/5] Verificando conexiones...
echo.
echo Configuracion actual:
echo - Base de datos: PostgreSQL en 168.231.92.67:5458
echo - Redis: 168.231.92.67:5448
echo - Puerto de la aplicacion: 3001
echo.

echo [5/5] Iniciando el servidor en modo desarrollo...
echo.
echo El servidor estara disponible en: http://localhost:3001
echo Documentacion Swagger en: http://localhost:3001/api/docs
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run start:dev

pause
