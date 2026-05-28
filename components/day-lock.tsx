'use client'

import React from 'react'
import { Lock } from 'lucide-react'
import type { RoadmapDay } from '@/lib/firebase-types'

interface DayLockProps {
  day: number
  task?: RoadmapDay
}

export function DayLock({ day, task }: DayLockProps) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex items-center gap-4 opacity-75">
      <div className="bg-gray-200 p-3 rounded-full text-gray-500">
        <Lock className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
          Day {day}
        </div>
        <div className="text-sm font-medium text-gray-700">
          {task ? task.title : 'Task Locked'}
        </div>
      </div>
    </div>
  )
}
