"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const utils_1 = require("../types/utils");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Health check endpoint
router.get('/', async (req, res) => {
    try {
        // Check database connection
        await prisma.$queryRaw `SELECT 1`;
        const healthInfo = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '0.1.0',
            environment: process.env.NODE_ENV || 'development',
            database: 'connected',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
        res.status(utils_1.HTTP_STATUS.OK).json((0, utils_1.createSuccessResponse)(healthInfo));
    }
    catch (error) {
        const errorInfo = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '0.1.0',
            environment: process.env.NODE_ENV || 'development',
            database: 'disconnected',
            uptime: process.uptime(),
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(utils_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, utils_1.createSuccessResponse)(errorInfo));
    }
});
// Database health check
router.get('/db', async (req, res) => {
    try {
        const startTime = Date.now();
        await prisma.$queryRaw `SELECT NOW()`;
        const responseTime = Date.now() - startTime;
        const dbHealth = {
            status: 'connected',
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
        };
        res.status(utils_1.HTTP_STATUS.OK).json((0, utils_1.createSuccessResponse)(dbHealth));
    }
    catch (error) {
        const dbHealth = {
            status: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown database error',
            timestamp: new Date().toISOString(),
        };
        res.status(utils_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, utils_1.createSuccessResponse)(dbHealth));
    }
});
exports.default = router;
