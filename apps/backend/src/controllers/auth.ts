import { Request, Response, NextFunction } from 'express';
import { 
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserById,
  updateUserProfile
} from '../services/auth';
import { createSuccessResponse, HTTP_STATUS } from '../types/utils';

// Register new user
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Email, password, and name are required',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await registerUser({ email, password, name });

    res.status(HTTP_STATUS.CREATED).json(createSuccessResponse({
      user: result.user,
      tokens: result.tokens
    }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await loginUser({ email, password });

    res.status(HTTP_STATUS.OK).json(createSuccessResponse({
      user: result.user,
      tokens: result.tokens
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const tokens = await refreshAccessToken(refreshToken);

    res.status(HTTP_STATUS.OK).json(createSuccessResponse(tokens, 'Token refreshed successfully'));
  } catch (error) {
    next(error);
  }
};

// Logout user
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    await logoutUser(refreshToken);

    res.status(HTTP_STATUS.OK).json(createSuccessResponse(null, 'Logout successful'));
  } catch (error) {
    next(error);
  }
};

// Get user profile
const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(HTTP_STATUS.OK).json(createSuccessResponse(user, 'Profile retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'At least one field (name or email) is required',
        code: 'MISSING_FIELDS'
      });
    }

    const updatedUser = await updateUserProfile(userId, { name, email });

    res.status(HTTP_STATUS.OK).json(createSuccessResponse(updatedUser, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const authController = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};