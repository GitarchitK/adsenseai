import { Skeleton } from '@/components/ui/skeleton'

export default function AIToolsLoading() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-3xl space-y-5">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-2xl" />
      ))}
    </div>
  )
}
