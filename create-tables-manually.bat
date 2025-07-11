@echo off
echo ===========================================
echo   Creando Tablas Manualmente
echo   (Sin afectar las tablas de Directus)
echo ===========================================
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo Este script creara las siguientes tablas con prefijo app_:
echo - app_users
echo - app_accounts
echo - app_credit_cards
echo - app_transactions
echo - app_bills
echo - app_contracts
echo - app_goals
echo - app_reminders
echo - app_notifications
echo - app_tags
echo - app_ai_interactions
echo - app_pricing_plans
echo - app_subscriptions
echo - app_file_uploads
echo - app_refresh_tokens
echo.
echo Las tablas de Directus (directus_*) NO seran afectadas.
echo.

set /p confirm="Deseas continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo.
    echo Operacion cancelada.
    pause
    exit /b 0
)

echo.
echo [1/3] Verificando conexion a la base de datos...
call node verify-connections.js > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: No se pudo conectar a la base de datos
    echo    Verifica las credenciales en el archivo .env
    pause
    exit /b 1
)
echo ✅ Conexion verificada

echo.
echo [2/3] Creando tablas...
cd prisma
call node create-tables.js
cd ..

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al crear las tablas
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Verificando el resultado...
call node check-database.js

echo.
echo ===========================================
echo   Proceso Completado!
echo ===========================================
echo.
echo Próximos pasos:
echo 1. Ejecuta: npm run start:dev
echo 2. O usa: menu.bat (opcion 3)
echo.

pause
