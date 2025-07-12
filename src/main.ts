import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 INICIANDO ALGORITMO BACKEND - VERSION SIMPLE');
  console.log('=================================================');
  
  try {
    console.log('📦 Creando aplicación NestJS...');
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    console.log('⚙️ Configurando aplicación...');
    
    // Configuración mínima
    const port = process.env.PORT || 3001;
    
    // CORS muy permisivo
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['*'],
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Pipes básicos
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));

    console.log('🌍 Variables de entorno:');
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   - PORT: ${port}`);
    console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado'}`);

    console.log('🚀 Iniciando servidor en puerto:', port);
    
    // CRÍTICO: Bind a 0.0.0.0 para Railway
    await app.listen(port, '0.0.0.0');
    
    console.log('✅ ¡SERVIDOR INICIADO EXITOSAMENTE!');
    console.log(`📡 API disponible en: http://0.0.0.0:${port}/api`);
    console.log(`🏥 Health check: http://0.0.0.0:${port}/api/health`);
    console.log('=================================================');

  } catch (error) {
    console.error('❌ ERROR FATAL AL INICIAR:', error);
    console.error('Stack trace:', error.stack);
    console.error('=================================================');
    process.exit(1);
  }
}

bootstrap();
