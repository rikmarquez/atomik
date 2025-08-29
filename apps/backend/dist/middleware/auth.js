"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const auth_1 = require("../services/auth");
const error_1 = require("./error");
const utils_1 = require("../types/utils");
// Auth middleware to protect routes
const authMiddleware = (req, res, next) => {
    try {
        // Skip authentication for OPTIONS requests (CORS preflight)
        if (req.method === 'OPTIONS') {
            return next();
        }
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new error_1.AppError('Authorization header is required', utils_1.HTTP_STATUS.UNAUTHORIZED, 'MISSING_TOKEN');
        }
        if (!authHeader.startsWith('Bearer ')) {
            throw new error_1.AppError('Invalid authorization format. Use "Bearer <token>"', utils_1.HTTP_STATUS.UNAUTHORIZED, 'INVALID_AUTH_FORMAT');
        }
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        if (!token) {
            throw new error_1.AppError('Token is required', utils_1.HTTP_STATUS.UNAUTHORIZED, 'MISSING_TOKEN');
        }
        // Verify token
        const decoded = (0, auth_1.verifyToken)(token);
        if (decoded.type !== 'access') {
            throw new error_1.AppError('Invalid token type', utils_1.HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
        }
        // Attach user info to request
        req.user = {
            id: decoded.userId,
            type: decoded.type
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
// Optional auth middleware (doesn't throw error if no token)
const optionalAuthMiddleware = (req, res, next) => {
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
        const decoded = (0, auth_1.verifyToken)(token);
        if (decoded.type === 'access') {
            req.user = {
                id: decoded.userId,
                type: decoded.type
            };
        }
        next();
    }
    catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
