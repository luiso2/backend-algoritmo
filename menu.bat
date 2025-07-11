@echo off
setlocal enabledelayedexpansion
:menu
cls
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║         ALGORITMO FINANZAS - BACKEND                     ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  Estado: Errores de TypeScript detectados
echo  Causa: Campos y tablas faltantes en el schema
echo.
echo  1. SOLUCION AUTOMATICA (actualizar schema y reiniciar)
echo  2. Ver estado de la base de datos
echo  3. Actualizar schema manualmente
echo  4. Regenerar Prisma Client
echo  5. Ejecutar seed actualizado
echo  6. Iniciar servidor (sin cambios)
echo  7. Ver logs de error
echo  8. Solucionar problema Windows/Prisma
echo  9. Salir
echo.

set /p opcion="Selecciona una opcion (1-9): "

if "%opcion%"=="1" (
    echo.
    call fix-schema.bat
    goto end
)

if "%opcion%"=="2" (
    echo.
    call check-database.bat
    echo.
    pause
    goto menu
)

if "%opcion%"=="3" (
    echo.
    cd prisma
    node update-schema.js
    cd ..
    echo.
    pause
    goto menu
)

if "%opcion%"=="4" (
    echo.
    echo Regenerando Prisma Client...
    call npm run prisma:generate
    echo.
    pause
    goto menu
)

if "%opcion%"=="5" (
    echo.
    echo Ejecutando seed...
    call npm run prisma:seed
    echo.
    pause
    goto menu
)

if "%opcion%"=="6" (
    echo.
    echo Iniciando servidor...
    call npm run start:dev
    goto end
)

if "%opcion%"=="7" (
    echo.
    echo Ultimos errores detectados:
    echo.
    echo - Campos faltantes: language, currency en User
    echo - Tablas faltantes: userSettings, roles, permissions, achievements
    echo - Alias de campos: lastFourDigits vs last4Digits
    echo - BadRequestException no importado en bills.service.ts
    echo.
    echo Ejecuta la opcion 1 para solucionar automaticamente.
    echo.
    pause
    goto menu
)

if "%opcion%"=="8" (
    echo.
    echo Solucionando problema de permisos Windows/Prisma...
    echo.
    echo Opciones disponibles:
    echo 1. Script Batch (recomendado)
    echo 2. Script PowerShell (mas robusto)
    echo.
    set /p fix_option="Selecciona opcion (1-2): "
    
    if "!fix_option!"=="1" (
        call fix-windows-prisma.bat
    ) else if "!fix_option!"=="2" (
        PowerShell -ExecutionPolicy Bypass -File fix-windows-prisma.ps1
    ) else (
        echo Opcion no valida
    )
    
    echo.
    pause
    goto menu
)

if "%opcion%"=="9" (
    echo.
    echo Saliendo...
    goto end
)

echo.
echo Opcion no valida. Por favor selecciona 1-9
pause
goto menu

:end
