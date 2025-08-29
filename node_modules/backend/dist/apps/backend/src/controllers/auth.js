"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_1 = require("../services/auth");
const utils_1 = require("../types/utils");
// Register new user
const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(utils_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'Email, password, and name are required',
                code: 'MISSING_FIELDS'
            });
        }
        const result = await (0, auth_1.registerUser)({ email, password, name });
        res.status(utils_1.HTTP_STATUS.CREATED).json((0, utils_1.createSuccessResponse)({
            user: result.user,
            tokens: result.tokens
        }, 'User registered successfully'));
    }
    catch (error) {
        next(error);
    }
};
// Login user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(utils_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'Email and password are required',
                code: 'MISSING_FIELDS'
            });
        }
        const result = await (0, auth_1.loginUser)({ email, password });
        res.status(utils_1.HTTP_STATUS.OK).json((0, utils_1.createSuccessResponse)({
            user: result.user,
            tokens: result.tokens
        }, 'Login successful'));
    }
    catch (error) {
        next(error);
    }
};
// Refresh access token
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(utils_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'Refresh token is required',
                code: 'MISSING_REFRESH_TOKEN'
            });
        }
        const tokens = await (0, auth_1.refreshAccessToken)(refreshToken);
        res.status(utils_1.HTTP_STATUS.OK).json((0, utils_1.createSuccessResponse)(tokens, 'Token refreshed successfully'));
    }
    catch (error) {
        next(error);
    }
};
// Logout user
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(utils_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'Refresh token is required',
                code: 'MISSING_REFRESH_TOKEN'
            });
        }
        await (0, auth_1.logoutUser)(refreshToken);
        res.status(utils_1.HTTP_STATUS.OK).json((0, utils_1.createSuccessResponse)(null, 'Logout successful'));
    }
    catch (error) {
        next(error);
    }
};
// Get user profile
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(utils_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: 'User not authenticated',
                code: 'NOT_AUTHENTICATED'
            });
        }
        const user = await (0, auth_1.getUserById)(userId);
        if (!user) {
            return res.status(utils_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }
        res.status(utils_1.HTTP_STATUS.OK).json((0, utils_1.createSuccessResponse)(user, 'Profile retrieved successfully'));
    }
    catch (error) {
        next(error);
    }
};
// Update user profile
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(utils_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: 'User not authenticated',
                code: 'NOT_AUTHENTICATED'
            });
        }
        const { name, email } = req.body;
        if (!name && !email) {
            return res.status(utils_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'At least one field (name or email) is required',
                code: 'MISSING_FIELDS'
            });
        }
        const updatedUser = await (0, auth_1.updateUserProfile)(userId, { name, email });
        res.status(utils_1.HTTP_STATUS.OK).json((0, utils_1.createSuccessResponse)(updatedUser, 'Profile updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.authController = {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
    updateProfile
};
