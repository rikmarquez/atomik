// Export all shared types
export * from './shared';
export * from './utils';
export * from './constants';

// Re-export common API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}