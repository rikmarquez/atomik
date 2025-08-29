import { VALIDATION, HTTP_STATUS } from './constants';

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

// Export HTTP_STATUS for convenience
export { HTTP_STATUS };