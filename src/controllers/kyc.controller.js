// server/src/controllers/kyc.controller.js

import prisma from '../services/db.service.js';

// 1. Create initial KYC record for user
export const createKycRecord = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if KYC record already exists
        const existingKyc = await prisma.KYC.findUnique({
            where: { userId }
        });

        if (existingKyc) {
            return res.json({
                success: true,
                message: 'KYC record already exists',
                data: existingKyc
            });
        }

        // Create new KYC record
        const kyc = await prisma.KYC.create({
            data: {
                userId,
                verificationStatus: 'Pending'
            }
        });

        res.json({
            success: true,
            message: 'KYC record created successfully',
            data: kyc
        });
    } catch (error) {
        console.error('Error creating KYC record:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// 2. Update document verification status
export const updateDocumentStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentReference, isDocumentVerified, amlReference } = req.body;

        if (!documentReference) {
            return res.status(400).json({
                success: false,
                message: 'Document reference is required'
            });
        }

        // Find or create KYC record
        let kyc = await prisma.KYC.findUnique({
            where: { userId }
        });

        if (!kyc) {
            kyc = await prisma.KYC.create({
                data: {
                    userId,
                    documentReference,
                    isDocumentVerified: isDocumentVerified || false,
                    amlReference: amlReference || null,
                    documentSubmittedAt: new Date(),
                    verificationStatus: isDocumentVerified ? 'Partially Verified' : 'Pending'
                }
            });
        } else {
            // Determine verification status
            let newStatus = 'Pending';
            if (!isDocumentVerified) {
                newStatus = 'Declined';
            } else if (kyc.isAddressVerified && isDocumentVerified) {
                newStatus = 'Verified';
            } else if (isDocumentVerified) {
                newStatus = 'Partially Verified';
            }

            kyc = await prisma.KYC.update({
                where: { userId },
                data: {
                    documentReference,
                    isDocumentVerified: isDocumentVerified || false,
                    amlReference: amlReference || null,
                    documentSubmittedAt: new Date(),
                    verificationStatus: newStatus
                }
            });
        }

        console.log('✅ Document verification status updated:', {
            userId,
            documentReference,
            isDocumentVerified,
            verificationStatus: kyc.verificationStatus
        });

        res.json({
            success: true,
            message: 'Document verification status updated',
            data: kyc
        });
    } catch (error) {
        console.error('Error updating document status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// 3. Update address verification status
export const updateAddressStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressReference, isAddressVerified } = req.body;

        if (!addressReference) {
            return res.status(400).json({
                success: false,
                message: 'Address reference is required'
            });
        }

        // Find or create KYC record
        let kyc = await prisma.KYC.findUnique({
            where: { userId }
        });

        if (!kyc) {
            kyc = await prisma.KYC.create({
                data: {
                    userId,
                    addressReference,
                    isAddressVerified: isAddressVerified || false,
                    addressSubmittedAt: new Date(),
                    verificationStatus: isAddressVerified ? 'Partially Verified' : 'Pending'
                }
            });
        } else {
            // Determine verification status
            let newStatus = 'Pending';
            if (!isAddressVerified) {
                newStatus = 'Declined';
            } else if (kyc.isDocumentVerified && isAddressVerified) {
                newStatus = 'Verified';
            } else if (isAddressVerified) {
                newStatus = 'Partially Verified';
            }

            kyc = await prisma.KYC.update({
                where: { userId },
                data: {
                    addressReference,
                    isAddressVerified: isAddressVerified || false,
                    addressSubmittedAt: new Date(),
                    verificationStatus: newStatus
                }
            });
        }

        console.log('✅ Address verification status updated:', {
            userId,
            addressReference,
            isAddressVerified,
            verificationStatus: kyc.verificationStatus
        });

        res.json({
            success: true,
            message: 'Address verification status updated',
            data: kyc
        });
    } catch (error) {
        console.error('Error updating address status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// 4. Get user's KYC status
export const getKycStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const kyc = await prisma.KYC.findUnique({
            where: { userId }
        });

        if (!kyc) {
            return res.json({
                success: true,
                message: 'No KYC record found',
                data: {
                    isDocumentVerified: false,
                    isAddressVerified: false,
                    verificationStatus: 'Pending'
                }
            });
        }

        res.json({
            success: true,
            message: 'KYC status retrieved successfully',
            data: kyc
        });
    } catch (error) {
        console.error('Error fetching KYC status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// 5. Webhook handler for Shufti Pro callbacks
export const handleCallback = async (req, res) => {
    try {
        const payload = req.body;
        
        console.log('🔔 Shufti Pro Webhook received:', {
            reference: payload.reference,
            event: payload.event,
            timestamp: new Date().toISOString()
        });

        // Extract reference and event type
        const { reference, event, verification_result } = payload;

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: 'Reference is required'
            });
        }

        // Find KYC record by reference (document or address)
        const kyc = await prisma.KYC.findFirst({
            where: {
                OR: [
                    { documentReference: reference },
                    { addressReference: reference }
                ]
            }
        });

        if (!kyc) {
            console.log('⚠️ No KYC record found for reference:', reference);
            return res.status(404).json({
                success: false,
                message: 'KYC record not found'
            });
        }

        // Update KYC status based on event
        const isAccepted = event === 'verification.accepted';
        const isDeclined = event === 'verification.declined';

        let updateData = {};

        // Determine if this is document or address verification
        if (kyc.documentReference === reference) {
            updateData.isDocumentVerified = isAccepted;
            if (isDeclined && verification_result?.document?.declined_reason) {
                updateData.rejectionReason = verification_result.document.declined_reason;
            }
        } else if (kyc.addressReference === reference) {
            updateData.isAddressVerified = isAccepted;
            if (isDeclined && verification_result?.address?.declined_reason) {
                updateData.rejectionReason = verification_result.address.declined_reason;
            }
        }

        // Update verification status
        const updatedKyc = await prisma.KYC.update({
            where: { id: kyc.id },
            data: {
                ...updateData,
                verificationStatus: 
                    (kyc.isDocumentVerified || updateData.isDocumentVerified) && 
                    (kyc.isAddressVerified || updateData.isAddressVerified)
                        ? 'Verified'
                        : (updateData.isDocumentVerified || updateData.isAddressVerified)
                            ? 'Partially Verified'
                            : 'Pending'
            }
        });

        console.log('✅ KYC record updated via webhook:', {
            reference,
            event,
            verificationStatus: updatedKyc.verificationStatus
        });

        // TODO: Send email notification to user

        res.json({
            success: true,
            message: 'Callback processed successfully'
        });
    } catch (error) {
        console.error('Error processing callback:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

