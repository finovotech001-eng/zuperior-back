import prisma from '../services/db.service.js';

// Create a new payment method for the user
export const createPaymentMethod = async (req, res) => {
  try {
    const { address, currency, network } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    if (!address) {
      return res.status(400).json({
        status: 'Error',
        message: 'Wallet address is required'
      });
    }

    // No validation on address format

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        address,
        currency: currency || 'USDT',
        network: network || 'TRC20',
        status: 'pending'
      }
    });

    return res.status(201).json({
      status: 'Success',
      message: 'Payment method submitted for approval',
      data: paymentMethod
    });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's payment methods
export const getUserPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      status: 'Success',
      data: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get all payment methods
export const getAllPaymentMethods = async (req, res) => {
  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const paymentMethods = await prisma.paymentMethod.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      status: 'Success',
      data: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Approve payment method
export const approvePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: adminId
      }
    });

    return res.status(200).json({
      status: 'Success',
      message: 'Payment method approved',
      data: paymentMethod
    });
  } catch (error) {
    console.error('Error approving payment method:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Reject payment method
export const rejectPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        approvedBy: adminId
      }
    });

    return res.status(200).json({
      status: 'Success',
      message: 'Payment method rejected',
      data: paymentMethod
    });
  } catch (error) {
    console.error('Error rejecting payment method:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      error: error.message
    });
  }
};