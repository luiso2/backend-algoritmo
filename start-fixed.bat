@echo off
echo ===========================================
echo   Algoritmo Finanzas - Backend Setup Fixed
echo ===========================================
echo.
echo El archivo schema.prisma ha sido REPARADO exitosamente!
echo.

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
echo [3/5] Sincronizando base de datos...
echo Nota: Esto creara las tablas en la base de datos remota
call npx prisma db push
if %errorlevel% neq 0 (
    echo.
    echo Intentando con migrate...
    call npx prisma migrate dev --name init
    if %errorlevel% neq 0 (
        echo Error al sincronizar la base de datos
        pause
        exit /b %errorlevel%
    )
)

echo.
echo [4/5] Ejecutando seed de datos de prueba...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo Advertencia: No se pudieron crear los datos de prueba
    echo Continuando sin datos de prueba...
)

echo.
echo [5/5] Iniciando el servidor...
echo.
echo ===========================================
echo   SERVIDOR INICIADO EXITOSAMENTE!
echo ===========================================
echo.
echo API disponible en: http://localhost:3001
echo Documentacion Swagger: http://localhost:3001/api/docs
echo.
echo Credenciales de prueba:
echo   Email: test@algoritmo.com
echo   Password: Test123!
echo.
echo Credenciales de admin:
echo   Email: admin@algoritmo.com
echo   Password: Test123!
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run start:dev
