'use client';

import { Sparkles, Loader2 } from 'lucide-react';

interface SearchLoadingBannerProps {
  progress: number;
  statusMessage: string;
  targetCountText?: string;
}

export function SearchLoadingBanner({
  progress,
  statusMessage,
  targetCountText = '791+ NM matching cards'
}: SearchLoadingBannerProps) {
  const clampedProgress = Math.min(Math.max(progress, 5), 100);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Live Loading Progress Header */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                <span>Searching &amp; Loading Live Marketplace...</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  {Math.round(clampedProgress)}%
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 animate-pulse">
                {statusMessage || 'Retrieving card details & cross-language pricing...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
              <span>Target: {targetCountText}</span>
            </span>
          </div>
        </div>

        {/* Animated Gradient Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-700/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-gray-400 dark:text-gray-500 pt-0.5">
          <span>Catalog Union &amp; TCGPlayer Scans</span>
          <span>Please wait while the full dataset compiles...</span>
        </div>
      </div>

      {/* 8 Card Skeletons Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 flex flex-col justify-between animate-pulse space-y-3"
          >
            <div className="flex gap-3">
              <div className="w-20 h-28 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                <div className="h-3 bg-purple-100 dark:bg-purple-950/40 rounded w-1/3 mt-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/5 mt-auto" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-700/40">
              <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl" />
              <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl" />
              <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
