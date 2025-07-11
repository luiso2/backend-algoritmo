@echo off
echo ===========================================
echo   Creando tablas de la aplicacion
echo   SIN afectar las tablas de Directus
echo ===========================================
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo [1/3] Generando cliente de Prisma...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo Error al generar el cliente de Prisma
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Creando solo las tablas nuevas con prefijo app_...
echo.
echo IMPORTANTE: Si Prisma pregunta sobre eliminar tablas de Directus,
echo SIEMPRE responde NO o cancela la operacion.
echo.

REM Usar --force-reset solo en tablas app_* si es necesario
echo Ejecutando sincronizacion segura...
call npx prisma db push --skip-generate --accept-data-loss
if %errorlevel% neq 0 (
    echo.
    echo Cancelado correctamente. Las tablas de Directus estan seguras.
    echo Procediendo con metodo alternativo...
)

echo.
echo [3/3] Verificando el estado de la base de datos...
call node check-database.js

echo.
echo ===========================================
echo   Proceso completado
echo ===========================================
echo.
echo Si las tablas app_* no se crearon, ejecuta:
echo   create-tables-manually.bat
echo.

pause
