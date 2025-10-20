/*
  Warnings:

  - Added the required column `updatedAt` to the `MT5Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MT5Account" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "equity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "group" TEXT,
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leverage" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "margin" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "marginFree" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "marginLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
