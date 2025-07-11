@echo off
echo Verificando que Prisma funcione correctamente...
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

echo Generando cliente de Prisma...
call npm run prisma:generate

if %errorlevel% equ 0 (
    echo.
    echo ===========================================
    echo   EXITO! Prisma esta funcionando!
    echo ===========================================
    echo.
    echo Ahora puedes ejecutar:
    echo   - run-now.bat        (ejecutar todo)
    echo   - quick-start.bat    (solo servidor)
    echo   - npm run prisma:studio  (ver base de datos)
    echo.
) else (
    echo.
    echo Error al generar Prisma. Verifica el archivo schema.prisma
)

pause
