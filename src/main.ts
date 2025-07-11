import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

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

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS', 'http://localhost:5173').split(','),
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // WebSockets configuration
  app.enableShutdownHooks();

  await app.listen(port);
  console.log(`
    🚀 Algoritmo Finanzas Backend is running!
    🌍 Environment: ${configService.get('NODE_ENV')}
    📡 API URL: http://localhost:${port}/api
    📚 API Docs: http://localhost:${port}/api/docs
  `);
}

bootstrap();
