"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserById = exports.logoutUser = exports.refreshAccessToken = exports.loginUser = exports.registerUser = exports.comparePassword = exports.hashPassword = exports.verifyToken = exports.generateTokens = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const shared_1 = require("@atomic/shared");
const error_1 = require("../middleware/error");
const shared_2 = require("@atomic/shared");
const prisma = new client_1.PrismaClient();
// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
// Generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId, type: 'access' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
// Verify JWT token
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return { userId: decoded.userId, type: decoded.type };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new error_1.AppError('Token has expired', shared_2.HTTP_STATUS.UNAUTHORIZED, 'TOKEN_EXPIRED');
        }
        throw new error_1.AppError('Invalid token', shared_2.HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
    }
};
exports.verifyToken = verifyToken;
// Hash password
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, BCRYPT_SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
// Compare password
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
// Register new user
const registerUser = async (credentials) => {
    const { email, password, name } = credentials;
    // Validate input
    if (!(0, shared_1.isValidEmail)(email)) {
        throw new error_1.AppError('Invalid email format', shared_2.HTTP_STATUS.BAD_REQUEST, 'INVALID_EMAIL');
    }
    const passwordValidation = (0, shared_1.validatePassword)(password);
    if (!passwordValidation.isValid) {
        throw new error_1.AppError(passwordValidation.errors[0], shared_2.HTTP_STATUS.BAD_REQUEST, 'WEAK_PASSWORD');
    }
    const nameValidation = (0, shared_1.validateName)(name);
    if (!nameValidation.isValid) {
        throw new error_1.AppError(nameValidation.error, shared_2.HTTP_STATUS.BAD_REQUEST, 'INVALID_NAME');
    }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });
    if (existingUser) {
        throw new error_1.AppError('User already exists with this email', shared_2.HTTP_STATUS.CONFLICT, 'USER_EXISTS');
    }
    // Hash password
    const hashedPassword = await (0, exports.hashPassword)(password);
    // Create user
    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            name: name.trim(),
            password: hashedPassword,
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    // Generate tokens
    const tokens = (0, exports.generateTokens)(user.id);
    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    await prisma.refreshToken.create({
        data: {
            token: tokens.refreshToken,
            userId: user.id,
            expiresAt,
        }
    });
    return { user: user, tokens };
};
exports.registerUser = registerUser;
// Login user
const loginUser = async (credentials) => {
    const { email, password } = credentials;
    // Validate input
    if (!(0, shared_1.isValidEmail)(email)) {
        throw new error_1.AppError('Invalid email format', shared_2.HTTP_STATUS.BAD_REQUEST, 'INVALID_EMAIL');
    }
    if (!password) {
        throw new error_1.AppError('Password is required', shared_2.HTTP_STATUS.BAD_REQUEST, 'PASSWORD_REQUIRED');
    }
    // Find user
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });
    if (!user) {
        throw new error_1.AppError('Invalid email or password', shared_2.HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }
    if (!user.isActive) {
        throw new error_1.AppError('Account is deactivated', shared_2.HTTP_STATUS.UNAUTHORIZED, 'ACCOUNT_DEACTIVATED');
    }
    // Verify password
    const isPasswordValid = await (0, exports.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new error_1.AppError('Invalid email or password', shared_2.HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }
    // Generate tokens
    const tokens = (0, exports.generateTokens)(user.id);
    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    await prisma.refreshToken.create({
        data: {
            token: tokens.refreshToken,
            userId: user.id,
            expiresAt,
        }
    });
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
};
exports.loginUser = loginUser;
// Refresh access token
const refreshAccessToken = async (refreshToken) => {
    // Verify refresh token
    const { userId, type } = (0, exports.verifyToken)(refreshToken);
    if (type !== 'refresh') {
        throw new error_1.AppError('Invalid token type', shared_2.HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
    }
    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
    });
    if (!storedToken) {
        throw new error_1.AppError('Invalid refresh token', shared_2.HTTP_STATUS.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
    }
    if (storedToken.expiresAt < new Date()) {
        // Clean up expired token
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        throw new error_1.AppError('Refresh token has expired', shared_2.HTTP_STATUS.UNAUTHORIZED, 'TOKEN_EXPIRED');
    }
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user || !user.isActive) {
        throw new error_1.AppError('User not found or inactive', shared_2.HTTP_STATUS.UNAUTHORIZED, 'USER_INACTIVE');
    }
    // Generate new tokens
    const newTokens = (0, exports.generateTokens)(userId);
    // Replace old refresh token with new one
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);
    await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
            token: newTokens.refreshToken,
            expiresAt: newExpiresAt,
        }
    });
    return newTokens;
};
exports.refreshAccessToken = refreshAccessToken;
// Logout user (invalidate refresh token)
const logoutUser = async (refreshToken) => {
    try {
        await prisma.refreshToken.delete({
            where: { token: refreshToken }
        });
    }
    catch (error) {
        // Token doesn't exist - already logged out, no error needed
    }
};
exports.logoutUser = logoutUser;
// Get user by ID
const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    return user;
};
exports.getUserById = getUserById;
// Update user profile
const updateUserProfile = async (userId, updates) => {
    const { name, email } = updates;
    // Validate name if provided
    if (name) {
        const nameValidation = (0, shared_1.validateName)(name);
        if (!nameValidation.isValid) {
            throw new error_1.AppError(nameValidation.error, shared_2.HTTP_STATUS.BAD_REQUEST, 'INVALID_NAME');
        }
    }
    // Validate email if provided
    if (email) {
        if (!(0, shared_1.isValidEmail)(email)) {
            throw new error_1.AppError('Invalid email format', shared_2.HTTP_STATUS.BAD_REQUEST, 'INVALID_EMAIL');
        }
        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                id: { not: userId }
            }
        });
        if (existingUser) {
            throw new error_1.AppError('Email is already taken', shared_2.HTTP_STATUS.CONFLICT, 'EMAIL_TAKEN');
        }
    }
    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(name && { name: name.trim() }),
            ...(email && { email: email.toLowerCase() }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    return updatedUser;
};
exports.updateUserProfile = updateUserProfile;
