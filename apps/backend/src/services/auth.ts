import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterCredentials,
  validatePassword,
  isValidEmail,
  validateName
} from '@atomic/shared';
import { AppError } from '../middleware/error';
import { HTTP_STATUS } from '@atomic/shared';

const prisma = new PrismaClient();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

// Generate JWT tokens
export const generateTokens = (userId: string): AuthTokens => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET
  );

  return { accessToken, refreshToken };
};

// Verify JWT token
export const verifyToken = (token: string): { userId: string; type: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, type: decoded.type };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token has expired', HTTP_STATUS.UNAUTHORIZED, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
  }
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Register new user
export const registerUser = async (credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
  const { email, password, name } = credentials;

  // Validate input
  if (!isValidEmail(email)) {
    throw new AppError('Invalid email format', HTTP_STATUS.BAD_REQUEST, 'INVALID_EMAIL');
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new AppError(passwordValidation.errors[0], HTTP_STATUS.BAD_REQUEST, 'WEAK_PASSWORD');
  }

  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    throw new AppError(nameValidation.error!, HTTP_STATUS.BAD_REQUEST, 'INVALID_NAME');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    throw new AppError('User already exists with this email', HTTP_STATUS.CONFLICT, 'USER_EXISTS');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

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
  const tokens = generateTokens(user.id);

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

  return { user: user as User, tokens };
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
  const { email, password } = credentials;

  // Validate input
  if (!isValidEmail(email)) {
    throw new AppError('Invalid email format', HTTP_STATUS.BAD_REQUEST, 'INVALID_EMAIL');
  }

  if (!password) {
    throw new AppError('Password is required', HTTP_STATUS.BAD_REQUEST, 'PASSWORD_REQUIRED');
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', HTTP_STATUS.UNAUTHORIZED, 'ACCOUNT_DEACTIVATED');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const tokens = generateTokens(user.id);

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
  return { user: userWithoutPassword as User, tokens };
};

// Refresh access token
export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokens> => {
  // Verify refresh token
  const { userId, type } = verifyToken(refreshToken);

  if (type !== 'refresh') {
    throw new AppError('Invalid token type', HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken }
  });

  if (!storedToken) {
    throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
  }

  if (storedToken.expiresAt < new Date()) {
    // Clean up expired token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError('Refresh token has expired', HTTP_STATUS.UNAUTHORIZED, 'TOKEN_EXPIRED');
  }

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', HTTP_STATUS.UNAUTHORIZED, 'USER_INACTIVE');
  }

  // Generate new tokens
  const newTokens = generateTokens(userId);

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

// Logout user (invalidate refresh token)
export const logoutUser = async (refreshToken: string): Promise<void> => {
  try {
    await prisma.refreshToken.delete({
      where: { token: refreshToken }
    });
  } catch (error) {
    // Token doesn't exist - already logged out, no error needed
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
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

  return user as User | null;
};

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<{ name: string; email: string }>
): Promise<User> => {
  const { name, email } = updates;

  // Validate name if provided
  if (name) {
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      throw new AppError(nameValidation.error!, HTTP_STATUS.BAD_REQUEST, 'INVALID_NAME');
    }
  }

  // Validate email if provided
  if (email) {
    if (!isValidEmail(email)) {
      throw new AppError('Invalid email format', HTTP_STATUS.BAD_REQUEST, 'INVALID_EMAIL');
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        id: { not: userId }
      }
    });

    if (existingUser) {
      throw new AppError('Email is already taken', HTTP_STATUS.CONFLICT, 'EMAIL_TAKEN');
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

  return updatedUser as User;
};