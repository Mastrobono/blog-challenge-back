# NestJS Blog API Backend

A modern REST API backend built with NestJS, Prisma, PostgreSQL, and Cloudinary for image storage. This API handles blog post creation with image uploads and provides endpoints for retrieving related posts.

## 🚀 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/) ORM
- **File Storage**: [Cloudinary](https://cloudinary.com/) for image uploads
- **Validation**: class-validator & class-transformer
- **Language**: TypeScript
- **Deployment**: Render

## 📋 Features

- ✅ RESTful API endpoints for blog posts
- ✅ Image upload with Cloudinary integration
- ✅ Automatic image optimization (WebP conversion)
- ✅ Input validation with DTOs
- ✅ PostgreSQL database with Prisma ORM
- ✅ Type-safe database queries
- ✅ Environment-based configuration
- ✅ Production-ready deployment setup

## 🏗️ Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema definition
├── src/
│   ├── posts/                 # Posts module
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   └── posts.module.ts
│   ├── prisma/               # Prisma module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts         # Root application module
│   └── main.ts               # Application entry point
├── scripts/
│   └── fix-prisma-client.js  # Prisma client compatibility fix
├── test/                     # E2E tests
└── render.yaml               # Render deployment configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dev-Leandro-Mastrobono-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=3001
   ```

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations** (if needed)
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3001` (port 3001 by default to avoid conflicts with Next.js)

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Yes |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🔌 API Endpoints

### Base URL
All endpoints are prefixed with `/api`

**Development:** `http://localhost:3001/api`  
**Production:** `https://your-app.onrender.com/api`

**Note:** The default port is 3001 to avoid conflicts with Next.js (which typically uses port 3000). CORS is enabled for frontend integration.

### Create Post
**POST** `/api/posts/related`

Create a new blog post with an image.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `title` (string, required, max 100 chars): Post title
  - `topic` (string, optional, max 50 chars): Post topic/category
  - `image` (file, required): Image file (jpg, jpeg, or png, max 5MB)

**Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": 1,
    "title": "My Blog Post",
    "topic": "Technology",
    "imageUrl": "https://res.cloudinary.com/...",
    "createdAt": "2025-11-17T12:00:00.000Z"
  }
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/posts/related \
  -F "title=My Blog Post" \
  -F "topic=Technology" \
  -F "image=@/path/to/image.jpg"
