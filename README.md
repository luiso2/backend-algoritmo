# Backend API - Algoritmo Finanzas

## Descripción
Backend API para la plataforma de gestión financiera personal Algoritmo. Construido con NestJS, Prisma y PostgreSQL.

## Tecnologías
- NestJS
- Prisma ORM
- PostgreSQL
- Redis (cache y colas)
- JWT Authentication
- Stripe (pagos)
- SendGrid (emails)
- Twilio (SMS)
- AWS S3 (storage)

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Seed de datos (opcional)
npm run prisma:seed
```

## Ejecutar

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Documentación API
Swagger disponible en: http://localhost:3001/api/docs

## Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Estructura del Proyecto

```
src/
├── common/          # Utilidades compartidas
├── config/          # Configuración
├── modules/         # Módulos de funcionalidad
│   ├── auth/       # Autenticación
│   ├── users/      # Usuarios
│   ├── accounts/   # Cuentas bancarias
│   ├── credit-cards/ # Tarjetas de crédito
│   ├── transactions/ # Transacciones
│   └── ...         # Otros módulos
├── app.module.ts   # Módulo principal
└── main.ts         # Punto de entrada
```

## Características Principales

- ✅ Autenticación JWT con refresh tokens
- ✅ Gestión completa de finanzas personales
- ✅ Pay Close: Optimización de utilización de crédito
- ✅ Multi-moneda con conversión automática
- ✅ Sistema de notificaciones multi-canal
- ✅ AI Assistant integrado
- ✅ Gamificación con logros
- ✅ Gestión de contratos con templates
- ✅ Reportes y analytics avanzados
- ✅ Integración con Stripe para pagos

## Licencia
Privado - Todos los derechos reservados
