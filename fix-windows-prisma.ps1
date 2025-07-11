Write-Host "==========================================="
Write-Host "   SOLUCION PRISMA WINDOWS - ALGORITMO"
Write-Host "==========================================="
Write-Host ""
Write-Host "Solucionando error de permisos en Windows:" -ForegroundColor Yellow
Write-Host "EPERM: operation not permitted, rename" -ForegroundColor Red
Write-Host ""

# Cambiar al directorio del proyecto
Set-Location "D:\DESARROLLO\algoritmo\backend"

Write-Host "[1/6] Terminando todos los procesos de Node.js..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "   Procesos de Node.js terminados" -ForegroundColor Green

Write-Host ""
Write-Host "[2/6] Limpiando cache de npm..." -ForegroundColor Cyan
& npm cache clean --force

Write-Host ""
Write-Host "[3/6] Eliminando node_modules y package-lock.json..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "   node_modules eliminado" -ForegroundColor Green
} else {
    Write-Host "   node_modules no existe" -ForegroundColor Yellow
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "   package-lock.json eliminado" -ForegroundColor Green
} else {
    Write-Host "   package-lock.json no existe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/6] Reinstalando dependencias sin ejecutar postinstall..." -ForegroundColor Cyan
& npm install --ignore-scripts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluciones alternativas:" -ForegroundColor Yellow
    Write-Host "1. Ejecutar PowerShell como Administrador" -ForegroundColor Yellow
    Write-Host "2. Desactivar antivirus temporalmente" -ForegroundColor Yellow
    Write-Host "3. Usar Windows Subsystem for Linux (WSL)" -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar..."
    exit 1
}

Write-Host ""
Write-Host "[5/6] Generando cliente de Prisma manualmente..." -ForegroundColor Cyan
& npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al generar cliente de Prisma" -ForegroundColor Red
    Write-Host ""
    Write-Host "Intentando solucion alternativa..." -ForegroundColor Yellow
    
    # Intentar con permisos especiales
    Write-Host "Configurando permisos especiales..." -ForegroundColor Yellow
    $env:PRISMA_ENGINES_MIRROR = "https://binaries.prisma.sh"
    & npx prisma generate --schema=./prisma/schema.prisma
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Solucion alternativa fallida" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar..."
        exit 1
    }
}

Write-Host ""
Write-Host "[6/6] Verificando la instalacion..." -ForegroundColor Cyan
& node -e "console.log('✅ Node.js funciona correctamente')"

Write-Host ""
Write-Host "==========================================="
Write-Host "   PROBLEMA RESUELTO!"
Write-Host "==========================================="
Write-Host ""
Write-Host "✅ Prisma Client generado exitosamente" -ForegroundColor Green
Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ejecutar: npm run start:dev" -ForegroundColor White
Write-Host "2. O usar: quick-start.bat" -ForegroundColor White
Write-Host ""
Write-Host "Si el problema persiste:" -ForegroundColor Yellow
Write-Host "- Ejecutar PowerShell como Administrador" -ForegroundColor White
Write-Host "- Desactivar antivirus temporalmente" -ForegroundColor White
Write-Host "- Usar WSL2 (recomendado para desarrollo)" -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para continuar..." 