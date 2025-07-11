@echo off
echo Instalando dependencia pg para crear tablas...
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

call npm install --save-dev pg

echo.
echo Dependencia instalada. Ahora puedes ejecutar:
echo   create-tables-manually.bat
echo.
pause
