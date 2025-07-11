@echo off
echo ===========================================
echo   SOLUCION PRISMA WINDOWS - ALGORITMO
echo ===========================================
echo.
echo Solucionando error de permisos en Windows:
echo "EPERM: operation not permitted, rename"
echo.

cd /d D:\DESARROLLO\algoritmo\backend

echo [1/6] Terminando todos los procesos de Node.js...
taskkill /F /IM node.exe 2>nul || echo   No hay procesos de Node.js ejecutandose

echo.
echo [2/6] Limpiando cache de npm...
call npm cache clean --force

echo.
echo [3/6] Eliminando node_modules y package-lock.json...
rmdir /s /q node_modules 2>nul || echo   node_modules no existe
del /f /q package-lock.json 2>nul || echo   package-lock.json no existe

echo.
echo [4/6] Reinstalando dependencias sin ejecutar postinstall...
call npm install --ignore-scripts
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    echo.
    echo Intentando con permisos elevados...
    echo Por favor, ejecuta este script como Administrador
    pause
    exit /b 1
)

echo.
echo [5/6] Generando cliente de Prisma manualmente...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Error al generar cliente de Prisma
    echo.
    echo Posibles soluciones:
    echo 1. Ejecutar como Administrador
    echo 2. Desactivar antivirus temporalmente
    echo 3. Usar WSL (Windows Subsystem for Linux)
    pause
    exit /b 1
)

echo.
echo [6/6] Verificando la instalacion...
call node -e "console.log('✅ Node.js funciona correctamente')"

echo.
echo ===========================================
echo   PROBLEMA RESUELTO!
echo ===========================================
echo.
echo ✅ Prisma Client generado exitosamente
echo ✅ Dependencias instaladas correctamente
echo.
echo Proximos pasos:
echo 1. Ejecutar: npm run start:dev
echo 2. O usar: quick-start.bat
echo.
echo Si el problema persiste:
echo - Ejecutar como Administrador
echo - Desactivar antivirus temporalmente
echo - Usar PowerShell como Administrador
echo.

pause 