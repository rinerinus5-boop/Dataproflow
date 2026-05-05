import { Skeleton } from "@/app/components/ui/Skeleton";

export default function ConnectionsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Available Platforms Skeleton */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
