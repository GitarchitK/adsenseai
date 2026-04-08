import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function ScoreBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-600 dark:text-green-400'
    if (s >= 75) return 'text-blue-600 dark:text-blue-400'
    if (s >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBgColor = (s: number) => {
    if (s >= 90) return 'bg-green-50 dark:bg-green-950'
    if (s >= 75) return 'bg-blue-50 dark:bg-blue-950'
    if (s >= 60) return 'bg-yellow-50 dark:bg-yellow-950'
    return 'bg-red-50 dark:bg-red-950'
  }

  const getLabel = (s: number) => {
    if (s >= 90) return 'Excellent'
    if (s >= 75) return 'Good'
    if (s >= 60) return 'Fair'
    return 'Needs Work'
  }

  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-2xl',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold',
          sizeClasses[size],
          getBgColor(score),
          getColor(score)
        )}
      >
        {score}
      </div>
      {showLabel && (
        <p className={cn('text-xs font-medium', getColor(score))}>
          {getLabel(score)}
        </p>
      )}
    </div>
  )
}
