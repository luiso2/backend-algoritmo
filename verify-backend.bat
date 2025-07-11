@echo off
echo ===========================================
echo   Verificando Conexiones del Backend
echo ===========================================
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo Ejecutando verificacion de conexiones...
echo.

node verify-connections.js

echo.
pause
