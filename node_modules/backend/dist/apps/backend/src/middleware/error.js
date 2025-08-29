"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = exports.AppError = void 0;
const utils_1 = require("../types/utils");
// Custom error class
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode = utils_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// 404 handler
const notFound = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, utils_1.HTTP_STATUS.NOT_FOUND, 'ROUTE_NOT_FOUND');
    next(error);
};
exports.notFound = notFound;
// Global error handler
const errorHandler = (error, req, res, next) => {
    let statusCode = utils_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details = undefined;
    // Handle known AppError instances
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        code = error.code;
        message = error.message;
    }
    // Handle Prisma errors
    else if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error;
        switch (prismaError.code) {
            case 'P2002':
                statusCode = utils_1.HTTP_STATUS.CONFLICT;
                code = 'DUPLICATE_ENTRY';
                message = 'A record with this information already exists';
                details = { field: prismaError.meta?.target?.[0] };
                break;
            case 'P2025':
                statusCode = utils_1.HTTP_STATUS.NOT_FOUND;
                code = 'RECORD_NOT_FOUND';
                message = 'Record not found';
                break;
            default:
                statusCode = utils_1.HTTP_STATUS.BAD_REQUEST;
                code = 'DATABASE_ERROR';
                message = 'Database operation failed';
        }
    }
    // Handle Zod validation errors
    else if (error.name === 'ZodError') {
        const zodError = error;
        statusCode = utils_1.HTTP_STATUS.BAD_REQUEST;
        code = 'VALIDATION_ERROR';
        message = 'Validation failed';
        details = zodError.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
        statusCode = utils_1.HTTP_STATUS.UNAUTHORIZED;
        code = 'INVALID_TOKEN';
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = utils_1.HTTP_STATUS.UNAUTHORIZED;
        code = 'TOKEN_EXPIRED';
        message = 'Token has expired';
    }
    // Handle other known errors
    else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        statusCode = utils_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
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
    const errorResponse = (0, utils_1.createErrorResponse)(message, code, details);
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
