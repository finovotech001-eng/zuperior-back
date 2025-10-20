-- CreateTable
CREATE TABLE "MT5Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'MT5',
    "leverage" INTEGER NOT NULL DEFAULT 100,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "margin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginFree" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "groupName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MT5Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MT5Transaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "comment" TEXT,
    "mt5AccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MT5Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MT5Account_accountId_key" ON "MT5Account"("accountId");

-- AddForeignKey
ALTER TABLE "MT5Account" ADD CONSTRAINT "MT5Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MT5Transaction" ADD CONSTRAINT "MT5Transaction_mt5AccountId_fkey" FOREIGN KEY ("mt5AccountId") REFERENCES "MT5Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
