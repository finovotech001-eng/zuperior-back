// server/src/controllers/manualDeposit.controller.js

import { PrismaClient } from '@prisma/client';
import { depositMt5Balance } from '../services/mt5.service.js';

const prisma = new PrismaClient();

// Create a new manual deposit request
export const createManualDeposit = async (req, res) => {
    try {
        // Handle both FormData and JSON requests
        let mt5AccountId, amount, transactionHash, proofFileUrl;

        if (req.is('multipart/form-data')) {
            // Handle FormData (file upload)
            mt5AccountId = req.body.mt5AccountId;
            amount = req.body.amount;
            transactionHash = req.body.transactionHash;
            proofFileUrl = req.body.proofFileUrl;

            // Handle file upload if present
            if (req.file) {
                // Here you would typically upload the file to cloud storage
                // For now, we'll store a placeholder URL
                proofFileUrl = `https://storage.example.com/proof-files/${Date.now()}-${req.file.originalname}`;
                console.log('📁 File uploaded:', req.file.originalname);
            }
        } else {
            // Handle JSON request
            ({ mt5AccountId, amount, transactionHash, proofFileUrl } = req.body);
        }

        const userId = req.user.id;

        // Validate required fields
        if (!mt5AccountId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid fields: mt5AccountId, amount (must be > 0)'
            });
        }

        // Verify the MT5 account belongs to the authenticated user
        console.log('🔍 Looking up MT5 account:', { mt5AccountId, userId });
        const account = await prisma.MT5Account.findFirst({
            where: {
                accountId: mt5AccountId,
                userId: userId
            }
        });

        if (!account) {
            console.error('❌ MT5 account not found:', { mt5AccountId, userId });
            return res.status(404).json({
                success: false,
                message: 'MT5 account not found or access denied'
            });
        }

        console.log('✅ MT5 account verified:', account.id);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'MT5 account not found or access denied'
            });
        }

        // Create manual deposit record
        console.log('🔄 Creating manual deposit record for user:', userId);
        console.log('📊 Deposit data:', {
            userId,
            mt5AccountId,
            amount: parseFloat(amount),
            transactionHash,
            proofFileUrl,
            status: 'pending'
        });

        const manualDeposit = await prisma.ManualDeposit.create({
            data: {
                userId: userId,
                mt5AccountId: mt5AccountId,
                amount: parseFloat(amount),
                depositAddress: 'Twinxa7902309skjhfsdlhflksjdhlkLL',
                transactionHash: transactionHash || null,
                proofFileUrl: proofFileUrl || null,
                status: 'pending'
            }
        });

        console.log('✅ Manual deposit request created successfully:', manualDeposit.id);
        console.log('📋 Created deposit record:', manualDeposit);

        res.status(201).json({
            success: true,
            message: 'Manual deposit request created successfully',
            data: manualDeposit
        });

    } catch (error) {
        console.error('❌ Error creating manual deposit:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            meta: error.meta
        });

        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.code || 'UNKNOWN_ERROR'
        });
    }
};

// Get all manual deposits for a user
export const getUserManualDeposits = async (req, res) => {
    try {
        const userId = req.user.id;

        const manualDeposits = await prisma.ManualDeposit.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`✅ Retrieved ${manualDeposits.length} manual deposits for user`);

        res.json({
            success: true,
            message: 'Manual deposits retrieved successfully',
            data: manualDeposits
        });

    } catch (error) {
        console.error('Error fetching manual deposits:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Update manual deposit status (Admin only)
export const updateManualDepositStatus = async (req, res) => {
    try {
        const { depositId } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending, approved, or rejected'
            });
        }

        // Find the manual deposit
        const manualDeposit = await prisma.ManualDeposit.findUnique({
            where: { id: depositId }
        });

        if (!manualDeposit) {
            return res.status(404).json({
                success: false,
                message: 'Manual deposit not found'
            });
        }

        // Prepare update data
        const updateData = {
            status: status,
            updatedAt: new Date()
        };

        if (status === 'approved') {
            updateData.approvedAt = new Date();
        } else if (status === 'rejected') {
            updateData.rejectedAt = new Date();
            updateData.rejectionReason = rejectionReason || 'No reason provided';
        }

        // Update the manual deposit
        const updatedDeposit = await prisma.ManualDeposit.update({
            where: { id: depositId },
            data: updateData
        });

        // If approved, automatically deposit to MT5 account
        if (status === 'approved') {
            try {
                const mt5Response = await depositMt5Balance(
                    manualDeposit.mt5AccountId,
                    manualDeposit.amount,
                    `Manual deposit approved - ${manualDeposit.id}`
                );

                if (mt5Response.Success) {
                    console.log('✅ Manual deposit approved and MT5 balance updated');
                    
                    // Create MT5 transaction record
                    await prisma.MT5Transaction.create({
                        data: {
                            type: 'Deposit',
                            amount: manualDeposit.amount,
                            status: 'completed',
                            paymentMethod: 'manual',
                            transactionId: manualDeposit.transactionHash || manualDeposit.id,
                            comment: `Manual deposit - ${manualDeposit.id}`,
                            mt5AccountId: manualDeposit.mt5AccountId
                        }
                    });
                } else {
                    console.error('❌ Failed to update MT5 balance:', mt5Response.Message);
                }
            } catch (mt5Error) {
                console.error('❌ Error updating MT5 balance:', mt5Error);
            }
        }

        console.log(`✅ Manual deposit status updated to: ${status}`);

        res.json({
            success: true,
            message: `Manual deposit ${status} successfully`,
            data: updatedDeposit
        });

    } catch (error) {
        console.error('Error updating manual deposit status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Get all manual deposits (Admin only)
export const getAllManualDeposits = async (req, res) => {
    try {
        const manualDeposits = await prisma.ManualDeposit.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`✅ Retrieved ${manualDeposits.length} manual deposits for admin`);

        res.json({
            success: true,
            message: 'All manual deposits retrieved successfully',
            data: manualDeposits
        });

    } catch (error) {
        console.error('Error fetching all manual deposits:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
