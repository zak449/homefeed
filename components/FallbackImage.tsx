"use client";

import { useState, useRef, useEffect } from "react";

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
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image was already loaded from cache before React attached handlers
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [imgSrc]);

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

  return (
    <>
      {!loaded && (
        <div className={`${className ?? ""} skeleton`} style={style} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        className={`${className ?? ""} transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={style}
        loading={loading}
        onClick={onClick}
        onLoad={() => setLoaded(true)}
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
