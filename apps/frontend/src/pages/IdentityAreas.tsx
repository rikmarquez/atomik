import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { identityAreasApi, handleApiError } from '../services/api'
import { IdentityArea, CreateIdentityAreaData, UpdateIdentityAreaData, IdentityGoal } from '../types/shared'
import IdentityGoals from '../components/IdentityGoals'

const IdentityAreas = () => {
  const { t } = useTranslation()
  const [identityAreas, setIdentityAreas] = useState<IdentityArea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingArea, setEditingArea] = useState<IdentityArea | null>(null)
  const [formData, setFormData] = useState<CreateIdentityAreaData>({
    name: '',
    description: '',
    color: '#3B82F6',
  })

  // Load identity areas on component mount
  useEffect(() => {
    loadIdentityAreas()
  }, [])

  const loadIdentityAreas = async () => {
    setLoading(true)
    setError(null)
    try {
      const areas = await identityAreasApi.getAll()
      setIdentityAreas(areas)
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
      if (editingArea) {
        // Update existing area
        const updatedArea = await identityAreasApi.update(editingArea.id, formData)
        setIdentityAreas(areas => areas.map(area => 
          area.id === editingArea.id ? updatedArea : area
        ))
      } else {
        // Create new area
        const newArea = await identityAreasApi.create(formData)
        setIdentityAreas(areas => [...areas, newArea])
      }
      
      // Reset form
      setFormData({ name: '', description: '', color: '#3B82F6' })
      setShowCreateForm(false)
      setEditingArea(null)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (area: IdentityArea) => {
    setEditingArea(area)
    setFormData({
      name: area.name,
      description: area.description || '',
      color: area.color,
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('identity_areas.delete_confirm'))) return

    setLoading(true)
    setError(null)
    
    try {
      await identityAreasApi.delete(id)
      setIdentityAreas(areas => areas.filter(area => area.id !== id))
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', color: '#3B82F6' })
    setShowCreateForm(false)
    setEditingArea(null)
  }

  const handleGoalsChange = (areaId: string, updatedGoals: IdentityGoal[]) => {
    setIdentityAreas(areas => areas.map(area => 
      area.id === areaId 
        ? { 
            ...area, 
            goals: updatedGoals, 
            _count: { 
              systems: area._count?.systems || 0,
              goals: updatedGoals.length 
            } 
          }
        : area
    ))
  }

  const presetColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('identity_areas.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('identity_areas.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          ➕ New Identity Area
        </button>
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
            {editingArea ? t('identity_areas.edit_area') : t('identity_areas.create_new')}
          </h3>
          
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('identity_areas.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('identity_areas.name_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('identity_areas.description_label')}
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('identity_areas.description_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('identity_areas.color')}
              </label>
              <div className="flex space-x-2 mb-2">
                {presetColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({...formData, color})}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-16 h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : editingArea ? t('common.update') : t('common.create')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Identity Areas List */}
      {loading && identityAreas.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading identity areas...</p>
        </div>
      ) : identityAreas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('identity_areas.no_areas')}</h3>
          <p className="text-gray-600 mb-6">
            {t('identity_areas.no_areas_message')}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🎯 {t('identity_areas.create_new')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {identityAreas.map((area) => (
            <div key={area.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div 
                className="h-2 rounded-t-lg"
                style={{ backgroundColor: area.color }}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(area)}
                      className="text-gray-400 hover:text-blue-600 p-1"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(area.id, area.name)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title={t('common.delete')}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {area.description && (
                  <p className="text-gray-600 text-sm mb-4">{area.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <div className="flex space-x-4">
                    <span>🎯 {area._count?.goals || 0} metas</span>
                    <span>⚡ {area._count?.systems || 0} sistemas</span>
                  </div>
                  <span>{t('common.create')}d {new Date(area.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Identity Goals Component */}
                <IdentityGoals
                  identityAreaId={area.id}
                  identityAreaName={area.name}
                  identityAreaColor={area.color}
                  goals={area.goals || []}
                  onGoalsChange={(updatedGoals) => handleGoalsChange(area.id, updatedGoals)}
                />

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link 
                    to="/atomic-systems" 
                    className="inline-block bg-green-500 text-white text-sm px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    ⚡ {t('atomic_systems.create_system')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default IdentityAreas