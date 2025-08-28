import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterCredentials,
  ApiResponse,
  IdentityArea,
  CreateIdentityAreaData,
  UpdateIdentityAreaData,
  AtomicSystem,
  CreateAtomicSystemData,
  UpdateAtomicSystemData
} from '@atomic/shared'
import env from '../config/env'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management
let accessToken: string | null = null
let refreshToken: string | null = null

// Set tokens
export const setTokens = (tokens: AuthTokens | null) => {
  if (tokens) {
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
  } else {
    accessToken = null
    refreshToken = null
  }
}

// Load tokens from localStorage
const loadTokensFromStorage = () => {
  try {
    const stored = localStorage.getItem('atomic_tokens')
    if (stored) {
      const tokens = JSON.parse(stored) as AuthTokens
      setTokens(tokens)
    }
  } catch (error) {
    console.error('Failed to load tokens:', error)
  }
}

// Initialize tokens
loadTokensFromStorage()

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config

    // If error is 401 and we have a refresh token, try to refresh
    if (
      error.response?.status === 401 &&
      refreshToken &&
      originalRequest &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      try {
        const response = await axios.post(`${env.API_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        })

        const newTokens = response.data.data as AuthTokens
        setTokens(newTokens)

        // Update localStorage
        localStorage.setItem('atomic_tokens', JSON.stringify(newTokens))

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
        }

        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        setTokens(null)
        localStorage.removeItem('atomic_tokens')
        localStorage.removeItem('atomic_user')
        
        // Emit custom event for auth context to handle
        window.dispatchEvent(new CustomEvent('auth:logout'))
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API functions
export const authApi = {
  // Register user
  register: async (credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', credentials)
    return response.data.data!
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials)
    const result = response.data.data!
    
    // Store tokens for future requests
    setTokens(result.tokens)
    
    return result
  },

  // Logout user
  logout: async (): Promise<void> => {
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken })
      } catch (error) {
        // Ignore logout errors
        console.warn('Logout request failed:', error)
      }
    }
    
    // Clear tokens regardless
    setTokens(null)
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile')
    return response.data.data!
  },

  // Update user profile
  updateProfile: async (updates: Partial<{ name: string; email: string }>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', updates)
    return response.data.data!
  },

  // Refresh access token
  refreshToken: async (): Promise<AuthTokens> => {
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken: refreshToken,
    })
    
    const newTokens = response.data.data!
    setTokens(newTokens)
    
    return newTokens
  },
}

// Health check
export const healthApi = {
  check: async (): Promise<any> => {
    const response = await api.get<ApiResponse>('/health')
    return response.data.data
  },
}

// Identity Areas API
export const identityAreasApi = {
  // Get all identity areas
  getAll: async (): Promise<IdentityArea[]> => {
    const response = await api.get<ApiResponse<IdentityArea[]>>('/identity-areas')
    return response.data.data!
  },

  // Get specific identity area
  getById: async (id: string): Promise<IdentityArea> => {
    const response = await api.get<ApiResponse<IdentityArea>>(`/identity-areas/${id}`)
    return response.data.data!
  },

  // Create new identity area
  create: async (data: CreateIdentityAreaData): Promise<IdentityArea> => {
    const response = await api.post<ApiResponse<IdentityArea>>('/identity-areas', data)
    return response.data.data!
  },

  // Update identity area
  update: async (id: string, data: UpdateIdentityAreaData): Promise<IdentityArea> => {
    const response = await api.put<ApiResponse<IdentityArea>>(`/identity-areas/${id}`, data)
    return response.data.data!
  },

  // Delete identity area
  delete: async (id: string): Promise<void> => {
    await api.delete(`/identity-areas/${id}`)
  },

  // Reorder identity areas
  reorder: async (areas: { id: string; order: number }[]): Promise<IdentityArea[]> => {
    const response = await api.post<ApiResponse<IdentityArea[]>>('/identity-areas/reorder', { areas })
    return response.data.data!
  },
}

// Atomic Systems API
export const atomicSystemsApi = {
  // Get all atomic systems (optionally filtered by identityAreaId)
  getAll: async (identityAreaId?: string): Promise<AtomicSystem[]> => {
    const params = identityAreaId ? { identityAreaId } : {}
    const response = await api.get<ApiResponse<AtomicSystem[]>>('/atomic-systems', { params })
    return response.data.data!
  },

  // Get specific atomic system
  getById: async (id: string): Promise<AtomicSystem> => {
    const response = await api.get<ApiResponse<AtomicSystem>>(`/atomic-systems/${id}`)
    return response.data.data!
  },

  // Create new atomic system
  create: async (data: CreateAtomicSystemData): Promise<AtomicSystem> => {
    const response = await api.post<ApiResponse<AtomicSystem>>('/atomic-systems', data)
    return response.data.data!
  },

  // Update atomic system
  update: async (id: string, data: UpdateAtomicSystemData): Promise<AtomicSystem> => {
    const response = await api.put<ApiResponse<AtomicSystem>>(`/atomic-systems/${id}`, data)
    return response.data.data!
  },

  // Delete atomic system
  delete: async (id: string): Promise<void> => {
    await api.delete(`/atomic-systems/${id}`)
  },

  // Execute/complete atomic system
  execute: async (id: string, data?: { quality?: number; notes?: string; strengthensIdentity?: boolean }): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/atomic-systems/${id}/execute`, data || {})
    return response.data.data!
  },
}

// Generic API error handler
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>
    
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error
    }
    
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return 'Invalid request. Please check your input.'
        case 401:
          return 'Authentication failed. Please login again.'
        case 403:
          return 'Access denied. You don\'t have permission.'
        case 404:
          return 'Resource not found.'
        case 409:
          return 'Conflict. The resource already exists.'
        case 422:
          return 'Validation failed. Please check your input.'
        case 500:
          return 'Server error. Please try again later.'
        default:
          return 'An unexpected error occurred.'
      }
    }
    
    if (axiosError.code === 'ECONNREFUSED') {
      return 'Unable to connect to server. Please try again later.'
    }
    
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.'
    }
  }
  
  return error?.message || 'An unexpected error occurred.'
}

export default api