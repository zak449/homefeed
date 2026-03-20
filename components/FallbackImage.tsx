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
        className={`${className ?? ""} bg-gradient-to-br from-orange-50 via-gray-50 to-gray-100 flex items-center justify-center`}
        style={style}
      >
        <div className="text-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="mx-auto text-[#FF6B2C]/25"
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
          <p className="text-[10px] text-gray-400 mt-1 font-medium">
            No photo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ""}`} style={style}>
      {/* Skeleton placeholder while loading */}
      {!loaded && (
        <div className="absolute inset-0 skeleton" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
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
    </div>
  );
}
