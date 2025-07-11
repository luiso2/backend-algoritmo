@echo off
cls
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║         SOLUCION AUTOMATICA - ALGORITMO FINANZAS         ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  Las tablas existen pero sin el prefijo app_
echo  Este script solucionara todo automaticamente.
echo.
echo  Se renombraran:
echo    User         →  app_users
echo    Account      →  app_accounts  
echo    Transaction  →  app_transactions
echo    ... y 12 tablas mas
echo.
echo  Las tablas de Directus NO seran afectadas.
echo.

timeout /t 3 /nobreak > nul

cd /d D:\DESARROLLO\refine-finanzas\backend

echo  [►] Instalando dependencias...
call npm install --save-dev pg > nul 2>&1

echo  [►] Generando Prisma Client...
call npm run prisma:generate > nul 2>&1

echo  [►] Renombrando tablas...
node rename-tables.js > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [X] Error al renombrar tablas
    echo      Ejecuta: check-database.bat para ver el estado
    pause
    exit /b 1
)

echo  [►] Creando datos de prueba...
call npm run prisma:seed > nul 2>&1

cls
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                    ✓ TODO LISTO!                         ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  API:  http://localhost:3001
echo  Docs: http://localhost:3001/api/docs
echo.
echo  Usuarios:
echo    • test@algoritmo.com / Test123!
echo    • admin@algoritmo.com / Test123!
echo.
echo  Iniciando servidor...
echo.

call npm run start:dev
