-- Create new comprehensive Deposit table
CREATE TABLE "Deposit" (
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
CREATE TABLE "Transaction" (
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

-- Create new enhanced Withdrawal table
CREATE TABLE "Withdrawal" (
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

-- Add foreign key constraints for Deposit
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_mt5AccountId_fkey" FOREIGN KEY ("mt5AccountId") REFERENCES "MT5Account"("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add foreign key constraints for Transaction
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "Withdrawal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key constraints for Withdrawal
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "Deposit_userId_idx" ON "Deposit"("userId");
CREATE INDEX "Deposit_mt5AccountId_idx" ON "Deposit"("mt5AccountId");
CREATE INDEX "Deposit_status_idx" ON "Deposit"("status");
CREATE INDEX "Deposit_createdAt_idx" ON "Deposit"("createdAt");

CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_depositId_idx" ON "Transaction"("depositId");
CREATE INDEX "Transaction_withdrawalId_idx" ON "Transaction"("withdrawalId");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId");
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");

-- Migrate existing ManualDeposit data to new Deposit table
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
    "rejectedAt",
    "createdAt",
    "updatedAt"
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
    "rejectedAt",
    "createdAt",
    "updatedAt"
FROM "ManualDeposit";

-- Migrate existing ManualDeposit data to Transaction table
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
    "depositId",
    "createdAt",
    "updatedAt"
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
    md."id",
    md."createdAt",
    md."updatedAt"
FROM "ManualDeposit" md;

-- Drop old ManualDeposit table
DROP TABLE "ManualDeposit";

-- Update User model to remove manualDeposits and add deposits
ALTER TABLE "User" DROP COLUMN IF EXISTS "manualDeposits";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deposits" TEXT[];

-- Update MT5Account model to remove manualDeposits and add deposits
ALTER TABLE "MT5Account" DROP COLUMN IF EXISTS "manualDeposits";
ALTER TABLE "MT5Account" ADD COLUMN IF NOT EXISTS "deposits" TEXT[];