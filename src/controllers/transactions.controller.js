// zuperior-back/src/controllers/transactions.controller.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch transactions from database tables (MT5Transaction, Deposit, Withdrawal) for a user
export const getDatabaseTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId, startDate, endDate } = req.query;

    console.log('🔍 [getDatabaseTransactions] Request params:', { userId, accountId, startDate, endDate });

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required'
      });
    }

    // Verify the MT5 account belongs to the authenticated user
    const account = await prisma.MT5Account.findFirst({
      where: {
        accountId: accountId,
        userId: userId
      }
    });

    console.log('📊 [getDatabaseTransactions] Found MT5 account:', account ? { id: account.id, accountId: account.accountId } : 'NOT FOUND');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'MT5 account not found or access denied'
      });
    }

    // Build where clause for date range
    const where = {
      userId: userId,
      mt5AccountId: account.id
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Fetch from MT5Transaction
    const mt5Transactions = await prisma.MT5Transaction.findMany({
      where: where,
      orderBy: { createdAt: 'desc' }
    });

    console.log('💳 [getDatabaseTransactions] Found MT5Transactions:', mt5Transactions.length);

    // Fetch from Deposit
    const deposits = await prisma.Deposit.findMany({
      where: {
        userId: userId,
        mt5AccountId: account.id,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch from Withdrawal
    const withdrawals = await prisma.Withdrawal.findMany({
      where: {
        userId: userId,
        mt5AccountId: account.id,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map data to expected format
    const depositsData = deposits.map(d => ({
      depositID: d.id,
      login: accountId,
      open_time: d.createdAt,
      profit: d.amount,
      amount: d.amount,
      comment: d.method + ' deposit - ' + d.id,
      type: 'Deposit',
      status: d.status,
      account_id: accountId
    }));

    const withdrawalsData = withdrawals.map(w => ({
      depositID: w.id,
      login: accountId,
      open_time: w.createdAt,
      profit: -w.amount,
      amount: w.amount,
      comment: w.method + ' withdrawal - ' + w.id,
      type: 'Withdrawal',
      status: w.status,
      account_id: accountId
    }));

    const mt5TransactionsData = mt5Transactions.map(t => ({
      depositID: t.depositId || t.id,
      login: accountId,
      open_time: t.createdAt,
      profit: t.type === 'Deposit' ? t.amount : -t.amount,
      amount: t.amount,
      comment: t.comment || t.type + ' - ' + t.id,
      type: t.type,
      status: t.status,
      account_id: accountId
    }));

    console.log('💰 [getDatabaseTransactions] Found Deposits:', deposits.length);
    console.log('💸 [getDatabaseTransactions] Found Withdrawals:', withdrawals.length);

    // Combine all data
    const allTransactions = [...depositsData, ...withdrawalsData, ...mt5TransactionsData];

    // Sort by open_time descending
    allTransactions.sort((a, b) => new Date(b.open_time).getTime() - new Date(a.open_time).getTime());

    console.log('✅ [getDatabaseTransactions] Returning total transactions:', allTransactions.length);

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        deposits: depositsData,
        withdrawals: withdrawalsData,
        mt5Transactions: mt5TransactionsData,
        bonuses: [], // No bonuses from database
        status: 'Success',
        MT5_account: accountId
      }
    });

  } catch (error) {
    console.error('❌ [getDatabaseTransactions] Error:', error);
    console.error('❌ [getDatabaseTransactions] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};