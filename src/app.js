// server/src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Import Routes
import authRoutes from './routes/auth.routes.js';
import mt5Routes from './routes/mt5.routes.js';
import kycRoutes from './routes/kyc.routes.js';
import manualDepositRoutes from './routes/manualDeposit.routes.js';
import adminRoutes from './routes/admin.routes.js';
// ... import other routes (txRoutes, userRoutes)

// Middleware
app.use(cors({
  origin: "*", // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
})); // CORS configured to allow all origins
app.use(express.json());

// Routes
// Note: Use /v1/ or /api/ for your endpoint prefix to match your Next.js proxy pattern
app.use('/api', authRoutes);
app.use('/api', mt5Routes);
app.use('/api', kycRoutes);
app.use('/api', manualDepositRoutes);
app.use('/api', adminRoutes);
// app.use('/api', txRoutes);
// app.use('/api', userRoutes);

// Simple health check
app.get('/', (req, res) => res.status(200).send('ZuperiorCRM Backend Running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Auth routes registered at /api/auth/*');
    console.log('MT5 routes registered at /api/mt5/*');
    console.log('KYC routes registered at /api/kyc/*');
    console.log('Manual Deposit routes registered at /api/manual-deposit/*');
    console.log('Admin routes registered at /api/admin/*');
});