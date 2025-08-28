import React, { useState } from 'react'
import { healthApi, authApi, handleApiError } from '../services/api'

const Test = () => {
  const [healthResult, setHealthResult] = useState<any>(null)
  const [authResult, setAuthResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testHealthEndpoint = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await healthApi.check()
      setHealthResult(result)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const testRegisterEndpoint = async () => {
    setLoading(true)
    setError(null)
    try {
      const testUser = {
        email: `test_${Date.now()}@example.com`,
        password: 'Test123!@#',
        name: 'Test User'
      }
      const result = await authApi.register(testUser)
      setAuthResult({ type: 'register', data: result })
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const testIdentityAreasEndpoint = async () => {
    setLoading(true)
    setError(null)
    try {
      const { identityAreasApi } = await import('../services/api')
      const areas = await identityAreasApi.getAll()
      setAuthResult({ type: 'identity-areas', data: { areas } })
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">API Integration Test</h1>
      
      <div className="space-y-6">
        {/* Health Endpoint Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Health Endpoint</h2>
          <button
            onClick={testHealthEndpoint}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test /health'}
          </button>
          
          {healthResult && (
            <div className="mt-4">
              <h3 className="font-semibold text-green-600">✅ Health Check Result:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(healthResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Auth Endpoint Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Auth Endpoints</h2>
          <div className="space-x-4">
            <button
              onClick={testRegisterEndpoint}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test /auth/register'}
            </button>
            <button
              onClick={testIdentityAreasEndpoint}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test /identity-areas'}
            </button>
          </div>
          
          {authResult && (
            <div className="mt-4">
              <h3 className="font-semibold text-green-600">✅ Auth Result:</h3>
              <p className="text-sm text-gray-600 mb-2">Type: {authResult.type}</p>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify({
                  user: authResult.data.user,
                  tokens: authResult.data.tokens ? 'Present' : 'Missing'
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <h3 className="font-semibold text-red-800">❌ Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Current Status */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Current Status:</h3>
          <ul className="text-sm space-y-1">
            <li>• Frontend: Running on port 3000</li>
            <li>• Backend: Should be running on port 3001</li>
            <li>• Proxy: Configured to redirect /api to backend</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Test