@echo off
echo ===========================================
echo   Solucion de Problemas - Prisma Schema
echo ===========================================
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo El archivo schema.prisma ha sido reparado con:
echo - Datasource PostgreSQL configurado
echo - Generator de Prisma Client configurado
echo - Todos los modelos necesarios
echo - Todos los enums requeridos
echo.

echo Opciones disponibles:
echo.
echo 1. Configurar la base de datos (primera vez)
echo    Ejecuta: setup-database.bat
echo.
echo 2. Solo generar el cliente de Prisma
echo    Ejecuta: npm run prisma:generate
echo.
echo 3. Iniciar el servidor directamente
echo    Ejecuta: quick-start.bat
echo.
echo 4. Ver la base de datos con Prisma Studio
echo    Ejecuta: npm run prisma:studio
echo.

echo Presiona cualquier tecla para ejecutar la configuracion de base de datos...
pause > nul

echo.
echo Ejecutando configuracion de base de datos...
echo.

call setup-database.bat
