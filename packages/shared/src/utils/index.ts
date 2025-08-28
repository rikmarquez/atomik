import { VALIDATION, HTTP_STATUS } from '../constants';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters long`);
  }
  
  if (password.length > VALIDATION.PASSWORD.MAX_LENGTH) {
    errors.push(`Password must be no more than ${VALIDATION.PASSWORD.MAX_LENGTH} characters long`);
  }
  
  if (VALIDATION.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (VALIDATION.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (VALIDATION.PASSWORD.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (VALIDATION.PASSWORD.REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (name.length < VALIDATION.NAME.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Name must be at least ${VALIDATION.NAME.MIN_LENGTH} characters long`
    };
  }
  
  if (name.length > VALIDATION.NAME.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Name must be no more than ${VALIDATION.NAME.MAX_LENGTH} characters long`
    };
  }
  
  return { isValid: true };
};

// Format date helpers
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// API response helpers
export const createSuccessResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  message
});

export const createErrorResponse = (error: string, code?: string, details?: any) => ({
  success: false,
  error,
  code: code || 'UNKNOWN_ERROR',
  details
});

// HTTP status helpers
export const isSuccessStatus = (status: number): boolean => {
  return status >= 200 && status < 300;
};

export const isClientError = (status: number): boolean => {
  return status >= 400 && status < 500;
};

export const isServerError = (status: number): boolean => {
  return status >= 500;
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Delay utility for development/testing
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};