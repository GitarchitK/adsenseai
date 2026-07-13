'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { DayTaskCard } from '@/components/day-task-card'
import { PlanProgress } from '@/components/plan-progress'
import { DayLock } from '@/components/day-lock'
import { CheckCircle } from 'lucide-react'
import type { UserPlan } from '@/lib/firebase-types'

export default function PlanPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<UserPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlan = async () => {
      const user = auth.currentUser
      const guestId = typeof window !== 'undefined' ? localStorage.getItem('adsense_guest_id') : null
      if (!user && !guestId) {
        router.push('/')
        return
      }

      try {
        const token = user ? await user.getIdToken() : null
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        if (guestId) headers['x-guest-id'] = guestId
        
        // First get profile to find activePlanId
        const profileRes = await fetch('/api/profile', { headers })
        const data = await profileRes.json()
        const profile = data.profile
        
        if (!profile?.activePlanId) {
          router.push('/dashboard')
          return
        }

        const planRes = await fetch(`/api/plans/${profile.activePlanId}`, { headers })

        if (!planRes.ok) {
          throw new Error('Failed to fetch plan')
        }

        const planData = await planRes.json()
        setPlan(planData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    // Wait for auth state to initialize
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchPlan()
      } else {
        const guestId = typeof window !== 'undefined' ? localStorage.getItem('adsense_guest_id') : null
        if (guestId) {
          fetchPlan()
        } else {
          router.push('/')
        }
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleCompleteDay = async (day: number) => {
    if (!plan) return
    setCompleting(true)
    
    try {
      const user = auth.currentUser
      const guestId = typeof window !== 'undefined' ? localStorage.getItem('adsense_guest_id') : null
      const token = user ? await user.getIdToken() : null
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (guestId) headers['x-guest-id'] = guestId

      const res = await fetch(`/api/plans/${plan.planId}/complete-day`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ day })
      })

      if (!res.ok) throw new Error('Failed to mark day as completed')
      
      // Update local state
      setPlan({
        ...plan,
        completedDays: [...plan.completedDays, day]
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error completing day')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your coaching plan...</div>
  }

  if (error || !plan) {
    return <div className="p-8 text-center text-red-500">{error ?? 'Plan not found'}</div>
  }

  const { currentDay, totalDays, roadmap, completedDays } = plan
  const initialScore = (plan.crawlHistory[0] as any)?.scores?.final_score ?? 0
  const currentScore = (plan.crawlHistory[plan.crawlHistory.length - 1] as any)?.scores?.final_score ?? initialScore
  const scoreDelta = currentScore - initialScore

  const todayTask = roadmap.find(d => d.day === currentDay)
  const isTodayCompleted = completedDays.includes(currentDay)
  
  const pastDays = roadmap.filter(d => d.day < currentDay)
  const futureDays = roadmap.filter(d => d.day > currentDay)
  
  const daysUntilRecrawl = 5 - (currentDay % 5)
  const showCompletionScreen = currentDay > totalDays

  if (showCompletionScreen) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">You're ready for AdSense!</h1>
          <p className="text-lg text-gray-600 mb-8">
            You've completed your {totalDays}-day improvement roadmap. Your final score is {currentScore}/100.
            It's time to submit your application.
          </p>
          <a 
            href="https://adsense.google.com/start/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Apply to AdSense
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <PlanProgress 
        currentDay={currentDay}
        totalDays={totalDays}
        currentScore={currentScore}
        scoreDelta={scoreDelta}
      />

      <div className="mb-12">
        {todayTask ? (
          isTodayCompleted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Great job today!</h3>
              <p className="text-green-700">You've completed Day {currentDay}. Come back tomorrow for your next task.</p>
            </div>
          ) : (
            <DayTaskCard 
              task={todayTask} 
              day={currentDay}
              isCompleting={completing}
              onComplete={() => handleCompleteDay(currentDay)}
            />
          )
        ) : (
          <div className="p-8 text-center text-gray-500">No task found for today.</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Completed Days</h3>
          {pastDays.length === 0 ? (
            <p className="text-gray-500 text-sm">No days completed yet.</p>
          ) : (
            <div className="space-y-3">
              {pastDays.map(d => (
                <div key={d.day} className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium">Day {d.day}:</span>
                  <span className="truncate">{d.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Upcoming</h3>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              Next re-crawl in {daysUntilRecrawl} {daysUntilRecrawl === 1 ? 'day' : 'days'}
            </span>
          </div>
          
          <div className="space-y-3">
            {futureDays.slice(0, 5).map(d => (
              <DayLock key={d.day} day={d.day} task={d} />
            ))}
            {futureDays.length > 5 && (
              <div className="text-center text-sm text-gray-500 pt-2">
                + {futureDays.length - 5} more days
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
