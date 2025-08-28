import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createSuccessResponse, HTTP_STATUS } from '@atomic/shared';

const router = Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    res.status(HTTP_STATUS.OK).json(createSuccessResponse(healthInfo));
  } catch (error) {
    const errorInfo = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      uptime: process.uptime(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(createSuccessResponse(errorInfo));
  }
});

// Database health check
router.get('/db', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT NOW()`;
    const responseTime = Date.now() - startTime;

    const dbHealth = {
      status: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(createSuccessResponse(dbHealth));
  } catch (error) {
    const dbHealth = {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(createSuccessResponse(dbHealth));
  }
});

export default router;