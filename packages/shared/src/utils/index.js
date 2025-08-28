"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.pick = exports.omit = exports.chunk = exports.truncate = exports.capitalize = exports.isServerError = exports.isClientError = exports.isSuccessStatus = exports.createErrorResponse = exports.createSuccessResponse = exports.formatDateTime = exports.formatDate = exports.validateName = exports.validatePassword = exports.isValidEmail = void 0;
const constants_1 = require("../constants");
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
// Format date helpers
const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
exports.formatDateTime = formatDateTime;
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
// String utilities
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
const truncate = (str, length) => {
    return str.length > length ? str.substring(0, length) + '...' : str;
};
exports.truncate = truncate;
// Array utilities
const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};
exports.chunk = chunk;
// Object utilities
const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};
exports.omit = omit;
const pick = (obj, keys) => {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
};
exports.pick = pick;
// Delay utility for development/testing
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.delay = delay;
