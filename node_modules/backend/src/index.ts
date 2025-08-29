import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler, notFound } from './middleware/error';
import { validateEnv } from './utils/validation';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import identityAreasRoutes from './routes/identityAreas';
import atomicSystemsRoutes from './routes/atomicSystems';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration - simplified and more permissive
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
console.log('🌐 CORS Origins:', corsOrigins); // Debug CORS

// Enable CORS for all routes - BEFORE everything else
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🌐 Request:', req.method, req.url, 'from:', origin);
  
  // Always set CORS headers for allowed origins
  if (origin && corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    console.log('✅ CORS headers set for:', origin);
  } else {
    console.log('❌ Origin not allowed:', origin, 'Allowed:', corsOrigins);
  }
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    console.log('🔍 CORS Preflight for:', req.url, 'from:', origin, '-> Allowed');
    res.header('Content-Length', '0');
    return res.status(200).end();
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/identity-areas', identityAreasRoutes);
app.use('/api/v1/atomic-systems', atomicSystemsRoutes);

// API documentation (development only)
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_API_DOCS === 'true') {
  app.get('/api/v1/docs', (req, res) => {
    res.json({
      message: 'Atomic Systems API Documentation',
      version: '1.0.0',
      endpoints: {
        health: {
          'GET /api/v1/health': 'Check API health status'
        },
        auth: {
          'POST /api/v1/auth/register': 'Register new user',
          'POST /api/v1/auth/login': 'Login user',
          'POST /api/v1/auth/refresh': 'Refresh access token',
          'POST /api/v1/auth/logout': 'Logout user',
          'GET /api/v1/auth/profile': 'Get user profile (protected)'
        }
      }
    });
  });
}

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Atomic Systems API running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️ Database: Connected to PostgreSQL`);
    console.log(`🔄 CORS Debug - Origins: ${JSON.stringify(corsOrigins)}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📖 API Docs: http://localhost:${PORT}/api/v1/docs`);
    }
  });
}

export default app;