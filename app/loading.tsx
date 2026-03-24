export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Search bar skeleton */}
      <div className="mb-8">
        <div className="h-12 rounded-full skeleton" />
        <div className="flex items-center gap-2 mt-2">
          <div className="h-7 w-12 rounded-full skeleton" />
          <div className="h-7 w-12 rounded-full skeleton" />
          <div className="h-7 w-14 rounded-full skeleton" />
        </div>
      </div>

      {/* Results header skeleton */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="h-3 w-24 rounded skeleton mb-2" />
            <div className="h-6 w-40 rounded skeleton" />
          </div>
          <div className="flex gap-1">
            <div className="h-7 w-14 rounded-full skeleton" />
            <div className="h-7 w-20 rounded-full skeleton" />
            <div className="h-7 w-14 rounded-full skeleton" />
          </div>
        </div>
      </div>

      {/* Syncing indicator */}
      <div className="flex items-center gap-2.5 mb-6 px-4 py-3 bg-surface border border-divider rounded-xl">
        <div className="w-4 h-4 border-2 border-amber/30 border-t-amber rounded-full animate-spin shrink-0" />
        <span className="text-sm text-secondary">Searching for listings...</span>
      </div>

      {/* Grid skeleton — 6 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-card overflow-hidden">
            <div className="aspect-[4/3] skeleton" />
            <div className="pt-3 pb-2 space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="h-5 w-28 rounded skeleton" />
                <div className="h-4 w-16 rounded skeleton" />
              </div>
              <div className="h-4 w-3/4 rounded skeleton" />
              <div className="flex items-center gap-3">
                <div className="h-3 w-10 rounded skeleton" />
                <div className="h-3 w-10 rounded skeleton" />
                <div className="h-3 w-16 rounded skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
