-- CreateTable
CREATE TABLE "CustomerVideoData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerFirstName" TEXT,
    "customerLastName" TEXT,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_video_generation',
    "metaObjectId" TEXT,
    "videoUrl" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
