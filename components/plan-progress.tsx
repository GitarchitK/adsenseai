'use client'

import React from 'react'

interface PlanProgressProps {
  currentDay: number
  totalDays: number
  currentScore: number
  scoreDelta: number
}

export function PlanProgress({ currentDay, totalDays, currentScore, scoreDelta }: PlanProgressProps) {
  // Clamp percentage between 0 and 100
  const percentage = Math.max(0, Math.min(100, Math.round(((currentDay - 1) / totalDays) * 100)))
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Your AdSense Readiness Journey</h2>
          <p className="text-gray-500 text-sm">
            Day {Math.min(currentDay, totalDays)} of {totalDays}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-gray-900">{typeof currentScore === 'object' && currentScore !== null && 'score' in currentScore ? (currentScore as any).score : currentScore}/100</div>
          {scoreDelta > 0 && (
            <div className="text-sm font-semibold text-green-600">+{scoreDelta} since start</div>
          )}
          {scoreDelta < 0 && (
            <div className="text-sm font-semibold text-red-600">{scoreDelta} since start</div>
          )}
          {scoreDelta === 0 && (
            <div className="text-sm text-gray-400">Score unchanged</div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-semibold text-gray-400 text-right">
        {percentage}% Complete
      </div>
    </div>
  )
}
