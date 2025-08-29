import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/AuthContext'

const Home = () => {
  const { user, isLoading } = useAuth()
  const { t } = useTranslation()

  // If user is authenticated, redirect to dashboard
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // Show public home page for non-authenticated users
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {t('home.title')}
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        {t('home.subtitle')}
      </p>
      <div className="space-x-4">
        <a
          href="/register"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('home.get_started')}
        </a>
        <a
          href="/login"
          className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {t('home.login')}
        </a>
      </div>
    </div>
  )
}

export default Home