export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero skeleton */}
      <div className="mb-8">
        <div className="h-12 w-72 rounded skeleton mb-2" />
        <div className="h-12 w-56 rounded skeleton mb-3" />
        <div className="h-4 w-64 rounded skeleton" />
      </div>

      {/* Search bar skeleton */}
      <div className="mb-8">
        <div className="h-12 rounded-full skeleton" />
      </div>

      {/* Feed skeleton -- 3 items */}
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[16/10] rounded-card skeleton" />
            <div className="pt-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="h-5 w-28 rounded skeleton" />
                <div className="h-4 w-16 rounded skeleton" />
              </div>
              <div className="h-4 w-3/4 rounded skeleton" />
              <div className="h-3 w-1/2 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
