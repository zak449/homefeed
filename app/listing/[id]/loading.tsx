export default function ListingDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Breadcrumbs skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3 w-16 rounded skeleton" />
        <div className="h-3 w-3 rounded skeleton" />
        <div className="h-3 w-20 rounded skeleton" />
        <div className="h-3 w-3 rounded skeleton" />
        <div className="h-3 w-32 rounded skeleton" />
      </div>

      {/* Back link skeleton */}
      <div className="h-4 w-14 rounded skeleton mb-5" />

      {/* Photo gallery skeleton */}
      <div className="mb-4 rounded-xl overflow-hidden">
        <div className="aspect-[4/3] skeleton" />
        {/* Thumbnail row */}
        <div className="flex gap-2 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-16 h-16 rounded-lg skeleton shrink-0" />
          ))}
        </div>
      </div>

      {/* Price + Address skeleton */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-8 w-40 rounded skeleton mb-2" />
            <div className="h-4 w-56 rounded skeleton mb-1" />
            <div className="h-4 w-44 rounded skeleton" />
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="h-6 w-16 rounded-md skeleton" />
            <div className="h-6 w-16 rounded-md skeleton" />
          </div>
        </div>
      </div>

      {/* Key facts bar skeleton */}
      <div className="flex mb-4 rounded-lg border border-border divide-x divide-border overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 py-2.5 px-3 text-center">
            <div className="h-5 w-10 mx-auto rounded skeleton mb-1" />
            <div className="h-3 w-8 mx-auto rounded skeleton" />
          </div>
        ))}
      </div>

      {/* Save/Share + Activity skeleton */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 rounded-lg skeleton" />
          <div className="h-8 w-16 rounded-lg skeleton" />
        </div>
        <div className="flex gap-3">
          <div className="h-4 w-24 rounded skeleton" />
          <div className="h-4 w-24 rounded skeleton" />
        </div>
      </div>

      {/* Map section skeleton */}
      <div className="mb-5">
        <div className="h-4 w-20 rounded skeleton mb-2" />
        <div className="h-40 rounded-xl skeleton mb-3" />
        <div className="flex gap-3">
          <div className="h-8 w-24 rounded-lg skeleton" />
          <div className="h-8 w-24 rounded-lg skeleton" />
          <div className="h-8 w-20 rounded-lg skeleton" />
        </div>
      </div>

      {/* Description skeleton */}
      <div className="mb-6">
        <div className="h-4 w-36 rounded skeleton mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded skeleton" />
          <div className="h-3 w-full rounded skeleton" />
          <div className="h-3 w-3/4 rounded skeleton" />
        </div>
      </div>

      {/* Comments section skeleton */}
      <div className="mb-6 border-t border-border pt-5">
        <div className="h-5 w-32 rounded skeleton mb-4" />
        {/* Comment input skeleton */}
        <div className="h-24 rounded-xl skeleton mb-4" />
        {/* Comment skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 mb-4">
            <div className="w-9 h-9 rounded-full skeleton shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 w-24 rounded skeleton mb-2" />
              <div className="h-3 w-full rounded skeleton mb-1" />
              <div className="h-3 w-2/3 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
