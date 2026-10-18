'use client';

import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { getProxiedImageUrl } from '@/utils/format';

interface SafeImageProps {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export function SafeImage({
  src,
  fallbackSrc,
  alt,
  className = '',
  fallbackText = 'No Image'
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [triedDirect, setTriedDirect] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [triedFallbackDirect, setTriedFallbackDirect] = useState(false);

  // Crucial: Reset states when image props change so new search results re-trigger load
  useEffect(() => {
    setHasError(false);
    setTriedDirect(false);
    setUsingFallback(false);
    setTriedFallbackDirect(false);
  }, [src, fallbackSrc]);

  const activeUrl = usingFallback ? fallbackSrc : src;

  if (!activeUrl || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 rounded-lg p-2 text-center select-none border border-dashed border-gray-200 dark:border-gray-700">
        <ImageOff className="w-5 h-5 mb-1 opacity-50" />
        <span className="text-[10px] font-medium leading-tight line-clamp-2 px-1">{fallbackText || alt}</span>
      </div>
    );
  }

  // Determine current display URL:
  // 1. Try proxied primary src
  // 2. Try direct primary src
  // 3. Try proxied fallbackSrc
  // 4. Try direct fallbackSrc
  let displaySrc: string;
  if (!usingFallback) {
    displaySrc = triedDirect ? activeUrl : getProxiedImageUrl(activeUrl);
  } else {
    displaySrc = triedFallbackDirect ? activeUrl : getProxiedImageUrl(activeUrl);
  }

  const handleError = () => {
    if (!usingFallback) {
      if (!triedDirect && activeUrl.startsWith('http')) {
        setTriedDirect(true);
      } else if (fallbackSrc && fallbackSrc !== src) {
        setUsingFallback(true);
      } else {
        setHasError(true);
      }
    } else {
      if (!triedFallbackDirect && activeUrl.startsWith('http')) {
        setTriedFallbackDirect(true);
      } else {
        setHasError(true);
      }
    }
  };

  return (
    <img
      src={displaySrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={handleError}
      className={className}
    />
  );
}
