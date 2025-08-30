import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/AuthContext'
import { authApi, identityAreasApi, atomicSystemsApi, handleApiError } from '../services/api'
import { User, IdentityArea, AtomicSystem } from '../types/shared'

const Dashboard = () => {
  const { user, setUser } = useAuth()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(user)
  const [identityAreas, setIdentityAreas] = useState<IdentityArea[]>([])
  const [areasLoading, setAreasLoading] = useState(false)
  const [atomicSystems, setAtomicSystems] = useState<AtomicSystem[]>([])
  const [systemsLoading, setSystemsLoading] = useState(false)

  // Load fresh user data when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        const profile = await authApi.getProfile()
        setUserProfile(profile)
        // Only update user context if the profile is actually different
        if (JSON.stringify(user) !== JSON.stringify(profile)) {
          setUser(profile)
        }
      } catch (err) {
        setError(handleApiError(err))
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, []) // Remove user and setUser from dependencies to prevent loop

  // Load identity areas
  useEffect(() => {
    const loadIdentityAreas = async () => {
      if (!user) return
      
      setAreasLoading(true)
      try {
        const areas = await identityAreasApi.getAll()
        setIdentityAreas(areas)
      } catch (err) {
        console.error('Error loading identity areas:', err)
        // Don't show error for areas, just fail silently
      } finally {
        setAreasLoading(false)
      }
    }

    loadIdentityAreas()
  }, [user])

  // Load atomic systems
  useEffect(() => {
    const loadAtomicSystems = async () => {
      if (!user) return
      
      setSystemsLoading(true)
      try {
        const systems = await atomicSystemsApi.getAll()
        setAtomicSystems(systems)
      } catch (err) {
        console.error('Error loading atomic systems:', err)
        // Don't show error for systems, just fail silently
      } finally {
        setSystemsLoading(false)
      }
    }

    loadAtomicSystems()
  }, [user])

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-600">{t('common.loading')}</p>
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
              {t('dashboard.welcome', { name: userProfile?.name || user.name })}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('dashboard.ready_message')}
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
          <h3 className="font-semibold mb-2">{t('dashboard.new_identity_area')}</h3>
          <p className="text-sm opacity-90">{t('dashboard.new_identity_area_desc')}</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.todays_systems')}</h2>
              <p className="text-gray-600 text-sm mt-1">{t('dashboard.todays_systems_desc')}</p>
            </div>
            <Link 
              to="/atomic-systems" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {systemsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">{t('common.loading')}</div>
            </div>
          ) : atomicSystems.length > 0 ? (
            <div className="space-y-4">
              {atomicSystems.slice(0, 3).map((system) => (
                <div key={system.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{system.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{system.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>🔄 {t(`atomic_systems.frequency_${system.frequency.toLowerCase()}`)}</span>
                        <span>⏱️ {system.estimatedMin || 0} min</span>
                        <span>📊 Difficulty {system.difficulty}/5</span>
                      </div>
                    </div>
                    <button 
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                      onClick={() => {/* TODO: Execute system */}}
                    >
                      ⚡ Execute
                    </button>
                  </div>
                </div>
              ))}
              {atomicSystems.length > 3 && (
                <div className="text-center pt-4">
                  <Link 
                    to="/atomic-systems"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View {atomicSystems.length - 3} more systems →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.ready_to_start')}</h3>
              <p className="text-gray-600 mb-6">
                {t('dashboard.no_systems_message')}
              </p>
              <div className="space-y-3">
                <Link 
                  to="/identity-areas" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('dashboard.create_first_identity')}
                </Link>
                <br />
                <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  {t('dashboard.learn_atomic_systems')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Identity Areas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.identity_areas')}</h2>
              <p className="text-gray-600 text-sm mt-1">Your identity areas and their progress</p>
            </div>
            <Link 
              to="/identity-areas" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {areasLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">{t('common.loading')}</div>
            </div>
          ) : identityAreas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {identityAreas.slice(0, 6).map((area) => (
                <Link
                  key={area.id}
                  to={`/identity-areas?area=${area.id}`}
                  className="p-4 rounded-lg border-2 hover:shadow-md transition-all duration-200"
                  style={{ 
                    borderColor: area.color,
                    backgroundColor: `${area.color}08`
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm mb-1">
                        {area.name}
                      </h3>
                      {area.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {area.description}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: area.color }}></span>
                        {area._count?.systems || 0} sistemas
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-medium text-gray-900 mb-1">No identity areas yet</h3>
              <p className="text-gray-600 text-sm mb-4">Create your first identity area to get started</p>
              <Link 
                to="/identity-areas"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Create Identity Area
              </Link>
            </div>
          )}
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