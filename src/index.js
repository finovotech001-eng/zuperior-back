// zuperior-dashboard/server/src/index.js

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
// import authRoutes from './routes/auth.routes.js'; // Ensure this path is correct

// --- Configuration ---
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    // Allow the client (Next.js) to access the API
    origin: '*',
    credentials: true
}));

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images and PDFs only
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
        }
    }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make multer upload available globally
app.use((req, res, next) => {
    req.upload = upload;
    next();
});

// Middleware to handle multipart/form-data for auth routes
// app.use('/api/auth/register', upload.none()); // Removed - using JSON for auth

// --- Health Check Route ---
app.get('/', (req, res) => {
    res.status(200).send('Zuperior API is running!');
});

// --- Routes ---
// Authentication routes will be registered dynamically below

// --- Start Server ---
async function main() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully.');

        app.listen(PORT, async () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API URL: http://localhost:${PORT}/`);

            // Register Auth routes
            try {
                const authRoutes = await import('./routes/auth.routes.js');
                app.use('/api', authRoutes.default);
                console.log('Auth routes registered at /api/auth/*');
            } catch (error) {
                console.error('Failed to load Auth routes:', error.message);
            }

            // Register MT5 routes after server starts
            try {
                const mt5Routes = await import('./routes/mt5.routes.js');
                app.use('/api', mt5Routes.default);
                console.log('MT5 routes registered at /api/mt5/*');
            } catch (error) {
                console.error('Failed to load MT5 routes:', error.message);
            }

            // Register KYC routes
            try {
                const kycRoutes = await import('./routes/kyc.routes.js');
                app.use('/api', kycRoutes.default);
                console.log('KYC routes registered at /api/kyc/*');
            } catch (error) {
                console.error('Failed to load KYC routes:', error.message);
            }

            // Register Manual Deposit routes
            try {
                const manualDepositRoutes = await import('./routes/manualDeposit.routes.js');
                app.use('/api', manualDepositRoutes.default);
                console.log('Manual Deposit routes registered at /api/manual-deposit/*');
            } catch (error) {
                console.error('Failed to load Manual Deposit routes:', error.message);
            }

            // Register Admin routes
            try {
                const adminRoutes = await import('./routes/admin.routes.js');
                app.use('/api/admin', adminRoutes.default);
                console.log('Admin routes registered at /api/admin/*');
            } catch (error) {
                console.error('Failed to load Admin routes:', error.message);
            }
        });
    } catch (error) {
        console.error('Failed to start server or connect to database:', error);
        process.exit(1);
    }
}

main();