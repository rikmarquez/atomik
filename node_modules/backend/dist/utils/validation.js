"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const zod_1 = require("zod");
// Environment variables schema
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('3001'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('30d'),
    BCRYPT_SALT_ROUNDS: zod_1.z.string().transform(Number).default('12'),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:3000'),
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    LOG_LEVEL: zod_1.z.string().default('info'),
    ENABLE_API_DOCS: zod_1.z.string().transform(val => val === 'true').default('false'),
});
const validateEnv = () => {
    try {
        envSchema.parse(process.env);
        console.log('✅ Environment variables validated successfully');
    }
    catch (error) {
        console.error('❌ Environment validation failed:');
        if (error instanceof zod_1.z.ZodError) {
            error.errors.forEach(err => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
        }
        console.error('\n💡 Please check your .env file and ensure all required variables are set');
        process.exit(1);
    }
};
exports.validateEnv = validateEnv;
