"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.isServerError = exports.isClientError = exports.isSuccessStatus = exports.createErrorResponse = exports.createSuccessResponse = exports.validateName = exports.validatePassword = exports.isValidEmail = void 0;
const constants_1 = require("./constants");
Object.defineProperty(exports, "HTTP_STATUS", { enumerable: true, get: function () { return constants_1.HTTP_STATUS; } });
// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
// Password validation
const validatePassword = (password) => {
    const errors = [];
    if (password.length < constants_1.VALIDATION.PASSWORD.MIN_LENGTH) {
        errors.push(`Password must be at least ${constants_1.VALIDATION.PASSWORD.MIN_LENGTH} characters long`);
    }
    if (password.length > constants_1.VALIDATION.PASSWORD.MAX_LENGTH) {
        errors.push(`Password must be no more than ${constants_1.VALIDATION.PASSWORD.MAX_LENGTH} characters long`);
    }
    if (constants_1.VALIDATION.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (constants_1.VALIDATION.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (constants_1.VALIDATION.PASSWORD.REQUIRE_NUMBER && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (constants_1.VALIDATION.PASSWORD.REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validatePassword = validatePassword;
// Name validation
const validateName = (name) => {
    if (name.length < constants_1.VALIDATION.NAME.MIN_LENGTH) {
        return {
            isValid: false,
            error: `Name must be at least ${constants_1.VALIDATION.NAME.MIN_LENGTH} characters long`
        };
    }
    if (name.length > constants_1.VALIDATION.NAME.MAX_LENGTH) {
        return {
            isValid: false,
            error: `Name must be no more than ${constants_1.VALIDATION.NAME.MAX_LENGTH} characters long`
        };
    }
    return { isValid: true };
};
exports.validateName = validateName;
// API response helpers
const createSuccessResponse = (data, message) => ({
    success: true,
    data,
    message
});
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (error, code, details) => ({
    success: false,
    error,
    code: code || 'UNKNOWN_ERROR',
    details
});
exports.createErrorResponse = createErrorResponse;
// HTTP status helpers
const isSuccessStatus = (status) => {
    return status >= 200 && status < 300;
};
exports.isSuccessStatus = isSuccessStatus;
const isClientError = (status) => {
    return status >= 400 && status < 500;
};
exports.isClientError = isClientError;
const isServerError = (status) => {
    return status >= 500;
};
exports.isServerError = isServerError;
