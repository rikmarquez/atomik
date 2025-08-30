import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { atomicSystemsApi, identityAreasApi, handleApiError } from '../services/api'
import { AtomicSystem, CreateAtomicSystemData, UpdateAtomicSystemData, IdentityArea } from '../types/shared'

const AtomicSystems = () => {
  const { t } = useTranslation()
  const [atomicSystems, setAtomicSystems] = useState<AtomicSystem[]>([])
  const [identityAreas, setIdentityAreas] = useState<IdentityArea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSystem, setEditingSystem] = useState<AtomicSystem | null>(null)
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('')
  const [formData, setFormData] = useState<CreateAtomicSystemData>({
    identityAreaId: '',
    name: '',
    description: '',
    cue: '',
    craving: '',
    response: '',
    reward: '',
    frequency: 'DAILY',
    timeOfDay: '',
    estimatedMin: undefined,
    difficulty: 3,
  })

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [systems, areas] = await Promise.all([
        atomicSystemsApi.getAll(selectedAreaFilter || undefined),
        identityAreasApi.getAll()
      ])
      setAtomicSystems(systems)
      setIdentityAreas(areas)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  // Reload systems when filter changes
  useEffect(() => {
    loadAtomicSystems()
  }, [selectedAreaFilter])

  const loadAtomicSystems = async () => {
    setLoading(true)
    try {
      const systems = await atomicSystemsApi.getAll(selectedAreaFilter || undefined)
      setAtomicSystems(systems)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingSystem) {
        // Update existing system
        const { identityAreaId, ...updateData } = formData
        const updatedSystem = await atomicSystemsApi.update(editingSystem.id, updateData)
        setAtomicSystems(systems => systems.map(system => 
          system.id === editingSystem.id ? updatedSystem : system
        ))
      } else {
        // Create new system
        const newSystem = await atomicSystemsApi.create(formData)
        setAtomicSystems(systems => [...systems, newSystem])
      }
      
      // Reset form
      resetForm()
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (system: AtomicSystem) => {
    setEditingSystem(system)
    setFormData({
      identityAreaId: system.identityAreaId,
      name: system.name,
      description: system.description || '',
      cue: system.cue,
      craving: system.craving,
      response: system.response,
      reward: system.reward,
      frequency: system.frequency,
      timeOfDay: system.timeOfDay || '',
      estimatedMin: system.estimatedMin,
      difficulty: system.difficulty,
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    setLoading(true)
    setError(null)
    
    try {
      await atomicSystemsApi.delete(id)
      setAtomicSystems(systems => systems.filter(system => system.id !== id))
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async (id: string, name: string) => {
    const quality = prompt(`How well did you execute "${name}"? (1-5, where 5 is excellent)`)
    if (!quality || isNaN(Number(quality))) return

    const notes = prompt(`Any notes about this execution? (optional)`)

    setLoading(true)
    setError(null)

    try {
      await atomicSystemsApi.execute(id, {
        quality: Number(quality),
        notes: notes || undefined,
        strengthensIdentity: true
      })
      // You might want to show a success message or update UI
      alert(`Great job executing "${name}"! 🎉`)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      identityAreaId: '',
      name: '',
      description: '',
      cue: '',
      craving: '',
      response: '',
      reward: '',
      frequency: 'DAILY',
      timeOfDay: '',
      estimatedMin: undefined,
      difficulty: 3,
    })
    setShowCreateForm(false)
    setEditingSystem(null)
  }

  const getIdentityAreaById = (id: string) => {
    return identityAreas.find(area => area.id === id)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('atomic_systems.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('atomic_systems.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          ⚡ {t('atomic_systems.create_new')}
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">{t('atomic_systems.select_identity_area')}:</label>
          <select
            value={selectedAreaFilter}
            onChange={(e) => setSelectedAreaFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">{t('nav.identity_areas')}</option>
            {identityAreas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingSystem ? t('atomic_systems.edit_system') : t('atomic_systems.create_new')}
          </h3>
          
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identity Area <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.identityAreaId}
                  onChange={(e) => setFormData({...formData, identityAreaId: e.target.value})}
                  required
                  disabled={!!editingSystem}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">{t('atomic_systems.select_identity_area')}</option>
                  {identityAreas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('atomic_systems.system_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('atomic_systems.system_name_placeholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('atomic_systems.system_description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('atomic_systems.system_description_placeholder')}
              />
            </div>

            {/* The 4 Laws */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🎯 {t('atomic_systems.law_1')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cue}
                  onChange={(e) => setFormData({...formData, cue: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('atomic_systems.law_1_placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  💫 {t('atomic_systems.law_2')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.craving}
                  onChange={(e) => setFormData({...formData, craving: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('atomic_systems.law_2_placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ⚡ {t('atomic_systems.law_3')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.response}
                  onChange={(e) => setFormData({...formData, response: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('atomic_systems.law_3_placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🎉 {t('atomic_systems.law_4')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reward}
                  onChange={(e) => setFormData({...formData, reward: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('atomic_systems.law_4_placeholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('atomic_systems.frequency')}
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DAILY">{t('atomic_systems.frequency_daily')}</option>
                  <option value="WEEKLY">{t('atomic_systems.frequency_weekly')}</option>
                  <option value="CUSTOM">{t('atomic_systems.frequency_custom')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={formData.estimatedMin || ''}
                  onChange={(e) => setFormData({...formData, estimatedMin: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('atomic_systems.difficulty')}
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 - {t('atomic_systems.difficulty_easy')}</option>
                  <option value={2}>2 - {t('atomic_systems.difficulty_easy')}</option>
                  <option value={3}>3 - Moderate</option>
                  <option value={4}>4 - {t('atomic_systems.difficulty_hard')}</option>
                  <option value={5}>5 - {t('atomic_systems.difficulty_hard')}</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.identityAreaId}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : editingSystem ? t('atomic_systems.update_system') : t('atomic_systems.create_system')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Systems List */}
      {loading && atomicSystems.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading atomic systems...</p>
        </div>
      ) : atomicSystems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('atomic_systems.no_systems')}</h3>
          <p className="text-gray-600 mb-6">
            {t('atomic_systems.no_systems_message')}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ⚡ {t('atomic_systems.create_new')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {atomicSystems.map((system) => {
            const identityArea = getIdentityAreaById(system.identityAreaId)
            return (
              <div key={system.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div 
                  className="h-2 rounded-t-lg"
                  style={{ backgroundColor: identityArea?.color || '#3B82F6' }}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{system.name}</h3>
                      <p className="text-sm text-gray-500">{identityArea?.name}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleExecute(system.id, system.name)}
                        className="text-green-600 hover:text-green-700 p-2 rounded"
                        title={t('atomic_systems.execute_system')}
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => handleEdit(system)}
                        className="text-blue-600 hover:text-blue-700 p-2 rounded"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(system.id, system.name)}
                        className="text-red-600 hover:text-red-700 p-2 rounded"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {system.description && (
                    <p className="text-gray-600 text-sm mb-4">{system.description}</p>
                  )}
                  
                  {/* 4 Laws */}
                  <div className="space-y-2 text-sm">
                    <div><strong>🎯 {t('atomic_systems.four_laws_short.cue')}:</strong> {system.cue}</div>
                    <div><strong>💫 {t('atomic_systems.four_laws_short.craving')}:</strong> {system.craving}</div>
                    <div><strong>⚡ {t('atomic_systems.four_laws_short.response')}:</strong> {system.response}</div>
                    <div><strong>🎉 {t('atomic_systems.four_laws_short.reward')}:</strong> {system.reward}</div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>🔄 {system.frequency}</span>
                        {system.estimatedMin && <span>⏱️ {system.estimatedMin}min</span>}
                        <span>📊 Level {system.difficulty}</span>
                      </div>
                      <span>Created {new Date(system.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AtomicSystems