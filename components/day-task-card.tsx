'use client'

import React from 'react'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RoadmapDay } from '@/lib/firebase-types'

interface DayTaskCardProps {
  task: RoadmapDay
  day: number
  isCompleting: boolean
  onComplete: () => void
}

export function DayTaskCard({ task, day, isCompleting, onComplete }: DayTaskCardProps) {
  const priorityColor =
    task.priority === 'high' ? 'text-red-600 bg-red-100 border-red-200'
    : task.priority === 'medium' ? 'text-amber-600 bg-amber-100 border-amber-200'
    : 'text-green-600 bg-green-100 border-green-200'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 px-6 py-4">
        <div className="text-indigo-100 text-sm font-medium mb-1">TODAY — Day {day}</div>
        <h2 className="text-xl font-bold text-white">{task.title}</h2>
      </div>

      <div className="p-6">
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          <span className="font-semibold text-gray-700 uppercase tracking-wider text-xs bg-gray-100 px-2 py-1 rounded">
            {task.category}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${priorityColor}`}>
            {task.priority} Priority
          </span>
          <span className="text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            ~{task.estimatedMinutes} min
          </span>
        </div>

        {/* Why it matters */}
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mb-6">
          <p className="text-sm font-bold text-indigo-700 mb-1">Why this matters</p>
          <p className="text-sm text-indigo-900">{task.whyItMatters}</p>
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Steps</h3>
          <ul className="space-y-4">
            {task.instructions.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Success Criteria */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <p className="text-sm font-bold text-green-700 flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4" />
            You're done when:
          </p>
          <p className="text-sm text-green-800 ml-6">{task.successCriteria}</p>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <Button
            onClick={onComplete}
            disabled={isCompleting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 px-8 py-6 text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            {isCompleting ? 'Marking as Done...' : '✓ Mark as Done'}
          </Button>
        </div>
      </div>
    </div>
  )
}
