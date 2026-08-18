-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR(100) NOT NULL,
    "imageUrl" VARCHAR(255) NOT NULL,
    "topic" VARCHAR(50),
    "readTime" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
