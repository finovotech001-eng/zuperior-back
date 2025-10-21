-- Add new columns to MT5Transaction table for better deposit tracking
ALTER TABLE "MT5Transaction" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "MT5Transaction" ADD COLUMN IF NOT EXISTS "depositId" TEXT;
ALTER TABLE "MT5Transaction" ADD COLUMN IF NOT EXISTS "withdrawalId" TEXT;
ALTER TABLE "MT5Transaction" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "MT5Transaction" ADD COLUMN IF NOT EXISTS "processedBy" TEXT;
ALTER TABLE "MT5Transaction" ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP(3);
ALTER TABLE "MT5Transaction" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update status column to support 'rejected' status
-- (Already supports pending, completed, failed - just documenting that rejected is now valid)

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "MT5Transaction_mt5AccountId_idx" ON "MT5Transaction"("mt5AccountId");
CREATE INDEX IF NOT EXISTS "MT5Transaction_userId_idx" ON "MT5Transaction"("userId");
CREATE INDEX IF NOT EXISTS "MT5Transaction_depositId_idx" ON "MT5Transaction"("depositId");
CREATE INDEX IF NOT EXISTS "MT5Transaction_withdrawalId_idx" ON "MT5Transaction"("withdrawalId");
CREATE INDEX IF NOT EXISTS "MT5Transaction_status_idx" ON "MT5Transaction"("status");
CREATE INDEX IF NOT EXISTS "MT5Transaction_type_idx" ON "MT5Transaction"("type");

