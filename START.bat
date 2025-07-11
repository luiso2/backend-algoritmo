@echo off
cls
color 0E
echo.
echo    ==============================================
echo             ALGORITMO FINANZAS BACKEND
echo    ==============================================
echo.
echo    ESTADO: 134 errores de TypeScript detectados
echo.
echo    [1] EJECUTAR SOLUCION COMPLETA
echo    [2] Ver documentacion del problema
echo    [3] Salir
echo.
choice /c 123 /n /m "    Selecciona una opcion: "

if errorlevel 3 exit
if errorlevel 2 (
    notepad SOLUCION-ERRORES-TS.md
    goto :EOF
)
if errorlevel 1 (
    call fix-schema.bat
)
