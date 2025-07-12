import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Iniciando Algoritmo Backend...');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

  try {
    // Security
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'https:'],
        },
      },
    }) as any);

    // Compression
    app.use(compression());

    // CORS - Más permisivo para Railway
    const corsOrigins = configService.get<string>('CORS_ORIGINS', '*');
    console.log('🌐 Configurando CORS para:', corsOrigins);
    
    app.enableCors({
      origin: corsOrigins === '*' ? true : corsOrigins.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Algoritmo Finanzas API')
      .setDescription('API documentation for Algoritmo personal finance management platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('accounts', 'Bank accounts management')
      .addTag('credit-cards', 'Credit cards management')
      .addTag('transactions', 'Transactions management')
      .addTag('bills', 'Bills and payments')
      .addTag('contracts', 'Contract management')
      .addTag('reports', 'Financial reports and analytics')
      .addTag('ai', 'AI Assistant')
      .addTag('notifications', 'Notifications management')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    // WebSockets configuration
    app.enableShutdownHooks();

    // ✅ CRÍTICO: Bind a todas las interfaces (0.0.0.0) para Railway
    await app.listen(port, '0.0.0.0');
    
    const environment = configService.get('NODE_ENV', 'development');
    const appUrl = configService.get('APP_URL') || configService.get('RAILWAY_STATIC_URL') || `http://localhost:${port}`;
    
    console.log(`
    ✅ Algoritmo Finanzas Backend INICIADO EXITOSAMENTE!
    🌍 Environment: ${environment}
    🔌 Port: ${port}
    📡 API URL: ${appUrl}/api
    📚 API Docs: ${appUrl}/api/docs
    🏥 Health Check: ${appUrl}/api/health
    💾 Database: ${configService.get('DATABASE_URL') ? '✅ Conectada' : '❌ No configurada'}
    🔧 Redis: ${configService.get('REDIS_HOST') ? '✅ Configurado' : '⚠️ No configurado (usando memoria)'}
    `);

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    // No salir inmediatamente, permitir que la app intente iniciarse
  }
}

bootstrap().catch(error => {
  console.error('❌ Error fatal al iniciar la aplicación:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});
