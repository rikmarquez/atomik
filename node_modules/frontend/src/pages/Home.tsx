import React from 'react'

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Atomic Systems
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Build better habits through systems, not goals
      </p>
      <div className="space-x-4">
        <a
          href="/register"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>
        <a
          href="/login"
          className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Login
        </a>
      </div>
    </div>
  )
}

export default Home