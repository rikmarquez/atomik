import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { authApi, handleApiError } from '../services/api'
import { User } from '@atomic/shared'

const Dashboard = () => {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(user)

  // Load fresh user data when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        const profile = await authApi.getProfile()
        setUserProfile(profile)
        setUser(profile)
      } catch (err) {
        setError(handleApiError(err))
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [user, setUser])

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Loading user information...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userProfile?.name || user.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Ready to work on your atomic systems today?
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isPremium 
                  ? 'bg-gold-100 text-gold-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.isPremium ? '⭐ Premium' : '🆓 Free'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          to="/identity-areas" 
          className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors block"
        >
          <h3 className="font-semibold mb-2">🎯 New Identity Area</h3>
          <p className="text-sm opacity-90">Define a new life area to focus on</p>
        </Link>
        
        <Link 
          to="/atomic-systems" 
          className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors block"
        >
          <h3 className="font-semibold mb-2">⚡ New Atomic System</h3>
          <p className="text-sm opacity-90">Create a system to build habits</p>
        </Link>
        
        <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors">
          <h3 className="font-semibold mb-2">📊 View Analytics</h3>
          <p className="text-sm opacity-90">Track your progress and streaks</p>
        </button>
      </div>

      {/* Today's Systems */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Today's Systems</h2>
          <p className="text-gray-600 text-sm mt-1">Complete your daily atomic systems</p>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start Building?</h3>
            <p className="text-gray-600 mb-6">
              You haven't created any systems yet. Let's start by defining your identity areas and building your first atomic system.
            </p>
            <div className="space-y-3">
              <Link 
                to="/onboarding" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🎯 Create Your First Identity Area
              </Link>
              <br />
              <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                📖 Learn About Atomic Systems
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">Plan Limits</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>• Identity Areas: {user.isPremium ? 'Unlimited' : '1 of 1'}</p>
              <p>• Atomic Systems: {user.isPremium ? 'Unlimited' : '0 of 2'}</p>
              <p>• History: {user.isPremium ? 'Full history' : 'Last 30 days'}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">Quick Stats</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>• Identity Areas: 0</p>
              <p>• Active Systems: 0</p>
              <p>• Current Streak: 0 days</p>
            </div>
          </div>
        </div>
        
        {!user.isPremium && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🌟 Upgrade to Premium</h4>
              <p className="text-sm text-gray-600 mb-3">
                Unlock unlimited systems, advanced analytics, and full history tracking.
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm">
                Upgrade Now - $4.99/month
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard