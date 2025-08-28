export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/api/v1/auth/login";
        readonly REGISTER: "/api/v1/auth/register";
        readonly REFRESH: "/api/v1/auth/refresh";
        readonly LOGOUT: "/api/v1/auth/logout";
        readonly PROFILE: "/api/v1/auth/profile";
    };
    readonly IDENTITY_AREAS: {
        readonly LIST: "/api/v1/identity-areas";
        readonly CREATE: "/api/v1/identity-areas";
        readonly UPDATE: (id: string) => string;
        readonly DELETE: (id: string) => string;
        readonly GET: (id: string) => string;
    };
    readonly SYSTEMS: {
        readonly LIST: "/api/v1/systems";
        readonly CREATE: "/api/v1/systems";
        readonly UPDATE: (id: string) => string;
        readonly DELETE: (id: string) => string;
        readonly GET: (id: string) => string;
        readonly EXECUTE: (id: string) => string;
    };
    readonly EXECUTIONS: {
        readonly LIST: "/api/v1/executions";
        readonly GET: (id: string) => string;
        readonly DELETE: (id: string) => string;
    };
    readonly HEALTH: "/api/v1/health";
};
export declare const LIMITS: {
    readonly FREE_PLAN: {
        readonly MAX_IDENTITY_AREAS: 1;
        readonly MAX_SYSTEMS: 2;
        readonly MAX_DAILY_EXECUTIONS: 10;
    };
    readonly PREMIUM_PLAN: {
        readonly MAX_IDENTITY_AREAS: 5;
        readonly MAX_SYSTEMS: 20;
        readonly MAX_DAILY_EXECUTIONS: 100;
    };
};
export declare const VALIDATION: {
    readonly PASSWORD: {
        readonly MIN_LENGTH: 8;
        readonly MAX_LENGTH: 100;
        readonly REQUIRE_UPPERCASE: true;
        readonly REQUIRE_LOWERCASE: true;
        readonly REQUIRE_NUMBER: true;
        readonly REQUIRE_SPECIAL_CHAR: false;
    };
    readonly NAME: {
        readonly MIN_LENGTH: 2;
        readonly MAX_LENGTH: 50;
    };
    readonly SYSTEM_NAME: {
        readonly MIN_LENGTH: 3;
        readonly MAX_LENGTH: 100;
    };
    readonly DESCRIPTION: {
        readonly MAX_LENGTH: 500;
    };
};
export declare const APP_CONFIG: {
    readonly NAME: "Atomic Systems";
    readonly VERSION: "0.1.0";
    readonly DESCRIPTION: "Personal development system based on Atomic Habits methodology";
    readonly COLORS: {
        readonly PRIMARY: readonly ["#3B82F6", "#1D4ED8", "#1E40AF"];
        readonly SUCCESS: readonly ["#10B981", "#059669", "#047857"];
        readonly WARNING: readonly ["#F59E0B", "#D97706", "#B45309"];
        readonly ERROR: readonly ["#EF4444", "#DC2626", "#B91C1C"];
        readonly NEUTRAL: readonly ["#6B7280", "#4B5563", "#374151"];
    };
    readonly BREAKPOINTS: {
        readonly SM: "640px";
        readonly MD: "768px";
        readonly LG: "1024px";
        readonly XL: "1280px";
    };
};
export declare const TIME: {
    readonly JWT_EXPIRES_IN: "7d";
    readonly REFRESH_TOKEN_EXPIRES_IN: "30d";
    readonly SESSION_TIMEOUT: number;
    readonly API_TIMEOUT: 30000;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
};
