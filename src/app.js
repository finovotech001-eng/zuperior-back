// server/src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();
const app = express();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Import Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const mt5Routes = require('./routes/mt5.routes');
const depositRoutes = require('./routes/deposit.routes');
const adminRoutes = require('./routes/admin.routes');
const kycRoutes = require('./routes/kyc.routes');
// ... import other routes (txRoutes, kycRoutes)

// Middleware
app.use(cors({
  origin: "*", // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
})); // CORS configured to allow all origins
app.use(express.json());

// Add multer upload to request object for routes that need it
app.use('/api/deposit/create', (req, res, next) => {
  upload.single('proofFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
});

// Routes
// Note: Use /v1/ or /api/ for your endpoint prefix to match your Next.js proxy pattern
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', mt5Routes);
app.use('/api', depositRoutes);
app.use('/api', adminRoutes);
app.use('/api', kycRoutes);
// app.use('/api', txRoutes);

// Simple health check
app.get('/', (req, res) => res.status(200).send('ZuperiorCRM Backend Running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('MT5 routes registered at /api/mt5/*');
});