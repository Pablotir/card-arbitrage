'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { getProxiedImageUrl } from '@/utils/format';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export function SafeImage({ src, alt, className = '', fallbackText = 'No Image' }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [triedDirect, setTriedDirect] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 rounded-lg p-2 text-center select-none">
        <ImageOff className="w-5 h-5 mb-1 opacity-50" />
        <span className="text-[10px] font-medium leading-tight line-clamp-1">{fallbackText}</span>
      </div>
    );
  }

  // First try the local proxy to bypass CORS / hotlinking / tracking blockers.
  // If the proxy fails for any reason, fallback to direct URL before finally showing error.
  const displaySrc = triedDirect ? src : getProxiedImageUrl(src);

  return (
    <img
      src={displaySrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!triedDirect && src.startsWith('http')) {
          setTriedDirect(true);
        } else {
          setHasError(true);
        }
      }}
      className={className}
    />
  );
}
