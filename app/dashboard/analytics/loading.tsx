import { Skeleton } from "@/app/components/ui/Skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center py-8">
            <Skeleton className="w-12 h-12 rounded-full mb-4" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
