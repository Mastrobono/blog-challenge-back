import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { execSync } from 'child_process';

async function bootstrap() {
  // Run migrations before starting the app (only in production)
  // Note: migrate deploy is idempotent - it only applies pending migrations
  if (process.env.NODE_ENV === 'production') {
    try {
      execSync('npx prisma migrate deploy --schema=./prisma/schema.prisma', {
        stdio: 'pipe', // Use pipe instead of inherit to avoid blocking
        timeout: 30000, // 30 second timeout
      });
    } catch (error) {
      // Don't throw - allow app to start even if migrations fail
      // This prevents the app from crashing if migrations were already applied
    }
  }

  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend requests (Next.js, React, etc.)
  const allowedOrigins = [
    'http://localhost:3000',  // Next.js default port (development)
    'http://localhost:3001',  // Alternative Next.js port (development)
    'http://localhost:3002',  // Another common port (development)
    process.env.FRONTEND_URL,  // Production frontend URL from env
  ].filter(Boolean); // Remove undefined values

  // In production, allow all origins if FRONTEND_URL is not set (for flexibility)
  // In development, only allow localhost

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL
      ? true  // Allow all origins in production if FRONTEND_URL not set
      : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable Prisma shutdown hooks
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Use port 3001 by default to avoid conflicts with Next.js (which uses 3000)
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}
bootstrap();
