'use client';

import { useEffect, useRef } from 'react';
import { DealItem } from '@/lib/types';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface DealRowProps {
  items: DealItem[];
  isLoading: boolean;
}

function getTimeBadgeClass(timeLeft: string): string {
  if (!timeLeft.includes('h') && !timeLeft.includes('d')) {
    const mins = parseInt(timeLeft, 10);
    if (mins < 10) return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    if (mins < 30) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
}

export function DealRow({ items, isLoading }: DealRowProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const interval = setInterval(() => {
      if (pausedRef.current || !wrapper) return;
      wrapper.scrollLeft += 1;
      if (wrapper.scrollLeft >= wrapper.scrollWidth / 2) wrapper.scrollLeft = 0;
    }, 30);
    return () => clearInterval(interval);
  }, [items]);

  const handleArrow = (dir: 'left' | 'right') => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    if (wrapperRef.current) {
      wrapperRef.current.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' });
    }
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 5000);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-4 text-center text-xs text-gray-400 dark:text-gray-500 h-24 flex items-center justify-center">
        {isLoading ? (
          <span className="animate-pulse">Loading live ending auctions...</span>
        ) : (
          <span>No live auctions ending right now.</span>
        )}
      </div>
    );
  }

  const doubled = [...items, ...items];

  return (
    <div className="relative group/track">
      <button
        type="button"
        onClick={() => handleArrow('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        ref={wrapperRef}
        className="overflow-x-auto flex gap-3 px-10 pb-2 no-scrollbar"
      >
        {doubled.map((item, i) => (
          <a
            key={`${item.id}-${i}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-xs hover:shadow-md transition-all p-3 flex flex-col gap-2 hover:-translate-y-0.5"
          >
            <div className="w-full h-28 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center p-1">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-gray-400">No Image</span>
              )}
            </div>

            <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">
              {item.title}
            </p>

            <div className="mt-auto flex items-center justify-between gap-1 pt-2 border-t border-gray-100 dark:border-gray-700/60">
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(item.price)}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getTimeBadgeClass(
                  item.timeLeft
                )}`}
              >
                <Clock className="w-2.5 h-2.5" />
                {item.timeLeft}
              </span>
            </div>
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => handleArrow('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
