import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: configService.get('NODE_ENV') === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Middleware for soft deletes (if needed)
    this.$use(async (params, next) => {
      // Check incoming query type
      if (params.model && params.action === 'delete') {
        // Change action to update with soft delete
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
      }
      
      if (params.model && params.action === 'deleteMany') {
        // Change action to updateMany with soft delete
        params.action = 'updateMany';
        params.args['data'] = { deletedAt: new Date() };
      }
      
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to clean database for testing
  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') !== 'test') {
      throw new Error('cleanDatabase can only be used in test environment');
    }

    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  }
}
