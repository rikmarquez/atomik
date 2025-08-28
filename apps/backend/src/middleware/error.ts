import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, createErrorResponse } from '@atomic/shared';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND, 'ROUTE_NOT_FOUND');
  next(error);
};

// Global error handler
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle known AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  }
  
  // Handle Prisma errors
  else if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        statusCode = HTTP_STATUS.CONFLICT;
        code = 'DUPLICATE_ENTRY';
        message = 'A record with this information already exists';
        details = { field: prismaError.meta?.target?.[0] };
        break;
      case 'P2025':
        statusCode = HTTP_STATUS.NOT_FOUND;
        code = 'RECORD_NOT_FOUND';
        message = 'Record not found';
        break;
      default:
        statusCode = HTTP_STATUS.BAD_REQUEST;
        code = 'DATABASE_ERROR';
        message = 'Database operation failed';
    }
  }
  
  // Handle Zod validation errors
  else if (error.name === 'ZodError') {
    const zodError = error as any;
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = zodError.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }
  
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  }
  
  // Handle other known errors
  else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    code = 'DATABASE_CONNECTION_ERROR';
    message = 'Database connection failed';
  }

  // Log error for debugging
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Send error response
  const errorResponse = createErrorResponse(message, code, details);
  res.status(statusCode).json(errorResponse);
};