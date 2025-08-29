import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/AuthContext'
import { authApi } from '../services/api'
import LanguageSelector from './LanguageSelector'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.warn('Logout request failed:', error)
    } finally {
      // Clear user state and storage regardless
      logout()
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                Atomic Systems
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                {t('common.home')}
              </Link>
              
              <LanguageSelector />
              
              {user ? (
                // Authenticated navigation
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                    {t('nav.dashboard')}
                  </Link>
                  <Link to="/identity-areas" className="text-gray-600 hover:text-gray-900">
                    {t('nav.identity_areas')}
                  </Link>
                  <Link to="/atomic-systems" className="text-gray-600 hover:text-gray-900">
                    {t('nav.atomic_systems')}
                  </Link>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700">
                      {t('common.welcome')}, {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors text-sm"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </>
              ) : (
                // Unauthenticated navigation
                <>
                  <Link to="/test" className="text-gray-600 hover:text-gray-900">
                    {t('common.test')}
                  </Link>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout