export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-ash-200/80 ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-ash-200 bg-white p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-8 w-28 mt-2" />
    </div>
  )
}

export default Skeleton
