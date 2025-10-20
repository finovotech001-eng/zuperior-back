/*
  Warnings:

  - You are about to drop the column `accountId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `equity` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `leverage` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `credit` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `equity` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `groupName` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `isEnabled` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `leverage` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `margin` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `marginFree` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `marginLevel` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `profit` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MT5Account` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `accountType` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Account_accountId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "accountId",
DROP COLUMN "equity",
DROP COLUMN "leverage",
DROP COLUMN "platform",
ADD COLUMN     "accountType" TEXT NOT NULL,
ALTER COLUMN "balance" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "MT5Account" DROP COLUMN "balance",
DROP COLUMN "credit",
DROP COLUMN "equity",
DROP COLUMN "groupName",
DROP COLUMN "isEnabled",
DROP COLUMN "leverage",
DROP COLUMN "margin",
DROP COLUMN "marginFree",
DROP COLUMN "marginLevel",
DROP COLUMN "platform",
DROP COLUMN "profit",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "createdAt",
ALTER COLUMN "status" SET DEFAULT 'pending';
