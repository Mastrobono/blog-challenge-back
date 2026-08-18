import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private prisma: PrismaService) {}

  async create(title: string, imageUrl: string, topic?: string) {
    try {
      return await this.prisma.post.create({
        data: {
          title,
          imageUrl,
          topic: topic || null,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientInitializationError) {
        this.logger.error('Database connection error:', error.message);
        throw new Error('Could not connect to the database. Please check your connection.');
      }
      throw error;
    }
  }

  async findAllRelated() {
    this.logger.log('findAllRelated: Starting query');
    const startTime = Date.now();
    
    try {
      // Add timeout to prevent hanging - return empty array if query takes too long
      this.logger.log('findAllRelated: Executing Prisma query');
      const queryPromise = this.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3, // Limit to 3 for the related posts section
      });
      
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
          this.logger.warn('findAllRelated: Query timeout after 5 seconds');
          reject(new Error('Query timeout after 5 seconds'));
        }, 5000)
      );
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      const duration = Date.now() - startTime;
      this.logger.log(`findAllRelated: Query completed in ${duration}ms, found ${result.length} posts`);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error(`findAllRelated: Error after ${duration}ms:`, error?.message || error);
      
      // If unable to connect to database or timeout, return empty array instead of error
      if (
        error instanceof PrismaClientInitializationError ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('Can\'t reach database') ||
        error?.code === 'P1001' // Prisma connection error code
      ) {
        this.logger.warn('Database connection error or timeout, returning empty array');
        return [];
      }
      // For other errors, throw normally
      throw error;
    }
  }
}