```

### Get Related Posts
**GET** `/api/posts/related`

Get the 3 most recent posts.

**Response:**
```json
[
  {
    "id": 3,
    "title": "Latest Post",
    "topic": "Technology",
    "imageUrl": "https://res.cloudinary.com/...",
    "createdAt": "2025-11-17T12:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Second Post",
    "topic": "Design",
    "imageUrl": "https://res.cloudinary.com/...",
    "createdAt": "2025-11-16T12:00:00.000Z"
  },
  {
    "id": 1,
    "title": "First Post",
    "topic": null,
    "imageUrl": "https://res.cloudinary.com/...",
    "createdAt": "2025-11-15T12:00:00.000Z"
  }
]
```

## 📊 Database Schema

### Post Model
```prisma
model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  title     String   @db.VarChar(100)
  imageUrl  String   @db.VarChar(255)
  topic     String?  @db.VarChar(50)
  readTime  Int?
}
```

## 🚀 Deployment on Render

### Prerequisites
- Render account
- PostgreSQL database on Render
- Cloudinary account configured

### Configuration

#### Option 1: Using render.yaml (Recommended)

The repository includes a `render.yaml` file with the correct configuration. Render will automatically detect and use it.

#### Option 2: Manual Configuration

If configuring manually in Render Dashboard:

**Build & Deploy Settings:**
- **Build Command**: `npm ci && npm run build && npx prisma migrate deploy --schema=./prisma/schema.prisma`
- **Start Command**: `npm run start:prod`
- **Root Directory**: Leave empty (default) or set to `.`

**Note**: 
- The build script automatically cleans and regenerates the Prisma client before building
- Database migrations are automatically applied during build using `prisma migrate deploy`
- NestJS generates files in `dist/src/` directory, so the start command uses `dist/src/main.js`

**Environment Variables:**
Set these in Render Dashboard → Environment:

- `DATABASE_URL` - Your PostgreSQL connection string from Render
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `NODE_ENV` - Set to `production`

### Important Notes

1. **Prisma Generation**: The build command includes `prisma generate` to ensure the Prisma client is generated before building
2. **Database Migrations**: The build command automatically runs `prisma migrate deploy` to apply migrations to the production database
3. **File Path**: The start command uses `dist/src/main.js` which matches NestJS compiled output structure (sourceRoot: src → dist/src/)
4. **Postinstall**: Runs after `npm install` to generate Prisma client and fix the default.js wrapper

### Troubleshooting Deployment

If you encounter errors during deployment:

1. **Check Environment Variables**
   - Verify all required variables are set in Render Dashboard
   - Ensure `DATABASE_URL` is correctly formatted

2. **Verify Build Process**
   - Check build logs to ensure `prisma generate` completes successfully
   - Verify that `dist/main.js` exists after build

3. **Common Issues**
   - **Error: Cannot find module '/opt/render/project/src/dist/main.js'**
     - Solution: Ensure Root Directory is empty (not set to `src`)
     - Verify Start Command uses `npm run start:prod` (which uses `dist/src/main.js`)
     - NestJS compiles to `dist/src/` because sourceRoot is `src`
   
   - **Error: Prisma client files not found**
     - Solution: Ensure `DATABASE_URL` is set before build
     - Check that `postinstall` script runs successfully
   
   - **Error: `/opt/render/project/src/node_modules/.prisma/client exists and is not empty but doesn't look like a generated Prisma Client`**
     - Solution: The build script now automatically cleans the Prisma client directory before generating
     - This error should be resolved with the updated build script that includes cleanup
     - If it persists, check that Root Directory is set correctly (empty or `.`)
   
   - **Error: `The table 'public.Post' does not exist in the current database` (P2021)**
     - Solution: The build command now includes `prisma migrate deploy` to automatically create tables
     - Make sure your `DATABASE_URL` is correctly set in Render Dashboard
     - After pushing these changes, the next deploy will automatically create the tables
     - If you need to run migrations manually, connect to your Render database and run: `npx prisma migrate deploy --schema=./prisma/schema.prisma`
   
   - **Slow API responses (30-50 seconds)**
     - **Render Free Tier "Sleep Mode"**: Free tier services sleep after ~15 minutes of inactivity and take 30-50 seconds to wake up
     - **Solution**: Upgrade to a paid plan, or use a service like UptimeRobot to ping your API every 10-14 minutes to keep it awake
     - **Optimizations applied**: Prisma now connects immediately on startup in production to reduce cold start delays
     - **Note**: The first request after sleep will always be slow, but subsequent requests should be fast

4. **Check Logs**
   - Review Render build logs for any errors
   - Check runtime logs for application errors

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the application for production |
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with watch |
| `npm run start:prod` | Start in production mode |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run prisma:generate` | Generate Prisma Client |

## 🧪 Testing

### Automated Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
## 🔧 Development

### Running in Development Mode

```bash
npm run start:dev
```

The server will automatically reload when you make changes.

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

## 📦 Dependencies

### Main Dependencies
- `@nestjs/common`, `@nestjs/core` - NestJS framework
- `@nestjs/config` - Configuration management
- `@nestjs/platform-express` - Express platform
- `@prisma/client` - Prisma ORM client
- `cloudinary` - Cloudinary SDK
- `multer-storage-cloudinary` - Cloudinary storage for Multer
- `class-validator`, `class-transformer` - Validation and transformation

### Dev Dependencies
- `@nestjs/cli` - NestJS CLI
- `typescript` - TypeScript compiler
- `prisma` - Prisma CLI
- `eslint`, `prettier` - Code quality tools
- `jest` - Testing framework


---
