export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header placeholder */}
      <div className="mb-6 sm:mb-8">
        <div className="h-4 w-48 rounded skeleton mb-3" />
        <div className="h-8 w-36 rounded skeleton" />
      </div>

      {/* Grid of 6 skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden border border-border shadow-card"
          >
            {/* Photo placeholder */}
            <div className="aspect-[4/3] skeleton" />

            {/* Info placeholder */}
            <div className="p-3.5 space-y-2.5">
              <div className="h-4 w-3/4 rounded skeleton" />
              <div className="h-3 w-1/2 rounded skeleton" />
              <div className="flex items-center gap-3 mt-2.5">
                <div className="h-3 w-10 rounded skeleton" />
                <div className="h-3 w-10 rounded skeleton" />
                <div className="h-3 w-16 rounded skeleton" />
                <div className="h-3 w-14 rounded skeleton ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
