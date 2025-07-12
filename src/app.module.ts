import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
// import { BullModule } from '@nestjs/bull'; // Comentado temporalmente
import { CacheModule } from '@nestjs/cache-manager';
// import * as redisStore from 'cache-manager-redis-store'; // Comentado temporalmente

// Modules
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { CreditCardsModule } from './modules/credit-cards/credit-cards.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BillsModule } from './modules/bills/bills.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AiModule } from './modules/ai/ai.module';
import { FilesModule } from './modules/files/files.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { DirectusModule } from './modules/directus/directus.module';
import { HealthModule } from './modules/health/health.module';

// Configuration
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      cache: true,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{
        ttl: config.get('RATE_LIMIT_TTL', 60) * 1000,
        limit: config.get('RATE_LIMIT_LIMIT', 100),
      }],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Queue management - TEMPORALMENTE DESHABILITADO
    // TODO: Reemplazar con implementación que no requiera Redis obligatorio
    /*
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisHost = config.get('REDIS_HOST');
        if (!redisHost || redisHost === 'localhost') {
          // Si no hay Redis configurado, no inicializar BullMQ
          return null;
        }
        return {
          redis: {
            host: redisHost,
            port: config.get('REDIS_PORT', 6379),
            password: config.get('REDIS_PASSWORD'),
          },
        };
      },
    }),
    */

    // Caching - Usar cache en memoria por defecto si no hay Redis
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisHost = config.get('REDIS_HOST');
        
        // Si Redis está disponible, usarlo
        if (redisHost && redisHost !== 'localhost') {
          try {
            const redisStore = await import('cache-manager-redis-store');
            return {
              store: redisStore.default as any,
              host: redisHost,
              port: config.get('REDIS_PORT', 6379),
              password: config.get('REDIS_PASSWORD'),
              ttl: 60 * 60 * 24, // 24 hours default
            };
          } catch (error) {
            console.warn('Redis no disponible, usando cache en memoria:', error.message);
          }
        }
        
        // Fallback a cache en memoria
        console.log('Usando cache en memoria (sin Redis)');
        return {
          ttl: 60 * 60 * 24, // 24 hours default
        };
      },
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    CreditCardsModule,
    TransactionsModule,
    BillsModule,
    ContractsModule,
    RemindersModule,
    NotificationsModule,
    ReportsModule,
    AiModule,
    FilesModule,
    SubscriptionsModule,
    WebhooksModule,
    DirectusModule,
    HealthModule,
  ],
})
export class AppModule {}
