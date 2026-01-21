// Author: Florian Rischer
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import messageRoutes from './routes/message.routes';
import skillRoutes from './routes/skill.routes';
import imageRoutes from './routes/images.routes';
import { authenticateToken } from './middleware/auth.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

// Middleware
// Allow multiple frontend origins (development may use different ports)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/skills', authenticateToken, skillRoutes);
app.use('/api/images', authenticateToken, imageRoutes);

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be after routes)
// 1. Error handler first - catches errors thrown by routes
app.use(errorHandler);
// 2. 404 handler last - catches any unmatched routes
app.use(notFoundHandler);

export default app;
