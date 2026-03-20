"use client";

import { useState, useCallback } from "react";

export default function FallbackImage({
  src,
  alt,
  className,
  loading,
  onClick,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  style?: React.CSSProperties;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [triedProxy, setTriedProxy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  if (failed) {
    return (
      <div
        className={`${className ?? ""} bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 flex items-center justify-center`}
        style={style}
      >
        <div className="text-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="mx-auto text-stone-300"
          >
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="9 22 9 12 15 12 15 22"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[10px] text-stone-400 mt-1 font-medium">
            No photo
          </p>
        </div>
      </div>
    );
  }

  // Render img directly with className — no wrapper div
  // This ensures the img gets the exact positioning/sizing from the parent
  return (
    <>
      {/* Skeleton shown behind while loading */}
      {!loaded && (
        <div className={`${className ?? ""} skeleton`} style={style} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className ?? ""} transition-opacity duration-400 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={style}
        loading={loading}
        onClick={onClick}
        onLoad={handleLoad}
        onError={() => {
          if (!triedProxy && src.includes("rdcpix.com")) {
            setTriedProxy(true);
            setImgSrc(`/api/photo-proxy?url=${encodeURIComponent(src)}`);
          } else {
            setFailed(true);
          }
        }}
      />
    </>
  );
}
