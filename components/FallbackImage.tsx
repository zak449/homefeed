"use client";

export default function FallbackImage({
  src,
  alt,
  className,
  loading,
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
