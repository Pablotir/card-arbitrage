'use client';

import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { getProxiedImageUrl } from '@/utils/format';

interface SafeImageProps {
  src?: string | null;
  fallbackSrc?: string | null;
  backupSrcs?: (string | null | undefined)[];
  alt: string;
  className?: string;
  fallbackText?: string;
}

export function SafeImage({
  src,
  fallbackSrc,
  backupSrcs,
  alt,
  className = '',
  fallbackText = 'No Image'
}: SafeImageProps) {
  // Construct deduplicated list of candidate image URLs
  const candidates: string[] = [
    src,
    fallbackSrc,
    ...(backupSrcs || [])
  ].filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim().length > 5));

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [triedDirect, setTriedDirect] = useState(false);

  // Reset pipeline when image sources change
  useEffect(() => {
    setCandidateIndex(0);
    setTriedDirect(false);
  }, [src, fallbackSrc, JSON.stringify(backupSrcs || [])]);

  const hasExhaustedAll = candidateIndex >= candidates.length;

  if (candidates.length === 0 || hasExhaustedAll) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 rounded-lg p-2 text-center select-none border border-dashed border-gray-200 dark:border-gray-700">
        <ImageOff className="w-5 h-5 mb-1 opacity-50" />
        <span className="text-[10px] font-medium leading-tight line-clamp-2 px-1">{fallbackText || alt}</span>
      </div>
    );
  }

  const currentUrl = candidates[candidateIndex];
  // 1. First try proxied to avoid CORS / Referer blocking
  // 2. If proxy fails, try direct CDN link
  const displaySrc = triedDirect ? currentUrl : getProxiedImageUrl(currentUrl);

  const handleError = () => {
    if (!triedDirect && currentUrl.startsWith('http')) {
      // Step A: Try direct unproxied request to this same candidate
      setTriedDirect(true);
    } else {
      // Step B: Advance to next backup candidate URL and start with proxy again
      setTriedDirect(false);
      setCandidateIndex((prev) => prev + 1);
    }
  };

  return (
    <img
      key={`${candidateIndex}-${triedDirect ? 'direct' : 'proxy'}-${currentUrl}`}
      src={displaySrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={handleError}
      className={className}
    />
  );
}
