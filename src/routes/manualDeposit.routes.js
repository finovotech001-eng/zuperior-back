// server/src/routes/manualDeposit.routes.js

import express from 'express';
import * as manualDepositController from '../controllers/manualDeposit.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes (require authentication)
// Use multer for file uploads on create endpoint
router.post('/manual-deposit/create', protect, (req, res, next) => {
    // Use multer middleware for file uploads
    req.upload.single('proofFile')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error'
            });
        }
        next();
    });
}, manualDepositController.createManualDeposit);
router.get('/manual-deposit/user', protect, manualDepositController.getUserManualDeposits);

// Admin routes (require authentication + admin check)
router.get('/manual-deposit/all', protect, manualDepositController.getAllManualDeposits);
router.put('/manual-deposit/:depositId/status', protect, manualDepositController.updateManualDepositStatus);

export default router;
