@echo off
echo ===========================================
echo   Configurando Base de Datos
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
echo [2/3] Creando migracion inicial...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo Error al crear la migracion
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Verificando la base de datos...
call npx prisma db push
if %errorlevel% neq 0 (
    echo Error al sincronizar la base de datos
    pause
    exit /b %errorlevel%
)

echo.
echo ===========================================
echo   Base de datos configurada exitosamente!
echo ===========================================
echo.
echo Ahora puedes ejecutar el proyecto con:
echo   quick-start.bat
echo.
echo O ver la base de datos con:
echo   npm run prisma:studio
echo.

pause
