import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

interface OnboardingStep {
  id: number
  title: string
  description: string
  content: React.ReactNode
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    identityStatement: '',
    firstArea: '',
    firstSystem: '',
    motivation: ''
  })
  
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding and redirect to dashboard
      navigate('/dashboard')
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to Atomic Systems! 🚀",
      description: "Let's get you started on your journey to building better habits through systems, not goals.",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-8xl mb-6">⚡</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Hello {user?.name}!
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              You're about to discover the power of atomic systems - small, consistent actions that compound into extraordinary results.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-3">🧠 The Atomic Mindset</h4>
            <ul className="space-y-2 text-blue-800">
              <li>• Focus on <strong>systems</strong>, not goals</li>
              <li>• Build <strong>identity</strong>, not just habits</li>
              <li>• Improve by <strong>1%</strong> daily</li>
              <li>• Design your <strong>environment</strong> for success</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              This quick setup will take just 3 minutes and set you up for success.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Define Your Identity 🎯",
      description: "Every system starts with identity. Who do you want to become?",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-semibold text-purple-900 mb-3">💭 Identity-Based Habits</h4>
            <p className="text-purple-800 mb-4">
              Instead of "I want to read more" say <strong>"I am someone who reads daily"</strong>
            </p>
            <p className="text-sm text-purple-700">
              Every action you take is a vote for the type of person you wish to become.
            </p>
          </div>

          <div>
            <label htmlFor="identityStatement" className="block text-sm font-medium text-gray-700 mb-2">
              Complete this statement: "I am someone who..."
            </label>
            <textarea
              id="identityStatement"
              rows={3}
              value={formData.identityStatement}
              onChange={(e) => updateFormData('identityStatement', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Example: reads daily, exercises consistently, builds meaningful relationships..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <h5 className="font-medium text-green-800 mb-1">✅ Good Examples:</h5>
              <ul className="text-green-700 space-y-1">
                <li>• "I am someone who reads 10 pages daily"</li>
                <li>• "I am someone who moves my body every morning"</li>
                <li>• "I am someone who writes thoughts daily"</li>
              </ul>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <h5 className="font-medium text-red-800 mb-1">❌ Avoid:</h5>
              <ul className="text-red-700 space-y-1">
                <li>• "I want to read more books"</li>
                <li>• "I should exercise"</li>
                <li>• "I will be more productive"</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Choose Your First Area 🌟",
      description: "Select one life area to focus on first. You can add more later.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '💪', label: 'Health & Fitness', value: 'health' },
              { icon: '🧠', label: 'Learning & Growth', value: 'learning' },
              { icon: '💼', label: 'Career & Work', value: 'career' },
              { icon: '❤️', label: 'Relationships', value: 'relationships' },
              { icon: '💰', label: 'Finance', value: 'finance' },
              { icon: '🎨', label: 'Creativity', value: 'creativity' },
              { icon: '🧘', label: 'Mindfulness', value: 'mindfulness' },
              { icon: '🏠', label: 'Home & Environment', value: 'home' },
              { icon: '🌱', label: 'Personal Development', value: 'development' }
            ].map((area) => (
              <button
                key={area.value}
                onClick={() => updateFormData('firstArea', area.value)}
                className={`p-4 rounded-lg border-2 transition-colors text-center ${
                  formData.firstArea === area.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{area.icon}</div>
                <div className="text-sm font-medium">{area.label}</div>
              </button>
            ))}
          </div>

          {formData.firstArea && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Great choice! 🎉</h4>
              <p className="text-blue-800 text-sm">
                Focusing on one area allows you to build momentum and see real progress. 
                You can always add more areas once this system becomes automatic.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 4,
      title: "Create Your First System ⚡",
      description: "Define a simple, daily system that aligns with your identity.",
      content: (
        <div className="space-y-6">
          <div>
            <label htmlFor="firstSystem" className="block text-sm font-medium text-gray-700 mb-2">
              What's one small action you'll take daily?
            </label>
            <input
              type="text"
              id="firstSystem"
              value={formData.firstSystem}
              onChange={(e) => updateFormData('firstSystem', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Example: Read 10 pages, Do 10 push-ups, Write 3 sentences..."
            />
          </div>

          <div>
            <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
              Why is this important to you?
            </label>
            <textarea
              id="motivation"
              rows={3}
              value={formData.motivation}
              onChange={(e) => updateFormData('motivation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your personal why will help you stay consistent..."
            />
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-3">🏗️ The 4 Laws of Behavior Change</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-green-800">Make it Obvious</h5>
                <p className="text-green-700">Design your environment for success</p>
              </div>
              <div>
                <h5 className="font-medium text-green-800">Make it Attractive</h5>
                <p className="text-green-700">Pair with something you enjoy</p>
              </div>
              <div>
                <h5 className="font-medium text-green-800">Make it Easy</h5>
                <p className="text-green-700">Start with 2-minute version</p>
              </div>
              <div>
                <h5 className="font-medium text-green-800">Make it Satisfying</h5>
                <p className="text-green-700">Track progress and celebrate</p>
              </div>
            </div>
          </div>

          {formData.firstSystem && formData.motivation && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Your System Preview</h4>
              <p className="text-blue-800 text-sm">
                <strong>Identity:</strong> I am someone who {formData.identityStatement}
                <br />
                <strong>Daily System:</strong> {formData.firstSystem}
                <br />
                <strong>Area:</strong> {formData.firstArea}
              </p>
            </div>
          )}
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep - 1]
  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentStepData.title}
          </h2>
          <p className="text-lg text-gray-600">
            {currentStepData.description}
          </p>
        </div>

        <div className="mb-8">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 2 && !formData.identityStatement.trim()) ||
              (currentStep === 3 && !formData.firstArea) ||
              (currentStep === 4 && (!formData.firstSystem.trim() || !formData.motivation.trim()))
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 4 ? 'Complete Setup 🎉' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding