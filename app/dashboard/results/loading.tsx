import { Skeleton } from '@/components/ui/skeleton'

export default function ResultsLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>

      {/* Tabs */}
      <Skeleton className="h-12 rounded-2xl" />

      {/* Score card */}
      <Skeleton className="h-64 rounded-3xl" />

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
