import { Skeleton } from "@/app/components/ui/Skeleton";

export default function PlansLoading() {
  return (
    <div className="space-y-8">
      {/* Current Plan Card Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </div>

      {/* Billing Toggle Skeleton */}
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-7 w-14 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Plans Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <Skeleton className="w-12 h-12 rounded-xl mb-4" />
            <Skeleton className="h-6 w-28 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex items-baseline gap-1 mb-6">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="space-y-3 mb-6">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Invoices Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
