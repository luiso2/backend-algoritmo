# 🚨 CONFIGURACIÓN MANUAL DE RAILWAY

## ✅ PASO 1: CÓDIGO ACTUALIZADO

Los archivos han sido actualizados exitosamente:
- ✅ `src/main.ts` - Más robusto con mejor logging
- ✅ `src/app.module.ts` - Redis opcional
- ✅ `Dockerfile` - Optimizado
- ✅ Push al repositorio completado

## 🔧 PASO 2: CONFIGURAR VARIABLES EN RAILWAY

### Ve a tu proyecto Railway:
https://railway.app/project/22a97d6a-8aff-42f5-97ee-a1118c5dbaa4

### Configurar estas variables (Settings > Variables):

#### ✅ VARIABLES CRÍTICAS (OBLIGATORIAS):

```
NODE_ENV=production
PORT=3001
JWT_SECRET=algoritmo-jwt-secret-key-2024-secure-production-change-this
JWT_REFRESH_SECRET=algoritmo-refresh-secret-key-2024-secure-production-change-this
```

#### ✅ CORS Y SEGURIDAD:

```
CORS_ORIGINS=*
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
ENCRYPTION_KEY=algoritmo2024securekeyfor32chars
```

#### ✅ EMAIL (OPCIONAL):

```
EMAIL_FROM=noreply@algoritmo.com
EMAIL_FROM_NAME=Algoritmo Finanzas
```

### ❌ ELIMINAR ESTAS VARIABLES SI EXISTEN:

- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `REDIS_URL`
- `DIRECTUS_URL` (temporalmente)
- `DIRECTUS_TOKEN` (temporalmente)

## 🚀 PASO 3: REDEPLOY

1. **Automático**: Railway debería redesplegar automáticamente
2. **Manual**: Si no, click en "Deploy" en el dashboard

## 🔍 PASO 4: VERIFICAR

- API: https://algoritmo-backend-production.up.railway.app/api
- Health: https://algoritmo-backend-production.up.railway.app/api/health
- Docs: https://algoritmo-backend-production.up.railway.app/api/docs

## 📋 ESTADO ACTUAL:

✅ **Código actualizado y subido**
✅ **Redis hecho opcional** 
✅ **Directus hecho opcional**
✅ **Main.ts más robusto**
✅ **CORS más permisivo**
✅ **Mejor logging para debugging**

🔄 **Pendiente**: Configurar variables en Railway

## 🆘 SI SIGUE FALLANDO:

1. **Ver logs en Railway**: Dashboard > Logs
2. **Verificar PostgreSQL**: Debe estar corriendo
3. **Revisar variables**: Deben estar bien configuradas
4. **Hacer redeploy manual**: Si es necesario

## 📱 PRÓXIMO PASOS:

Una vez funcionando:
1. ✅ API básica funcionando
2. ➕ Agregar Redis como servicio
3. ➕ Reactivar Directus
4. ➕ Configurar SendGrid/Stripe

---

**🎯 ACCIÓN REQUERIDA: Configura las variables en Railway ahora**
