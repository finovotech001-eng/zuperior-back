// Quick script to verify MT5Transaction table structure and data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMT5Transactions() {
    try {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔍 Verifying MT5Transaction Table');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        // Get all MT5Transactions
        const transactions = await prisma.MT5Transaction.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log(`📊 Found ${transactions.length} MT5Transaction records (showing last 5):`);
        console.log('');

        if (transactions.length === 0) {
            console.log('⚠️  NO MT5TRANSACTION RECORDS FOUND!');
            console.log('');
            console.log('This means:');
            console.log('1. No deposits have been created yet, OR');
            console.log('2. MT5Transaction records are not being created properly');
            console.log('');
            console.log('Try creating a manual deposit and watch the console logs!');
        } else {
            transactions.forEach((tx, index) => {
                console.log(`Transaction #${index + 1}:`);
                console.log('  ID:', tx.id);
                console.log('  Type:', tx.type);
                console.log('  Amount:', tx.amount);
                console.log('  Currency:', tx.currency);
                console.log('  Status:', tx.status);
                console.log('  Payment Method:', tx.paymentMethod);
                console.log('  Transaction ID:', tx.transactionId);
                console.log('  Deposit ID:', tx.depositId);
                console.log('  User ID:', tx.userId);
                console.log('  MT5 Account ID:', tx.mt5AccountId);
                console.log('  Processed By:', tx.processedBy || '(not yet)');
                console.log('  Processed At:', tx.processedAt || '(not yet)');
                console.log('  Created At:', tx.createdAt);
                console.log('  Updated At:', tx.updatedAt);
                console.log('  Comment:', tx.comment);
                console.log('');
            });
        }

        // Count by status
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📈 Statistics:');
        console.log('═══════════════════════════════════════════════════════════');
        
        const pending = await prisma.MT5Transaction.count({ where: { status: 'pending' } });
        const completed = await prisma.MT5Transaction.count({ where: { status: 'completed' } });
        const rejected = await prisma.MT5Transaction.count({ where: { status: 'rejected' } });
        const failed = await prisma.MT5Transaction.count({ where: { status: 'failed' } });
        const total = await prisma.MT5Transaction.count();

        console.log(`Total MT5Transactions: ${total}`);
        console.log(`  - Pending: ${pending}`);
        console.log(`  - Completed: ${completed}`);
        console.log(`  - Rejected: ${rejected}`);
        console.log(`  - Failed: ${failed}`);
        console.log('');

        // Check for deposits without MT5Transaction
        const deposits = await prisma.Deposit.findMany({
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });

        const depositsWithoutMT5Tx = await prisma.$queryRaw`
            SELECT d.id, d.amount, d.status, d."createdAt"
            FROM "Deposit" d
            LEFT JOIN "MT5Transaction" mt5 ON mt5."depositId" = d.id
            WHERE mt5.id IS NULL
            LIMIT 10
        `;

        if (depositsWithoutMT5Tx.length > 0) {
            console.log('⚠️  WARNING: Found deposits WITHOUT MT5Transaction records:');
            console.log(depositsWithoutMT5Tx);
            console.log('');
            console.log('These deposits were created before the MT5Transaction tracking was added.');
        } else {
            console.log('✅ All deposits have corresponding MT5Transaction records!');
        }

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('✅ Verification Complete!');
        console.log('═══════════════════════════════════════════════════════════');

    } catch (error) {
        console.error('❌ Error verifying MT5Transactions:', error);
        console.error('Error details:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyMT5Transactions();

