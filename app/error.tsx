"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Page Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">🏠</div>
        <h2 className="text-xl font-bold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-[#888] text-sm mb-6">
          We hit a snag loading this page. This is usually temporary.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-full bg-[#FF4D00] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-full border border-[#2A2A2A] text-sm text-[#888] hover:text-white hover:border-[#444] transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
