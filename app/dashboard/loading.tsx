import { Skeleton } from "@/app/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Trial Banner Skeleton */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Connected Accounts Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="p-12 flex flex-col items-center">
          <Skeleton className="w-16 h-16 rounded-full mb-4" />
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <Skeleton className="h-12 w-44" />
        </div>
      </div>
    </div>
  );
}
