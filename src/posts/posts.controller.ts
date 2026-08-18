import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ConfigService } from '@nestjs/config';

// Cloudinary storage instance - initialized lazily
let cloudinaryStorageInstance: CloudinaryStorage | null = null;

// Function to get or create Cloudinary storage instance
function getCloudinaryStorage(configService?: ConfigService): CloudinaryStorage {
  if (cloudinaryStorageInstance) {
    return cloudinaryStorageInstance;
  }

  // Get config from ConfigService or fallback to process.env
  const cloudName = configService?.get<string>('CLOUDINARY_CLOUD_NAME') || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = configService?.get<string>('CLOUDINARY_API_KEY') || process.env.CLOUDINARY_API_KEY;
  const apiSecret = configService?.get<string>('CLOUDINARY_API_SECRET') || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const missing: string[] = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    
    throw new Error(
      `Missing required Cloudinary environment variables: ${missing.join(', ')}. ` +
      `Please check your .env file or environment configuration.`
    );
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Test Cloudinary connection by checking config
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      throw new Error('Cloudinary configuration failed. Check your credentials.');
    }

    cloudinaryStorageInstance = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'nestjs_blog_uploads',
        format: async (req, file) => 'webp', // Optimized format for web
        public_id: (req, file) => Date.now().toString(),
      } as any,
    });

    return cloudinaryStorageInstance;
  } catch (error) {
    throw new Error(
      `Failed to configure Cloudinary: ${error.message}. ` +
      `Please verify your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are correct.`
    );
  }
}

// Function to initialize Cloudinary storage (called from module)
export function initializeCloudinaryStorage(configService: ConfigService): void {
  if (!cloudinaryStorageInstance) {
    getCloudinaryStorage(configService);
  }
}

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly configService: ConfigService,
  ) {
    // Initialize Cloudinary storage early in constructor
    // This ensures it's ready when the interceptor needs it
    initializeCloudinaryStorage(this.configService);
  }

  @Post('related')
  @UseInterceptors(
    // Use the CloudinaryStorage engine
    FileInterceptor('image', {
      get storage() {
        // Lazy initialization - will use process.env if ConfigService not available in this context
        return getCloudinaryStorage();
      },
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException('Only image files (jpg/jpeg/png) are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRelated(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File & { path?: string; secure_url?: string },
  ) {
    if (!file || !file.path) {
      throw new BadRequestException('Image file is required or upload failed.');
    }

    // 1. The public URL is available in file.path (secure_url from Cloudinary)
    // CloudinaryStorage stores the URL in file.path or file.secure_url
    const imageUrl = file.path || file.secure_url || (file as any).url;

    // 2. Save post data to PostgreSQL (via Render DB URL)
    const post = await this.postsService.create(
      createPostDto.title,
      imageUrl,
      createPostDto.topic,
    );

    return {
      message: 'Post created successfully',
      post,
    };
  }

  @Get('related')
  async findAllRelated() {
    try {
      return await this.postsService.findAllRelated();
    } catch (error) {
      throw error;
    }
  }
}
