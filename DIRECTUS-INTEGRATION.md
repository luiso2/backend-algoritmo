# 🔄 Integración Prisma + Directus

## 📋 Situación

La base de datos PostgreSQL está siendo utilizada por dos sistemas:
1. **Directus CMS** - Para gestión de contenido (tablas `directus_*`)
2. **Backend NestJS/Prisma** - Para la lógica de negocio (tablas `app_*`)

## ✅ Solución Implementada

Para evitar conflictos entre Prisma y Directus, hemos implementado las siguientes medidas:

### 1. Prefijos en las Tablas
- **Tablas de Directus**: `directus_*` (ya existentes)
- **Tablas de la Aplicación**: `app_*` (nuevo prefijo)

### 2. Schema de Prisma Actualizado
Todas las tablas en el schema de Prisma ahora usan `@@map` para agregar el prefijo `app_`:

```prisma
model User {
  // ... campos del modelo
  @@map("app_users")
}
```

### 3. Scripts Especializados

#### Verificar el Estado de la Base de Datos
```bash
check-database.bat
```
Este script muestra:
- Todas las tablas existentes
- Clasificación por tipo (Directus, App, Otras)
- Detección de posibles conflictos

#### Iniciar con Soporte para Directus
```bash
start-with-directus.bat
```
Este script:
- Usa `prisma db push` en lugar de migraciones
- No afecta las tablas de Directus
- Crea solo las tablas con prefijo `app_`

## 🚀 Cómo Ejecutar

### Primera Vez:
1. Verificar el estado actual:
   ```bash
   check-database.bat
   ```

2. Ejecutar el proyecto:
   ```bash
   start-with-directus.bat
   ```

### Ejecuciones Posteriores:
```bash
quick-start.bat
```

## 📊 Estructura de Tablas

### Tablas de Directus (NO TOCAR)
- `directus_activity`
- `directus_collections`
- `directus_dashboards`
- `directus_fields`
- `directus_files`
- `directus_flows`
- `directus_folders`
- `directus_migrations`
- `directus_notifications`
- `directus_operations`
- `directus_panels`
- `directus_permissions`
- `directus_presets`
- `directus_relations`
- `directus_revisions`
- `directus_roles`
- `directus_sessions`
- `directus_settings`
- `directus_shares`
- `directus_translations`
- `directus_users`
- `directus_versions`
- `directus_webhooks`

### Tablas de la Aplicación
- `app_users`
- `app_accounts`
- `app_credit_cards`
- `app_transactions`
- `app_bills`
- `app_contracts`
- `app_goals`
- `app_reminders`
- `app_notifications`
- `app_tags`
- `app_ai_interactions`
- `app_pricing_plans`
- `app_subscriptions`
- `app_file_uploads`
- `app_refresh_tokens`

## ⚠️ Precauciones

1. **NO usar `prisma migrate`** - Podría intentar eliminar las tablas de Directus
2. **Usar `prisma db push`** - Más seguro para bases de datos compartidas
3. **Verificar antes de sincronizar** - Siempre ejecuta `check-database.bat` primero

## 🔧 Comandos Útiles

### Ver todas las tablas en Prisma Studio
```bash
npm run prisma:studio
```
Nota: Solo mostrará las tablas con prefijo `app_`

### Sincronizar cambios del schema
```bash
npx prisma db push --skip-generate
```

### Generar cliente de Prisma
```bash
npm run prisma:generate
```

## 🤝 Coexistencia Pacífica

Con esta configuración:
- ✅ Directus puede seguir funcionando normalmente
- ✅ El backend puede crear y gestionar sus propias tablas
- ✅ No hay conflictos de nombres
- ✅ Ambos sistemas pueden acceder a la misma base de datos
- ✅ Las migraciones futuras no afectarán a Directus

## 📝 Notas Importantes

1. Si necesitas acceder a datos de Directus desde el backend, puedes:
   - Usar el SDK de Directus
   - Hacer queries SQL directas (con cuidado)
   - Usar la API REST de Directus

2. Los usuarios de la aplicación (`app_users`) son independientes de los usuarios de Directus (`directus_users`)

3. Si necesitas sincronizar datos entre ambos sistemas, considera:
   - Webhooks de Directus
   - Jobs programados
   - API calls entre sistemas
