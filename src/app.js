// server/src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Import Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const mt5Routes = require('./routes/mt5.routes');
// ... import other routes (txRoutes, kycRoutes)

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
app.use('/api', userRoutes);
app.use('/api', mt5Routes);
// app.use('/api', txRoutes);
// app.use('/api', kycRoutes);

// Simple health check
app.get('/', (req, res) => res.status(200).send('ZuperiorCRM Backend Running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('MT5 routes registered at /api/mt5/*');
});