@echo off
echo ===============================================
echo 🚀 Iniciando configuracion de Algoritmo Backend
echo ===============================================
echo.

:: Verificar si Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js no esta instalado.
    echo Por favor instala Node.js 18+ desde https://nodejs.org
    pause
    exit /b 1
)

:: Verificar si Docker esta instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Advertencia: Docker no esta instalado.
    echo Necesitaras Docker para ejecutar PostgreSQL y Redis.
    echo Descargalo desde https://www.docker.com/products/docker-desktop
    echo.
    echo Presiona cualquier tecla para continuar sin Docker...
    pause
)

echo ✅ Dependencias del sistema verificadas
echo.

:: Instalar dependencias
echo 📦 Instalando dependencias de Node.js...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

:: Iniciar servicios con Docker Compose si Docker esta disponible
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo 🐳 Iniciando servicios de base de datos con Docker...
    docker-compose up -d
    
    :: Esperar a que PostgreSQL este listo
    echo ⏳ Esperando a que PostgreSQL este listo...
    timeout /t 10 /nobreak >nul
)

:: Generar cliente de Prisma
echo.
echo 🔧 Generando cliente de Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Error al generar cliente de Prisma
    pause
    exit /b 1
)

:: Ejecutar migraciones
echo.
echo 🗄️  Ejecutando migraciones de base de datos...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Error al ejecutar migraciones
    echo.
    echo Verifica tu conexion a PostgreSQL en el archivo .env
    pause
    exit /b 1
)

:: Ejecutar seed
echo.
echo 🌱 Poblando base de datos con datos iniciales...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo ⚠️  Advertencia: No se pudieron cargar los datos iniciales
)

echo.
echo ===============================================
echo ✨ ¡Configuracion completada!
echo ===============================================
echo.
echo 📝 Proximos pasos:
echo.
echo 1. Revisa y ajusta las variables de entorno en .env
echo.
echo 2. Inicia el servidor con:
echo    npm run start:dev
echo.
echo 3. Accede a la documentacion en:
echo    http://localhost:3001/api/docs
echo.
echo 4. PgAdmin disponible en:
echo    http://localhost:5050
echo    Email: admin@algoritmo.com
echo    Password: admin123
echo.
echo 5. Prisma Studio disponible con:
echo    npm run prisma:studio
echo.
echo ===============================================
echo 🎉 ¡Listo para desarrollar!
echo ===============================================
echo.
pause
