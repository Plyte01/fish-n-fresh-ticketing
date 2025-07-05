-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "bannerImage" TEXT,
    "themeColor" TEXT,
    "aboutHtml" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
