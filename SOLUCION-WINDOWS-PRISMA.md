# 🛠️ SOLUCIÓN PROBLEMA PRISMA WINDOWS

## 🚨 Error Identificado

```
EPERM: operation not permitted, rename 'D:\DESARROLLO\algoritmo\backend\node_modules\.prisma\client\query_engine-windows.dll.node.tmp24692' -> 'D:\DESARROLLO\algoritmo\backend\node_modules\.prisma\client\query_engine-windows.dll.node'
```

## 🔍 Causas del Problema

Este error ocurre en Windows cuando:
1. **Otro proceso de Node.js está usando el archivo**
2. **Los permisos de Windows no permiten el renombrado**
3. **El antivirus está interfiriendo con la operación**
4. **Un proceso anterior no terminó correctamente**

## ✅ SOLUCIONES DISPONIBLES

### Opción 1: Script Batch (Recomendado)
```bash
fix-windows-prisma.bat
```

### Opción 2: Script PowerShell (Más Robusto)
```powershell
PowerShell -ExecutionPolicy Bypass -File fix-windows-prisma.ps1
```

### Opción 3: Comandos Manuales
```bash
# 1. Terminar procesos de Node.js
taskkill /F /IM node.exe

# 2. Limpiar caché
npm cache clean --force

# 3. Eliminar node_modules
rmdir /s /q node_modules
del package-lock.json

# 4. Reinstalar sin postinstall
npm install --ignore-scripts

# 5. Generar Prisma manualmente
npx prisma generate
```

## 🚀 Proceso de Solución

Los scripts automatizan estos pasos:

1. **Terminación de procesos**: Cierra todos los procesos de Node.js
2. **Limpieza de caché**: Elimina archivos temporales de npm
3. **Eliminación de archivos**: Remueve node_modules y package-lock.json
4. **Reinstalación limpia**: Instala dependencias sin hooks de postinstall
5. **Generación manual**: Ejecuta `prisma generate` manualmente
6. **Verificación**: Confirma que todo funciona correctamente

## 🔧 Soluciones Alternativas

### Si los scripts fallan:

#### 1. Ejecutar como Administrador
- Clic derecho en PowerShell → "Ejecutar como administrador"
- Ejecutar el script desde la terminal elevada

#### 2. Desactivar Antivirus Temporalmente
- Pausar la protección en tiempo real
- Ejecutar la instalación
- Reactivar la protección

#### 3. Usar WSL (Windows Subsystem for Linux)
```bash
# Instalar WSL2
wsl --install

# Dentro de WSL
cd /mnt/d/DESARROLLO/algoritmo/backend
npm install
```

#### 4. Cambiar Variables de Entorno
```bash
# Configurar mirror alternativo
set PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
npx prisma generate
```

## 📋 Verificación de la Solución

Después de ejecutar cualquier script, verifica que:
- ✅ No hay errores en la terminal
- ✅ El archivo `node_modules\.prisma\client\index.js` existe
- ✅ El comando `npm run start:dev` funciona

## 🔄 Pasos Posteriores

Una vez solucionado el problema:

1. **Iniciar el servidor**:
   ```bash
   npm run start:dev
   ```

2. **Verificar la API**:
   - URL: http://localhost:3001
   - Docs: http://localhost:3001/api/docs

3. **Configurar la base de datos** (si es necesario):
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

## 🚨 Prevención

Para evitar este problema en el futuro:
- Siempre cerrar completamente Visual Studio Code antes de reinstalar
- No interrumpir el proceso de `npm install`
- Configurar exclusiones en el antivirus para la carpeta del proyecto
- Usar WSL2 para desarrollo (recomendado)

## 📞 Soporte

Si el problema persiste después de todas las soluciones:
1. Verificar que tienes permisos de administrador
2. Comprobar que no hay procesos de Node.js en segundo plano
3. Intentar en un directorio diferente
4. Usar la versión LTS de Node.js (18.x o superior)

---

**✅ SOLUCIÓN VERIFICADA**: Estos scripts han sido probados y resuelven el problema de permisos de Prisma en Windows 10/11. 