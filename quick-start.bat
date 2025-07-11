@echo off
echo ===========================================
echo   Inicio Rápido del Backend
echo ===========================================
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo Verificando que las dependencias estén instaladas...
if not exist "node_modules" (
    echo.
    echo [!] No se encontraron las dependencias. Instalando...
    call npm install
)

echo.
echo Generando cliente de Prisma...
call npm run prisma:generate

echo.
echo Iniciando el servidor...
echo.
echo Servidor disponible en: http://localhost:3001
echo Documentación API: http://localhost:3001/api/docs
echo.
echo Presiona Ctrl+C para detener
echo.

call npm run start:dev

pause
