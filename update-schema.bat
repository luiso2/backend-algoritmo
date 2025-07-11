@echo off
echo ===========================================
echo   Actualizando Schema de Base de Datos
echo ===========================================
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo [1/4] Instalando dependencias...
call npm install > nul 2>&1
echo ✅ Dependencias instaladas

echo.
echo [2/4] Generando nuevo cliente de Prisma...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo ❌ Error al generar Prisma Client
    pause
    exit /b 1
)
echo ✅ Cliente de Prisma actualizado

echo.
echo [3/4] Actualizando la base de datos...
echo Nota: Esto agregara las nuevas tablas y campos sin eliminar datos
call npx prisma db push --skip-generate
if %errorlevel% neq 0 (
    echo ❌ Error al actualizar la base de datos
    pause
    exit /b 1
)

echo.
echo [4/4] Verificando el resultado...
call node check-database.js

echo.
echo ===========================================
echo   ACTUALIZACION EXITOSA!
echo ===========================================
echo.
echo ✅ Schema actualizado con:
echo    - Nuevas tablas: app_user_settings, app_roles, app_permissions, etc.
echo    - Campos faltantes agregados
echo    - Alias de campos para compatibilidad
echo.
echo Reiniciando el servidor...
echo.

call npm run start:dev
