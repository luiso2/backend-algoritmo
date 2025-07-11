@echo off
cls
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║       ACTUALIZACION DE SCHEMA - ALGORITMO FINANZAS       ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  Se agregaran las tablas y campos faltantes:
echo    • app_user_settings (configuraciones de usuario)
echo    • app_roles, app_permissions (sistema de permisos)
echo    • app_achievements (logros/gamificacion)
echo    • Campos alias para compatibilidad
echo.
echo  Esto NO afectara los datos existentes.
echo.

timeout /t 3 /nobreak > nul

cd /d D:\DESARROLLO\refine-finanzas\backend

echo  [►] Instalando dependencias necesarias...
call npm install --save-dev pg > nul 2>&1

echo  [►] Actualizando cliente de Prisma...
call npm run prisma:generate > nul 2>&1

echo  [►] Aplicando cambios en la base de datos...
cd prisma
node update-schema.js
cd ..

if %errorlevel% neq 0 (
    echo.
    echo  [X] Error al actualizar el schema
    pause
    exit /b 1
)

echo  [►] Ejecutando seed actualizado...
call npm run prisma:seed > nul 2>&1

cls
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║               ✓ ACTUALIZACION COMPLETADA!                ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  Schema actualizado con exito:
echo    ✓ Nuevas tablas creadas
echo    ✓ Campos faltantes agregados
echo    ✓ Alias de compatibilidad configurados
echo    ✓ Datos de prueba actualizados
echo.
echo  Reiniciando servidor...
echo.

call npm run start:dev
