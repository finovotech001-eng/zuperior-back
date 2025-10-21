-- Create new comprehensive Deposit table
CREATE TABLE IF NOT EXISTS "Deposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mt5AccountId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "transactionHash" TEXT,
    "proofFileUrl" TEXT,
    "bankDetails" TEXT,
    "cryptoAddress" TEXT,
    "depositAddress" TEXT,
    "externalTransactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- Create new enhanced Transaction table
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "depositId" TEXT,
    "withdrawalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to existing Transaction table if it already exists
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "transactionId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "metadata" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "depositId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "withdrawalId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create new enhanced Withdrawal table
CREATE TABLE IF NOT EXISTS "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mt5AccountId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "bankDetails" TEXT,
    "cryptoAddress" TEXT,
    "walletAddress" TEXT,
    "externalTransactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints for Deposit (if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Deposit_userId_fkey') THEN
        ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Deposit_mt5AccountId_fkey') THEN
        ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_mt5AccountId_fkey" FOREIGN KEY ("mt5AccountId") REFERENCES "MT5Account"("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key constraints for Transaction (if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_userId_fkey') THEN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_depositId_fkey') THEN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_withdrawalId_fkey') THEN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "Withdrawal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key constraints for Withdrawal (if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Withdrawal_userId_fkey') THEN
        ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS "Deposit_userId_idx" ON "Deposit"("userId");
CREATE INDEX IF NOT EXISTS "Deposit_mt5AccountId_idx" ON "Deposit"("mt5AccountId");
CREATE INDEX IF NOT EXISTS "Deposit_status_idx" ON "Deposit"("status");
CREATE INDEX IF NOT EXISTS "Deposit_createdAt_idx" ON "Deposit"("createdAt");

CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_depositId_idx" ON "Transaction"("depositId");
CREATE INDEX IF NOT EXISTS "Transaction_withdrawalId_idx" ON "Transaction"("withdrawalId");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX IF NOT EXISTS "Transaction_type_idx" ON "Transaction"("type");

CREATE INDEX IF NOT EXISTS "Withdrawal_userId_idx" ON "Withdrawal"("userId");
CREATE INDEX IF NOT EXISTS "Withdrawal_status_idx" ON "Withdrawal"("status");
CREATE INDEX IF NOT EXISTS "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");

-- Migrate existing ManualDeposit data to new Deposit table
-- Only if ManualDeposit table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ManualDeposit') THEN
        INSERT INTO "Deposit" (
            "id",
            "userId",
            "mt5AccountId",
            "amount",
            "currency",
            "method",
            "paymentMethod",
            "transactionHash",
            "proofFileUrl",
            "status",
            "rejectionReason",
            "approvedAt",
            "rejectedAt"
        )
        SELECT
            "id",
            "userId",
            "mt5AccountId",
            "amount",
            'USD',
            'manual',
            'manual',
            "transactionHash",
            "proofFileUrl",
            "status",
            "rejectionReason",
            "approvedAt",
            "rejectedAt"
        FROM "ManualDeposit"
        WHERE NOT EXISTS (
            SELECT 1 FROM "Deposit" d WHERE d."id" = "ManualDeposit"."id"
        );
    END IF;
END $$;

-- Migrate existing ManualDeposit data to Transaction table
-- Only if ManualDeposit table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ManualDeposit') THEN
        INSERT INTO "Transaction" (
            "id",
            "userId",
            "type",
            "amount",
            "currency",
            "status",
            "paymentMethod",
            "transactionId",
            "description",
            "depositId"
        )
        SELECT
            gen_random_uuid(),
            md."userId",
            'deposit',
            md."amount",
            'USD',
            md."status",
            'manual',
            md."transactionHash",
            'Migrated from ManualDeposit - ' || md."id",
            md."id"
        FROM "ManualDeposit" md
        WHERE NOT EXISTS (
            SELECT 1 FROM "Transaction" t WHERE t."depositId" = md."id"
        );
    END IF;
END $$;

-- Drop old ManualDeposit table
DROP TABLE IF EXISTS "ManualDeposit";

-- Update User model to remove manualDeposits and add deposits
ALTER TABLE "User" DROP COLUMN IF EXISTS "manualDeposits";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deposits" TEXT[];

-- Update MT5Account model to remove manualDeposits and add deposits
ALTER TABLE "MT5Account" DROP COLUMN IF EXISTS "manualDeposits";
ALTER TABLE "MT5Account" ADD COLUMN IF NOT EXISTS "deposits" TEXT[];