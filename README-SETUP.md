# Configuración del Backend - Algoritmo Finanzas

## ✅ Problema Resuelto

El archivo `schema.prisma` estaba incompleto (faltaban datasource y generator). Ya ha sido **completamente reparado** con:
- ✅ Datasource PostgreSQL configurado
- ✅ Generator de Prisma Client configurado
- ✅ Todos los modelos necesarios (User, Account, Transaction, etc.)
- ✅ Todos los enums requeridos

## Estado de las Credenciales ✅

Las credenciales están correctamente configuradas en el archivo `.env`:

### Base de Datos PostgreSQL
- **Host**: 168.231.92.67
- **Puerto**: 5458
- **Usuario**: postgres
- **Contraseña**: (configurada)
- **Base de datos**: algoritmo

### Redis
- **Host**: 168.231.92.67
- **Puerto**: 5448
- **Contraseña**: f7acf5a6be395de04a1b

### Directus
- **URL**: https://algoritmo-algoritmo.dqyvuv.easypanel.host/
- **Token**: AWabczhdvm5fiuHqM7I6N6kqwHQxcaFp

## Pasos para Ejecutar el Proyecto

### Opción 1: Primera Vez (Recomendado)
Si es la primera vez que ejecutas el proyecto, usa este comando para configurar todo:

```bash
setup-database.bat
```

Esto hará:
1. Generar el cliente de Prisma
2. Crear las migraciones iniciales
3. Aplicar las migraciones a la base de datos

### Opción 2: Ejecución Normal
Si ya configuraste la base de datos previamente:

```bash
quick-start.bat
```

### Opción 3: Reparación Automática
Si tienes problemas con Prisma:

```bash
fix-prisma.bat
```

## Scripts Disponibles

| Script | Descripción |
|--------|------------|
| `setup-database.bat` | Configura la base de datos por primera vez |
| `quick-start.bat` | Inicia el servidor rápidamente |
| `run-project.bat` | Instalación completa y ejecución |
| `verify-backend.bat` | Verifica las conexiones |
| `fix-prisma.bat` | Soluciona problemas de Prisma |

## Acceder a la Aplicación

Una vez que el servidor esté ejecutándose:
- **API**: http://localhost:3001
- **Documentación Swagger**: http://localhost:3001/api/docs
- **Prisma Studio**: Ejecuta `npm run prisma:studio`

## Comandos Útiles

### Ver la base de datos
```bash
npm run prisma:studio
```

### Generar cliente de Prisma
```bash
npm run prisma:generate
```

### Crear nueva migración
```bash
npx prisma migrate dev --name nombre_de_migracion
```

### Ejecutar pruebas
```bash
npm test
```

## Estructura del Schema de Base de Datos

El schema incluye los siguientes modelos principales:

- **User**: Usuarios del sistema
- **Account**: Cuentas bancarias (corriente, ahorro, inversión)
- **CreditCard**: Tarjetas de crédito
- **Transaction**: Transacciones financieras
- **Bill**: Facturas y pagos
- **Contract**: Contratos y documentos
- **Goal**: Metas financieras
- **Reminder**: Recordatorios
- **Notification**: Notificaciones
- **Subscription**: Suscripciones y planes

## Solución de Problemas

### Error: "You don't have any datasource defined"
✅ **RESUELTO**: El archivo `schema.prisma` ya ha sido reparado.

### Error de conexión a la base de datos
- Verifica las credenciales en `.env`
- Ejecuta `verify-backend.bat` para diagnosticar
- Asegúrate de tener conexión a internet

### Error al generar migraciones
- Ejecuta `setup-database.bat`
- Si persiste, ejecuta `npx prisma db push --force-reset` (⚠️ esto borrará todos los datos)

### Puerto 3001 en uso
- Cambia el puerto en el archivo `.env`
- O detén el proceso que está usando el puerto

## Notas Importantes

- El proyecto usa servicios remotos (no necesitas Docker local)
- Las credenciales están preconfiguradas
- La base de datos PostgreSQL está en la nube
- Redis también está en la nube
- Asegúrate de tener conexión a internet estable
