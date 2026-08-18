import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Connect immediately in production to avoid cold start delays
    // In development, connect lazily to allow app to start without DB
    if (process.env.NODE_ENV === 'production') {
      try {
        // Use Promise.race to add a timeout to the connection
        const connectPromise = this.$connect();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        this.logger.log('✅ Prisma connected to database');
      } catch (error) {
        this.logger.warn('⚠️  Prisma connection failed or timed out, will retry on first query:', error.message);
        // Don't throw - allow app to start, connection will be retried on first query
        // The query will handle the connection error gracefully
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Ensures graceful shutdown when the Nest application closes
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
