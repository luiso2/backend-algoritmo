# 🚀 Backend Algoritmo Finanzas - Listo para Railway

Este backend está **completamente preparado** para ser desplegado en Railway.

## ✅ Archivos de Configuración Incluidos

- ✅ `railway.json` - Configuración de Railway
- ✅ `nixpacks.toml` - Configuración de build
- ✅ `Procfile` - Comandos de inicio y release
- ✅ `health.module.ts` - Endpoints de health check
- ✅ `.env.railway.example` - Variables de entorno necesarias

## 🚂 Deploy Rápido

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Backend listo para Railway"
git remote add origin https://github.com/TU_USUARIO/algoritmo-backend.git
git push -u origin main
```

### 2. Deploy en Railway
```bash
# Instalar CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway add postgresql
railway add redis
railway up
```

### 3. Configurar Variables de Entorno

Copiar de `.env.railway.example` y agregar en Railway Dashboard:

- `JWT_SECRET` - Generar clave segura
- `JWT_REFRESH_SECRET` - Generar otra clave segura  
- `CORS_ORIGINS` - URL de tu frontend
- `SENDGRID_API_KEY` - Para emails (opcional)
- `OPENAI_API_KEY` - Para IA (opcional)

## 🔗 URLs Importantes

Después del deploy:

- API: `https://tu-app.up.railway.app/api`
- Docs: `https://tu-app.up.railway.app/api/docs`
- Health: `https://tu-app.up.railway.app/api/health`

## 📝 Notas

- PostgreSQL y Redis se configuran automáticamente
- Las migraciones se ejecutan automáticamente
- SSL/HTTPS incluido
- Logs en tiempo real disponibles

## 🆘 Soporte

Ver `DEPLOY-RAILWAY.md` para guía completa.

---

**Estado: LISTO PARA PRODUCCIÓN** 🎉
