import express from 'express';
import { getUser, getTransactions } from '../controllers/user.controller.js';
import { getDatabaseTransactions } from '../controllers/transactions.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/get-user', getUser);
router.post('/transactions/get', getTransactions);
router.get('/transactions/database', protect, getDatabaseTransactions);

export default router;
