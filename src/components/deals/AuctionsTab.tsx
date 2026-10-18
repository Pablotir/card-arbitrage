'use client';

import { useState } from 'react';
import { DealRow } from './DealRow';
import { Flame, Lock, Sparkles, Trophy, Medal, Search, ExternalLink, RefreshCw, X } from 'lucide-react';
import { TcgGame } from '@/lib/types';

interface AuctionsTabProps {
  user: any;
  onLogin: () => void;
  deals: {
    tens: any[];
    blackLabel: any[];
    nines: any[];
  };
  isLoading: boolean;
  tcg: TcgGame;
  setTcg: (game: TcgGame) => void;
  onRefresh: () => void;
}

export function AuctionsTab({
  user,
  onLogin,
  deals,
  isLoading,
  tcg,
  setTcg,
  onRefresh
}: AuctionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'blacklabel' | '10s' | '9s'>('all');

  if (!user) {
    return (
      <div className="min-h-[460px] rounded-3xl bg-gray-100/70 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 text-center transition-colors">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl px-8 py-10 flex flex-col items-center gap-4 max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shadow-inner">
            <Flame className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Sign In to Unlock Live Auctions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Monitor real-time auctions ending soon across PSA 10s, BGS Black Labels, Pristines, and Mint 9s. Discover ending auctions before anyone else.
          </p>
          <button
            onClick={onLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  // Filter listings by query
  const filterListings = (items: any[]) => {
    if (!searchQuery.trim()) return items;
    const qLower = searchQuery.toLowerCase().trim();
    return items.filter((item) => (item.title || '').toLowerCase().includes(qLower));
  };

  const filteredBlackLabel = filterListings(deals.blackLabel || []);
  const filteredTens = filterListings(deals.tens || []);
  const filteredNines = filterListings(deals.nines || []);

  const hasAnyResults = filteredBlackLabel.length > 0 || filteredTens.length > 0 || filteredNines.length > 0;

  // Direct eBay search URL helper
  const getEbaySearchUrl = (gradeText?: string) => {
    const baseTerm = searchQuery.trim() || (tcg === 'pokemon-japan' ? 'pokemon japan' : tcg === 'onepiece' ? 'one piece' : 'pokemon');
    const fullTerm = gradeText ? `${baseTerm} ${gradeText}` : baseTerm;
    return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(fullTerm)}&LH_Auction=1&_sop=1`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2 tracking-tight">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>Live eBay Auctions Ending Soon</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Dedicated real-time feed of live ending-soon auctions. Unaffected by card catalog filters.
            </p>
          </div>

          {/* Game Switcher & Refresh */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTcg('pokemon')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  tcg === 'pokemon'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                ⚡ Pokémon (EN)
              </button>
              <button
                type="button"
                onClick={() => setTcg('pokemon-japan')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  tcg === 'pokemon-japan'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                🌐 Pokémon Japan
              </button>
              <button
                type="button"
                onClick={() => setTcg('onepiece')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  tcg === 'onepiece'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                🏴‍☠️ One Piece
              </button>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 transition"
              title="Refresh Live Auctions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dedicated Search Input & Quick Grade Pills */}
        <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/60">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live auctions by Pokémon, set, or card name (e.g. Charizard, Gengar, Pikachu, 151)..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Grade Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              All Grades
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('blacklabel')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                selectedCategory === 'blacklabel'
                  ? 'bg-gray-900 text-white dark:bg-black shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Black Label &amp; Pristine</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('10s')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                selectedCategory === '10s'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Gem Mint 10s</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('9s')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                selectedCategory === '9s'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Medal className="w-3.5 h-3.5 text-blue-200" />
              <span>Mint 9s</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct eBay Quick-Launch Banner */}
      <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-blue-500/10 dark:from-rose-950/30 dark:via-amber-950/30 dark:to-blue-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Explore Live eBay Auctions Ending Soonest
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              One-click access to ending-soonest auctions directly on eBay.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={getEbaySearchUrl('graded 10')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-amber-100 transition shadow-2xs"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>PSA / CGC 10s on eBay</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </a>
          <a
            href={getEbaySearchUrl('pristine black label')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white dark:bg-black border border-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-gray-800 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Black Labels on eBay</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </a>
          <a
            href={getEbaySearchUrl('graded 9')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-blue-100 transition shadow-2xs"
          >
            <Medal className="w-3.5 h-3.5" />
            <span>Mint 9s on eBay</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </a>
        </div>
      </div>

      {/* AUCTION CAROUSELS BY CATEGORY */}
      {/* 1. Black Label & Pristine 10s */}
      {(selectedCategory === 'all' || selectedCategory === 'blacklabel') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-white bg-gray-900 dark:bg-black border border-gray-700 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> CGC / BGS Black Label &amp; Pristine 10s
            </span>
            <span className="text-xs text-gray-400">
              {filteredBlackLabel.length} live auction{filteredBlackLabel.length === 1 ? '' : 's'}
            </span>
          </div>
          <DealRow items={filteredBlackLabel} isLoading={isLoading} />
        </div>
      )}

      {/* 2. Gem Mint 10s */}
      {(selectedCategory === 'all' || selectedCategory === '10s') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> PSA / CGC / BGS / TAG 10s
            </span>
            <span className="text-xs text-gray-400">
              {filteredTens.length} live auction{filteredTens.length === 1 ? '' : 's'}
            </span>
          </div>
          <DealRow items={filteredTens} isLoading={isLoading} />
        </div>
      )}

      {/* 3. Mint 9s */}
      {(selectedCategory === 'all' || selectedCategory === '9s') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
              <Medal className="w-3.5 h-3.5 text-blue-500" /> PSA / CGC / BGS / TAG 9s
            </span>
            <span className="text-xs text-gray-400">
              {filteredNines.length} live auction{filteredNines.length === 1 ? '' : 's'}
            </span>
          </div>
          <DealRow items={filteredNines} isLoading={isLoading} />
        </div>
      )}

      {/* Empty State when search term matches nothing */}
      {searchQuery.trim() && !hasAnyResults && (
        <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700/80 space-y-3">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
            No live auctions currently ending for &quot;{searchQuery}&quot;
          </p>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            You can search eBay live auctions directly to see active listings and place bids:
          </p>
          <a
            href={getEbaySearchUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
          >
            <span>Search &quot;{searchQuery}&quot; on eBay</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
