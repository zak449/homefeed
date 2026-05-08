"use client";
import { AvatarGradient } from "./AvatarGradient";

export function Avatar({
  src,
  seed,
  label,
  size = 48,
  className = "",
}: {
  src?: string | null;
  seed: string;
  label?: string;
  size?: number;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={label ?? seed}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return <AvatarGradient seed={seed} label={label} size={size} className={className} />;
}
