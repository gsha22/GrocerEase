"use client";

import Image from "next/image";
import { useState } from "react";

function hueFromSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h + seed.charCodeAt(i) * (i + 17)) % 360;
  }
  return h;
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7V6a4 4 0 118 0v1M4 7h16l-1.4 12.1A2 2 0 0116.6 21H7.4a2 2 0 01-1.98-1.79L4 7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11v3M15 11v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ListingPhotoFallback({
  title,
  seed,
  variant = "card",
}: {
  title: string;
  seed: string;
  variant?: "card" | "thumb";
}) {
  const hue = hueFromSeed(seed);
  const hue2 = (hue + 38) % 360;
  const bg = `linear-gradient(145deg, hsl(${hue} 26% 91%) 0%, hsl(${hue2} 22% 84%) 100%)`;

  if (variant === "thumb") {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: bg }}
        title={title}
      >
        <BagIcon className="size-5 text-stone-500/85" />
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-6 text-center"
      style={{ background: bg }}
      role="img"
      aria-label={title}
    >
      <BagIcon className="size-9 text-stone-500/75" />
      <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-stone-800">
        {title}
      </p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500/90">
        Photo unavailable
      </p>
    </div>
  );
}

type ListingPhotoProps = {
  src: string;
  alt: string;
  /** Stable id or string for consistent placeholder colors */
  seed: string;
  sizes: string;
  variant?: "card" | "thumb";
  className?: string;
};

function ListingPhotoInner({
  src,
  alt,
  seed,
  sizes,
  variant = "card",
  className,
}: ListingPhotoProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = src?.trim() ?? "";

  if (!trimmed || failed) {
    return <ListingPhotoFallback title={alt} seed={seed} variant={variant} />;
  }

  return (
    <Image
      src={trimmed}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

/** Remote listing image with gradient + icon fallback when URL is empty or fails to load. */
export default function ListingPhoto(props: ListingPhotoProps) {
  const trimmed = props.src?.trim() ?? "";
  return <ListingPhotoInner key={trimmed} {...props} />;
}
