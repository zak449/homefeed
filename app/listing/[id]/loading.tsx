export default function ListingDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Back link skeleton */}
      <div className="h-4 w-14 rounded skeleton mb-5" />

      {/* Photo skeleton */}
      <div className="aspect-[16/10] rounded-card skeleton mb-4" />

      {/* Price + Address skeleton */}
      <div className="mb-4">
        <div className="h-8 w-40 rounded skeleton mb-2" />
        <div className="h-4 w-64 rounded skeleton mb-1" />
        <div className="h-3 w-48 rounded skeleton" />
      </div>

      {/* Comments section skeleton */}
      <div className="mb-6 pt-4 border-t border-divider">
        <div className="h-6 w-40 rounded skeleton mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 mb-5">
            <div className="w-10 h-10 rounded-avatar skeleton shrink-0" />
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
