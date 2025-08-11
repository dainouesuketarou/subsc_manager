/*
  Warnings:

  - You are about to drop the column `category_id` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionCategory" AS ENUM ('VIDEO_STREAMING', 'MUSIC_STREAMING', 'READING', 'GAMING', 'FITNESS', 'EDUCATION', 'PRODUCTIVITY', 'CLOUD_STORAGE', 'SECURITY', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_category_id_fkey";

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "category_id",
ADD COLUMN     "category" "public"."SubscriptionCategory" NOT NULL,
ADD COLUMN     "payment_start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."Category";
