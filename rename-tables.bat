@echo off
echo ===========================================
echo   Renombrando Tablas Existentes
echo ===========================================
echo.
echo Las tablas actuales no tienen el prefijo app_
echo Este script las renombrara para que funcionen con Prisma.
echo.
echo Tablas a renombrar:
echo   User         -^> app_users
echo   Account      -^> app_accounts
echo   Transaction  -^> app_transactions
echo   ... y todas las demas
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

set /p confirm="Deseas continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo.
    echo Operacion cancelada.
    pause
    exit /b 0
)

echo.
echo Renombrando tablas...
node rename-tables.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Tablas renombradas exitosamente!
    echo.
    echo Ahora puedes ejecutar:
    echo   npm run start:dev
    echo.
) else (
    echo.
    echo ❌ Error al renombrar las tablas
)

pause
