import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth';
import { AppError } from './error';
import { HTTP_STATUS } from '../types/utils';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        type: string;
      };
    }
  }
}

// Auth middleware to protect routes
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Authorization header is required', HTTP_STATUS.UNAUTHORIZED, 'MISSING_TOKEN');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError('Invalid authorization format. Use "Bearer <token>"', HTTP_STATUS.UNAUTHORIZED, 'INVALID_AUTH_FORMAT');
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      throw new AppError('Token is required', HTTP_STATUS.UNAUTHORIZED, 'MISSING_TOKEN');
    }

    // Verify token
    const decoded = verifyToken(token);

    if (decoded.type !== 'access') {
      throw new AppError('Invalid token type', HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      type: decoded.type
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Optional auth middleware (doesn't throw error if no token)
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify token
    const decoded = verifyToken(token);

    if (decoded.type === 'access') {
      req.user = {
        id: decoded.userId,
        type: decoded.type
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};