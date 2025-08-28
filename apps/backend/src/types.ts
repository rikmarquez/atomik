import { Request } from 'express'

// Base API Response type
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  details?: any
  message?: string
}

// Authenticated Request type (extends Express Request with user)
export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    type: string
  }
}

// User object type (matches Prisma model)
export interface User {
  id: string
  email: string
  name: string
  isActive?: boolean
  isPremium?: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

// Identity Area types
export interface IdentityArea {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  isActive: boolean
  order: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateIdentityAreaData {
  name: string
  description?: string
  color?: string
  order?: number
}

export interface UpdateIdentityAreaData extends Partial<CreateIdentityAreaData> {}

// Atomic System types
export interface AtomicSystem {
  id: string
  userId: string
  identityAreaId: string
  name: string
  description?: string
  trigger: string
  reward: string
  frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM'
  timeOfDay?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME'
  estimatedMinutes?: number
  isActive: boolean
  order: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateAtomicSystemData {
  identityAreaId: string
  name: string
  description?: string
  trigger: string
  reward: string
  frequency?: 'DAILY' | 'WEEKLY' | 'CUSTOM'
  timeOfDay?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME'
  estimatedMinutes?: number
  order?: number
}

export interface UpdateAtomicSystemData extends Partial<CreateAtomicSystemData> {}