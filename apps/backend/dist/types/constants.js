"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.TIME = exports.APP_CONFIG = exports.VALIDATION = exports.LIMITS = exports.API_ENDPOINTS = void 0;
// API Configuration
exports.API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/v1/auth/login',
        REGISTER: '/api/v1/auth/register',
        REFRESH: '/api/v1/auth/refresh',
        LOGOUT: '/api/v1/auth/logout',
        PROFILE: '/api/v1/auth/profile'
    },
    IDENTITY_AREAS: {
        LIST: '/api/v1/identity-areas',
        CREATE: '/api/v1/identity-areas',
        UPDATE: (id) => `/api/v1/identity-areas/${id}`,
        DELETE: (id) => `/api/v1/identity-areas/${id}`,
        GET: (id) => `/api/v1/identity-areas/${id}`
    },
    SYSTEMS: {
        LIST: '/api/v1/systems',
        CREATE: '/api/v1/systems',
        UPDATE: (id) => `/api/v1/systems/${id}`,
        DELETE: (id) => `/api/v1/systems/${id}`,
        GET: (id) => `/api/v1/systems/${id}`,
        EXECUTE: (id) => `/api/v1/systems/${id}/execute`
    },
    EXECUTIONS: {
        LIST: '/api/v1/executions',
        GET: (id) => `/api/v1/executions/${id}`,
        DELETE: (id) => `/api/v1/executions/${id}`
    },
    HEALTH: '/api/v1/health'
};
// Business Rules
exports.LIMITS = {
    FREE_PLAN: {
        MAX_IDENTITY_AREAS: 1,
        MAX_SYSTEMS: 2,
        MAX_DAILY_EXECUTIONS: 10
    },
    PREMIUM_PLAN: {
        MAX_IDENTITY_AREAS: 5,
        MAX_SYSTEMS: 20,
        MAX_DAILY_EXECUTIONS: 100
    }
};
// Validation Rules
exports.VALIDATION = {
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 100,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL_CHAR: false
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50
    },
    SYSTEM_NAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 100
    },
    DESCRIPTION: {
        MAX_LENGTH: 500
    }
};
// App Configuration
exports.APP_CONFIG = {
    NAME: 'Atomic Systems',
    VERSION: '0.1.0',
    DESCRIPTION: 'Personal development system based on Atomic Habits methodology',
    COLORS: {
        PRIMARY: ['#3B82F6', '#1D4ED8', '#1E40AF'],
        SUCCESS: ['#10B981', '#059669', '#047857'],
        WARNING: ['#F59E0B', '#D97706', '#B45309'],
        ERROR: ['#EF4444', '#DC2626', '#B91C1C'],
        NEUTRAL: ['#6B7280', '#4B5563', '#374151']
    },
    BREAKPOINTS: {
        SM: '640px',
        MD: '768px',
        LG: '1024px',
        XL: '1280px'
    }
};
// Time constants
exports.TIME = {
    JWT_EXPIRES_IN: '7d',
    REFRESH_TOKEN_EXPIRES_IN: '30d',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in ms
    API_TIMEOUT: 30000 // 30 seconds
};
// HTTP Status Codes
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
};
