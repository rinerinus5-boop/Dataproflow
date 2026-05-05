export function TemplateSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200"></div>
      <div className="p-5">
        <div className="h-5 w-16 bg-gray-200 rounded mb-3"></div>
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function TemplateSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => <TemplateSkeleton key={i} />)}
    </div>
  );
}
