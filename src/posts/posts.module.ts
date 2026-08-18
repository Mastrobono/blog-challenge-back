import { Module, OnModuleInit } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController, initializeCloudinaryStorage } from './posts.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Initialize Cloudinary storage when module initializes
    // Note: If Cloudinary fails to initialize, we don't throw
    // This allows the app to start even if Cloudinary is misconfigured
    // The error will be caught when trying to use it
    try {
      initializeCloudinaryStorage(this.configService);
    } catch (error) {
      // Don't throw - allow app to start even if Cloudinary fails
      // The error will be caught when trying to upload
    }
  }
}
