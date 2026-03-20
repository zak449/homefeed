export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Hero skeleton */}
      <div className="mb-8 sm:mb-12">
        <div className="h-10 sm:h-14 w-72 sm:w-96 rounded-lg skeleton mb-3" />
        <div className="h-5 w-64 rounded skeleton mb-2" />
        <div className="h-4 w-48 rounded skeleton" />

        {/* Stats row skeleton */}
        <div className="flex items-center gap-5 mt-5">
          <div className="h-8 w-40 rounded-full skeleton" />
          <div className="h-4 w-28 rounded skeleton" />
          <div className="h-4 w-32 rounded skeleton" />
        </div>

        {/* Activity ticker skeleton */}
        <div className="mt-6 rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-tag/50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full skeleton" />
            <div className="h-3 w-20 rounded skeleton" />
          </div>
          <div className="flex gap-4 py-3 px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <div className="h-3 w-16 rounded skeleton" />
                <div className="h-3 w-32 rounded skeleton" />
                <div className="h-3 w-20 rounded skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location banner skeleton */}
      <div className="mb-6 h-12 rounded-xl skeleton" />

      {/* Mode toggle skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-1 bg-ink/[0.04] rounded-2xl p-1.5 mb-4 w-fit">
          <div className="h-9 w-28 rounded-xl skeleton" />
          <div className="h-9 w-20 rounded-xl skeleton" />
          <div className="h-9 w-20 rounded-xl skeleton" />
        </div>
        <div className="flex items-end justify-between mt-4">
          <div className="h-8 w-32 rounded skeleton" />
          <div className="flex gap-1">
            <div className="h-7 w-14 rounded-lg skeleton" />
            <div className="h-7 w-24 rounded-lg skeleton" />
            <div className="h-7 w-16 rounded-lg skeleton" />
            <div className="h-7 w-18 rounded-lg skeleton" />
          </div>
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 h-10 rounded-lg skeleton" />
        <div className="h-10 w-20 rounded-lg skeleton" />
        <div className="h-10 w-10 rounded-lg skeleton" />
      </div>

      {/* Grid of 6 skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            {/* Photo placeholder */}
            <div className="aspect-[4/3] rounded-xl skeleton" />

            {/* Info placeholder */}
            <div className="pt-3 pb-1 space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="h-4 w-24 rounded skeleton" />
                <div className="h-5 w-12 rounded skeleton" />
              </div>
              <div className="h-3.5 w-3/4 rounded skeleton" />
              <div className="h-3 w-1/2 rounded skeleton" />
              <div className="flex items-center gap-2 mt-1.5">
                <div className="h-3 w-10 rounded skeleton" />
                <div className="h-3 w-10 rounded skeleton" />
                <div className="h-3 w-16 rounded skeleton" />
              </div>
              {/* Comment placeholder */}
              <div className="mt-2.5 rounded-lg skeleton h-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
