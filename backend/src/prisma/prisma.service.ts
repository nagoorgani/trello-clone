import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to PostgreSQL Database via Prisma');
    } catch (error) {
      console.warn('⚠️ Prisma connection pending (will reconnect when DB is active):', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
