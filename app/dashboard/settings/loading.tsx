import { Skeleton } from "@/app/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Profile Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Subscription Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Security Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
