# 🚀 Despliegue en Vercel - Backend Algoritmo

## ⚠️ IMPORTANTE: Limitaciones de Vercel

Este backend NestJS **NO está optimizado para Vercel**. Vercel está diseñado para:
- Aplicaciones frontend
- API Routes simples
- Funciones serverless

### Características que NO funcionarán en Vercel:
- ❌ WebSockets (notificaciones en tiempo real)
- ❌ Bull Queues (trabajos en segundo plano)
- ❌ Scheduler (tareas programadas)
- ❌ Almacenamiento de archivos local
- ❌ Conexiones persistentes a base de datos
- ❌ Sesiones largas (timeout máximo 10s)

## 📋 Pre-requisitos

### 1. Servicios Externos Necesarios

#### PostgreSQL (Elige uno):
- **Supabase** (Recomendado): https://supabase.com
- **Neon**: https://neon.tech
- **PlanetScale**: https://planetscale.com

#### Redis (Opcional, pero sin él no funcionarán ciertas características):
- **Upstash**: https://upstash.com

#### Almacenamiento de Archivos:
- **Cloudinary**: https://cloudinary.com
- **Supabase Storage**: Incluido con Supabase

## 🛠️ Pasos de Configuración

### 1. Preparar Variables de Entorno

En Vercel Dashboard, agregar estas variables:

```env
# Base de Datos (REQUERIDO)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# JWT (REQUERIDO)
JWT_SECRET=genera-una-clave-super-segura-aqui
JWT_REFRESH_SECRET=otra-clave-segura-diferente

# Redis (Opcional)
REDIS_HOST=tu-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu-redis-password

# CORS (IMPORTANTE)
CORS_ORIGINS=https://tu-frontend.vercel.app

# Servicios Opcionales
SENDGRID_API_KEY=tu-sendgrid-key
STRIPE_SECRET_KEY=tu-stripe-key
OPENAI_API_KEY=tu-openai-key

# Indicador de Vercel
VERCEL=1
NODE_ENV=production
```

### 2. Build Local (Verificación)

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npm run prisma:generate

# Build
npm run build

# Verificar que dist/ existe
ls dist/
```

### 3. Desplegar en Vercel

#### Opción A: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Para producción
vercel --prod
```

#### Opción B: Conectar con GitHub

1. Subir código a GitHub
2. En Vercel Dashboard: "Import Project"
3. Seleccionar el repositorio
4. Configurar:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 🔧 Verificación Post-Despliegue

### 1. Verificar API Health

```bash
curl https://tu-app.vercel.app/api/health
```

### 2. Verificar Documentación

Visitar: `https://tu-app.vercel.app/api/docs`

### 3. Test de Autenticación

```bash
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## 🐛 Solución de Problemas

### Error: "Function timeout"
- Reducir operaciones complejas
- Implementar paginación agresiva
- Cachear respuestas frecuentes

### Error: "Cold start too slow"
- Reducir dependencias
- Lazy load módulos pesados
- Usar Edge Functions para endpoints críticos

### Error: "Cannot connect to database"
- Verificar DATABASE_URL
- Agregar `?connection_limit=1` a la URL
- Usar pgbouncer si está disponible

### Error: "Module not found"
- Verificar que `dist/` está incluido
- Ejecutar `npm run build` antes de deploy
- Verificar `vercel.json` paths

## 🚀 Alternativas Recomendadas

Si necesitas todas las características del backend:

### 1. **Railway** (Más fácil)
```bash
railway login
railway init
railway add
railway up
```

### 2. **Render**
- Deploy directo desde GitHub
- PostgreSQL incluido
- Redis disponible
- WebSockets soportados

### 3. **Fly.io**
- Mejor para aplicaciones realtime
- Deployment global
- Persistencia incluida

## 📊 Comparación de Costos

| Servicio | Free Tier | Características |
|----------|-----------|-----------------|
| Vercel | Generoso | Solo serverless |
| Railway | $5 credit | Full stack |
| Render | 750 hrs/mes | Full features |
| Fly.io | $5 credit | Global deploy |

## 🎯 Recomendación Final

**Para producción real**: NO uses Vercel para el backend.

Mejor arquitectura:
1. **Frontend**: Vercel ✅
2. **Backend**: Railway/Render ✅
3. **Base de Datos**: Supabase ✅
4. **Redis**: Upstash ✅

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Considera cambiar a Railway/Render

---

**Recuerda**: Este setup es para pruebas. Para producción, usa una plataforma diseñada para backends.
