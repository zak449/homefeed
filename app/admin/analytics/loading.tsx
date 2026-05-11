export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10">
      <div className="mb-8">
        <div className="h-8 w-64 rounded bg-gray-800 animate-pulse mb-2" />
        <div className="h-4 w-40 rounded bg-gray-900 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-24 animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-24 animate-pulse"
          />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-64 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
