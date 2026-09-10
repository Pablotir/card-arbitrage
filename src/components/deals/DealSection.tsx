'use client';

import { DealRow } from './DealRow';
import { Flame, Lock } from 'lucide-react';

interface DealSectionProps {
  user: any;
  onLogin: () => void;
  deals: {
    tens: any[];
    blackLabel: any[];
    nines: any[];
  };
  isLoading: boolean;
}

export function DealSection({ user, onLogin, deals, isLoading }: DealSectionProps) {
  if (!user) {
    return (
      <div className="min-h-[420px] rounded-2xl bg-gray-100/70 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 text-center transition-colors">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg px-8 py-8 flex flex-col items-center gap-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Sign In to Unlock Deals
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Create a free account to track live, ending-soonest eBay graded card auctions and discover undervalued cards before anyone else.
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-sm w-full"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500" />
          <span>Live Auctions Ending Soon</span>
        </h2>
        {isLoading && (
          <span className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">
            Scanning eBay...
          </span>
        )}
      </div>

      {/* Black Label & Pristine */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-white bg-gray-900 dark:bg-black border border-gray-700 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5 shadow-2xs">
            <span>?</span> CGC / BGS Black Label &amp; Pristine 10s
          </span>
        </div>
        <DealRow items={deals.blackLabel} isLoading={isLoading} />
      </div>

      {/* Gem Mint 10s */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
            <span>??</span> PSA / CGC / BGS / TAG 10s
          </span>
        </div>
        <DealRow items={deals.tens} isLoading={isLoading} />
      </div>

      {/* Mint 9s */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
            <span>??</span> PSA / CGC / BGS / TAG 9s
          </span>
        </div>
        <DealRow items={deals.nines} isLoading={isLoading} />
      </div>
    </div>
  );
}
