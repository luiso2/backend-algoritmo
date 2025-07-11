@echo off
cls
echo.
echo    _____ _     _   _           _               _ 
echo   / ____(_)   | | (_)         | |             | |
echo  | (___  _ ___| |_ ___ _ __ __| | ___       __| | ___
echo   \___ \| / __| __/ _ \ '_ ` _ \ / _ \     / _` |/ _ \
echo   ____) | \__ \ ||  __/ | | | | | (_) |   | (_| |  __/
echo  |_____/|_|___/\__\___|_| |_| |_|\___/     \__,_|\___|
echo.                                                      
echo       _____                                
echo      |  ___|_ _ _ __ ___  _ __ ___  ___   
echo      | |__ | '_| '__/ _ \| '__/ _ \/ __|  
echo      |  __|| | | | | (_) | | |  __/\__ \  
echo      |_|   |_| |_|  \___/|_|  \___||___/  
echo.
echo.
echo  Detectados 134 errores de TypeScript
echo  Aplicando solucion completa...
echo.
echo  Esto tomara aproximadamente 1-2 minutos.
echo.

cd /d D:\DESARROLLO\refine-finanzas\backend

timeout /t 2 /nobreak > nul

call fix-schema.bat
