"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const error_1 = require("./middleware/error");
const validation_1 = require("./utils/validation");
const health_1 = __importDefault(require("./routes/health"));
const auth_1 = __importDefault(require("./routes/auth"));
const identityAreas_1 = __importDefault(require("./routes/identityAreas"));
const atomicSystems_1 = __importDefault(require("./routes/atomicSystems"));
// Load environment variables
dotenv_1.default.config();
// Validate environment variables
(0, validation_1.validateEnv)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
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
// Enable CORS for all routes
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && corsOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('🔍 CORS Preflight for:', req.url, 'from:', origin);
        return res.status(200).end();
    }
    next();
});
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
// API Routes
app.use('/api/v1/health', health_1.default);
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/identity-areas', identityAreas_1.default);
app.use('/api/v1/atomic-systems', atomicSystems_1.default);
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
app.use(error_1.notFound);
// Global error handler
app.use(error_1.errorHandler);
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
exports.default = app;
