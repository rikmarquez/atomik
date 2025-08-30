// Auth types
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

// Habit System types (based on Atomic Habits methodology)
export interface IdentityArea {
  id: string;
  userId: string;
  name: string; // e.g., "Healthy Person", "Productive Professional"
  description?: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  systems?: AtomicSystem[];
  goals?: IdentityGoal[];
  _count?: {
    systems: number;
    goals: number;
  };
}

export interface CreateIdentityAreaData {
  name: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface UpdateIdentityAreaData extends Partial<CreateIdentityAreaData> {}

// Identity Goal types
export type GoalType = 'ABOVE' | 'BELOW' | 'EXACT' | 'QUALITATIVE';

export interface IdentityGoal {
  id: string;
  userId: string;
  identityAreaId: string;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  goalType: GoalType;
  targetDate?: Date;
  isAchieved: boolean;
  achievedAt?: Date;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  identityArea?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface CreateIdentityGoalData {
  identityAreaId: string;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  goalType?: GoalType;
  targetDate?: string; // ISO string
  color?: string;
  order?: number;
}

export interface UpdateIdentityGoalData extends Partial<Omit<CreateIdentityGoalData, 'identityAreaId'>> {}

export interface UpdateGoalProgressData {
  currentValue: number;
  isAchieved?: boolean;
}

export interface AtomicSystem {
  id: string;
  userId: string;
  identityAreaId: string;
  name: string; // e.g., "Morning Workout System"
  description?: string;
  cue: string; // 1st Law: Make it Obvious
  craving: string; // 2nd Law: Make it Attractive
  response: string; // 3rd Law: Make it Easy
  reward: string; // 4th Law: Make it Satisfying
  frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  timeOfDay?: string;
  estimatedMin?: number;
  difficulty: number; // 1-5 scale
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

export interface UpdateAtomicSystemData extends Partial<Omit<CreateAtomicSystemData, 'identityAreaId'>> {}

export interface SystemExecution {
  id: string;
  systemId: string;
  userId: string;
  executedAt: Date;
  quality: 1 | 2 | 3 | 4 | 5; // Quality of execution (1=poor, 5=excellent)
  notes?: string;
  strengthensIdentity: boolean; // Did this action strengthen your identity?
}

// API Response types
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

// Pagination types
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