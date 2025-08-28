export declare const isValidEmail: (email: string) => boolean;
export declare const validatePassword: (password: string) => {
    isValid: boolean;
    errors: string[];
};
export declare const validateName: (name: string) => {
    isValid: boolean;
    error?: string;
};
export declare const formatDate: (date: Date | string) => string;
export declare const formatDateTime: (date: Date | string) => string;
export declare const createSuccessResponse: <T>(data: T, message?: string) => {
    success: boolean;
    data: T;
    message: string | undefined;
};
export declare const createErrorResponse: (error: string, code?: string, details?: any) => {
    success: boolean;
    error: string;
    code: string;
    details: any;
};
export declare const isSuccessStatus: (status: number) => boolean;
export declare const isClientError: (status: number) => boolean;
export declare const isServerError: (status: number) => boolean;
export declare const capitalize: (str: string) => string;
export declare const truncate: (str: string, length: number) => string;
export declare const chunk: <T>(array: T[], size: number) => T[][];
export declare const omit: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>;
export declare const pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;
export declare const delay: (ms: number) => Promise<void>;
