import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User, AuthTokens } from '../types/shared'

// Auth state interface
interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens }

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,
}

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isLoading: false,
        isAuthenticated: true,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    case 'UPDATE_TOKENS':
      return {
        ...state,
        tokens: action.payload,
      }
    default:
      return state
  }
}

// Context interface
interface AuthContextType extends AuthState {
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  updateUser: (user: User) => void
  updateTokens: (tokens: AuthTokens) => void
  setUser: (user: User) => void // Alias para updateUser
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedTokens = localStorage.getItem('atomic_tokens')
        const storedUser = localStorage.getItem('atomic_user')

        if (storedTokens && storedUser) {
          const tokens: AuthTokens = JSON.parse(storedTokens)
          const user: User = JSON.parse(storedUser)

          // Basic validation
          if (tokens.accessToken && tokens.refreshToken && user.id && user.email) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, tokens },
            })
            return
          }
        }
      } catch (error) {
        console.error('Failed to load auth state:', error)
        // Clear invalid data
        localStorage.removeItem('atomic_tokens')
        localStorage.removeItem('atomic_user')
      }

      dispatch({ type: 'AUTH_FAILURE' })
    }

    loadAuthState()
  }, [])

  // Auth methods
  const login = (user: User, tokens: AuthTokens) => {
    try {
      localStorage.setItem('atomic_user', JSON.stringify(user))
      localStorage.setItem('atomic_tokens', JSON.stringify(tokens))
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, tokens } })
    } catch (error) {
      console.error('Failed to save auth state:', error)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('atomic_user')
      localStorage.removeItem('atomic_tokens')
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      console.error('Failed to clear auth state:', error)
    }
  }

  const updateUser = (user: User) => {
    try {
      localStorage.setItem('atomic_user', JSON.stringify(user))
      dispatch({ type: 'UPDATE_USER', payload: user })
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const updateTokens = (tokens: AuthTokens) => {
    try {
      localStorage.setItem('atomic_tokens', JSON.stringify(tokens))
      dispatch({ type: 'UPDATE_TOKENS', payload: tokens })
    } catch (error) {
      console.error('Failed to update tokens:', error)
    }
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    updateTokens,
    setUser: updateUser, // Alias para updateUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}