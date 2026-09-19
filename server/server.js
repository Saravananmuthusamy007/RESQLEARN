import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Level from './models/Level.js';
import { runSeed } from './seed/seedRunner.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl, Postman) or any localhost / 127.0.0.1 port
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger (Development)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'ResqLearn Emergency Medical Training API',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/learning-partner', aiRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    // Never expose stack trace in production or sensitive credentials
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server & Check Seed Data
async function startServer() {
  try {
    const conn = await connectDB();
    if (conn) {
      const levelCount = await Level.countDocuments();
      if (levelCount === 0) {
        console.log('[Notice]: No levels found in database. Automatically running initial clinical seed...');
        await runSeed();
      }
    }

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  RESQLEARN CLINICAL BACKEND RUNNING ON PORT ${PORT}  `);
      console.log(`  Health check: http://localhost:${PORT}/api/health     `);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
  }
}

startServer();

export default app;
