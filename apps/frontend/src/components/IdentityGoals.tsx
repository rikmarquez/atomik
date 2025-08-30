import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { identityGoalsApi, handleApiError } from '../services/api'
import { IdentityGoal, CreateIdentityGoalData, UpdateGoalProgressData, GoalType } from '../types/shared'

interface IdentityGoalsProps {
  identityAreaId: string
  identityAreaName: string
  identityAreaColor: string
  goals: IdentityGoal[]
  onGoalsChange: (goals: IdentityGoal[]) => void
}

const IdentityGoals: React.FC<IdentityGoalsProps> = ({
  identityAreaId,
  identityAreaName,
  identityAreaColor,
  goals,
  onGoalsChange
}) => {
  const { t } = useTranslation()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<IdentityGoal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateIdentityGoalData>({
    identityAreaId,
    title: '',
    description: '',
    targetValue: undefined,
    currentValue: undefined,
    unit: '',
    goalType: 'EXACT',
    targetDate: '',
    color: identityAreaColor,
  })

  // Reset form when identity area changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      identityAreaId,
      color: identityAreaColor,
    }))
  }, [identityAreaId, identityAreaColor])

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let updatedGoal: IdentityGoal
      
      // Debug: Check if we have tokens
      const tokens = localStorage.getItem('atomic_tokens')
      console.log('🔍 Debug - Tokens in localStorage:', !!tokens)
      if (tokens) {
        const parsed = JSON.parse(tokens)
        console.log('🔍 Debug - Access token exists:', !!parsed.accessToken)
      }
      
      if (editingGoal) {
        // Update existing goal
        const { identityAreaId: _, ...updateData } = formData
        updatedGoal = await identityGoalsApi.update(editingGoal.id, updateData)
      } else {
        // Create new goal
        console.log('🔍 Debug - Creating goal with data:', formData)
        updatedGoal = await identityGoalsApi.create(formData)
      }

      // Update goals list
      if (editingGoal) {
        const updatedGoals = goals.map(goal => 
          goal.id === editingGoal.id ? updatedGoal : goal
        )
        onGoalsChange(updatedGoals)
      } else {
        onGoalsChange([...goals, updatedGoal])
      }
      
      // Reset form
      resetForm()
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (goal: IdentityGoal) => {
    setEditingGoal(goal)
    setFormData({
      identityAreaId,
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit || '',
      goalType: goal.goalType,
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      color: goal.color,
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar la meta "${title}"?`)) return

    setLoading(true)
    setError(null)
    
    try {
      await identityGoalsApi.delete(id)
      const updatedGoals = goals.filter(goal => goal.id !== id)
      onGoalsChange(updatedGoals)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async (goal: IdentityGoal, newValue: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedGoal = await identityGoalsApi.updateProgress(goal.id, { 
        currentValue: newValue 
      })
      
      const updatedGoals = goals.map(g => 
        g.id === goal.id ? updatedGoal : g
      )
      onGoalsChange(updatedGoals)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      identityAreaId,
      title: '',
      description: '',
      targetValue: undefined,
      currentValue: undefined,
      unit: '',
      goalType: 'EXACT',
      targetDate: '',
      color: identityAreaColor,
    })
    setShowCreateForm(false)
    setEditingGoal(null)
    setError(null)
  }

  const calculateProgress = (goal: IdentityGoal): number => {
    if (!goal.targetValue || !goal.currentValue) return 0
    
    switch (goal.goalType) {
      case 'BELOW':
        // For "below" goals, progress is how close we are to being under target
        if (goal.currentValue <= goal.targetValue) return 100
        return Math.max(0, 100 - ((goal.currentValue - goal.targetValue) / goal.targetValue) * 100)
      
      case 'ABOVE':
        // For "above" goals, progress is how much we've exceeded the target
        if (goal.currentValue >= goal.targetValue) return 100
        return Math.max(0, (goal.currentValue / goal.targetValue) * 100)
      
      case 'EXACT':
      default:
        // For exact goals, progress towards the target
        return Math.min(100, (goal.currentValue / goal.targetValue) * 100)
    }
  }

  const formatGoalDescription = (goal: IdentityGoal): string => {
    if (goal.goalType === 'QUALITATIVE') {
      return goal.title
    }
    
    const current = goal.currentValue ?? 0
    const target = goal.targetValue ?? 0
    const unit = goal.unit || ''
    
    switch (goal.goalType) {
      case 'BELOW':
        return `${current}${unit} / <${target}${unit}`
      case 'ABOVE':
        return `${current}${unit} / >${target}${unit}`
      case 'EXACT':
      default:
        return `${current}${unit} / ${target}${unit}`
    }
  }

  const goalTypeOptions: { value: GoalType; label: string; description: string }[] = [
    { value: 'EXACT', label: 'Exacto', description: 'Alcanzar un valor específico' },
    { value: 'ABOVE', label: 'Mínimo', description: 'Superar un valor mínimo' },
    { value: 'BELOW', label: 'Máximo', description: 'Mantenerse por debajo de un valor' },
    { value: 'QUALITATIVE', label: 'Cualitativo', description: 'Meta sin valor numérico' },
  ]

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700">Metas Direccionales</h4>
        <button
          onClick={() => setShowCreateForm(true)}
          className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors"
        >
          + Meta
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 mb-3">
            {editingGoal ? 'Editar Meta' : 'Nueva Meta'}
          </h5>
          
          <form onSubmit={handleCreateOrUpdate} className="space-y-3">
            <div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Título de la meta (ej: Pesar 90kg)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción opcional"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  value={formData.goalType}
                  onChange={(e) => setFormData({...formData, goalType: e.target.value as GoalType})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {goalTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.goalType !== 'QUALITATIVE' && (
                <div>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="Unidad (kg, mg/dl, USD)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {formData.goalType !== 'QUALITATIVE' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetValue || ''}
                    onChange={(e) => setFormData({...formData, targetValue: e.target.value ? Number(e.target.value) : undefined})}
                    placeholder="Valor objetivo"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentValue || ''}
                    onChange={(e) => setFormData({...formData, currentValue: e.target.value ? Number(e.target.value) : undefined})}
                    placeholder="Valor actual"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="bg-green-600 text-white px-4 py-2 text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : editingGoal ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 text-sm rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-xs">Sin metas direccionales</p>
          <p className="text-xs text-gray-400">Las metas dan dirección a tus sistemas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {goals.map((goal) => {
            const progress = calculateProgress(goal)
            
            return (
              <div key={goal.id} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h6 className="text-sm font-medium text-gray-900">{goal.title}</h6>
                    {goal.description && (
                      <p className="text-xs text-gray-600 mt-1">{goal.description}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-gray-400 hover:text-blue-600 p-1 text-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id, goal.title)}
                      className="text-gray-400 hover:text-red-600 p-1 text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {goal.goalType !== 'QUALITATIVE' && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">
                        {formatGoalDescription(goal)}
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>

                    {/* Quick progress update */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Actualizar:</span>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={goal.currentValue || 0}
                        onBlur={(e) => {
                          const newValue = Number(e.target.value)
                          if (newValue !== goal.currentValue) {
                            handleUpdateProgress(goal, newValue)
                          }
                        }}
                        className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-600">{goal.unit}</span>
                    </div>
                  </>
                )}

                {goal.targetDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    📅 {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                )}

                {goal.isAchieved && (
                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    ✅ Completada
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default IdentityGoals