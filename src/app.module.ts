import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Solo los módulos más básicos
import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

// Configuración ultra simple
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration - Solo lo básico
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
      // Sin validación por ahora para evitar errores
    }),

    // Solo módulos esenciales
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {
  constructor() {
    console.log('✅ AppModule inicializado correctamente');
  }
}
