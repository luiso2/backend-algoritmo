@echo off
echo ===========================================
echo   PRISMA SCHEMA REPARADO EXITOSAMENTE!
echo ===========================================
echo.
echo El archivo schema.prisma ahora incluye:
echo - Generator de Prisma Client configurado
echo - Datasource PostgreSQL configurado
echo - Todos los modelos necesarios
echo - Todos los enums requeridos
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo Ejecutando el proyecto...
echo.

call start-fixed.bat
