import { Request } from 'express';

// Export all shared types
export * from './shared';
export * from './utils';
export * from './constants';

// Authenticated request interface for middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    isActive?: boolean;
    isPremium?: boolean;
  };
}

// Re-export common API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}