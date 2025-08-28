export interface User {
    id: string;
    email: string;
    name: string;
    isActive?: boolean;
    isPremium?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
}
export interface IdentityArea {
    id: string;
    userId: string;
    name: string;
    description?: string;
    color: string;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateIdentityAreaData {
    name: string;
    description?: string;
    color?: string;
    order?: number;
}
export interface UpdateIdentityAreaData extends Partial<CreateIdentityAreaData> {
}
export interface AtomicSystem {
    id: string;
    userId: string;
    identityAreaId: string;
    name: string;
    description?: string;
    cue: string;
    craving: string;
    response: string;
    reward: string;
    frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
    timeOfDay?: string;
    estimatedMin?: number;
    difficulty: number;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateAtomicSystemData {
    identityAreaId: string;
    name: string;
    description?: string;
    cue: string;
    craving: string;
    response: string;
    reward: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'CUSTOM';
    timeOfDay?: string;
    estimatedMin?: number;
    difficulty?: number;
    order?: number;
}
export interface UpdateAtomicSystemData extends Partial<Omit<CreateAtomicSystemData, 'identityAreaId'>> {
}
export interface SystemExecution {
    id: string;
    systemId: string;
    userId: string;
    executedAt: Date;
    quality: 1 | 2 | 3 | 4 | 5;
    notes?: string;
    strengthensIdentity: boolean;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface ApiError {
    error: string;
    code: string;
    details?: any;
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
