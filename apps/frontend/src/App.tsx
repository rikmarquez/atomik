import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './store/AuthContext'
import './i18n' // Initialize i18n
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import IdentityAreas from './pages/IdentityAreas'
import AtomicSystems from './pages/AtomicSystems'
import Test from './pages/Test'
import ProtectedRoute from './components/ProtectedRoute'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/register" element={<Layout><Register /></Layout>} />
              <Route path="/test" element={<Test />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Layout><Onboarding /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/identity-areas"
                element={
                  <ProtectedRoute>
                    <Layout><IdentityAreas /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/atomic-systems"
                element={
                  <ProtectedRoute>
                    <Layout><AtomicSystems /></Layout>
                  </ProtectedRoute>
                }
              />
              
              {/* Catch all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
