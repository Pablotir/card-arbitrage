'use client';

import { Search, Loader2, RefreshCw } from 'lucide-react';
import { TcgToggle } from '../ui/TcgToggle';
import { SetFilterBar } from './SetFilterBar';
import { FilterBar } from './FilterBar';
import { TcgGame, SearchFilterState } from '@/lib/types';

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  game: TcgGame;
  setGame: (g: TcgGame) => void;
  onSearch: (e?: React.FormEvent) => void;
  onRefreshPrices?: () => void;
  isLoading: boolean;
  filters: SearchFilterState;
  onFilterChange: (filters: SearchFilterState) => void;
  onClearFilters: () => void;
  totalResults?: number;
  ownedCount?: number;
}

export function SearchBar({
  query,
  setQuery,
  game,
  setGame,
  onSearch,
  onRefreshPrices,
  isLoading,
  filters,
  onFilterChange,
  onClearFilters,
  totalResults,
  ownedCount
}: SearchBarProps) {
  const handleQuickSet = (targetSet: string) => {
    setQuery(targetSet);
    const form = document.getElementById('search-form') as HTMLFormElement;
    if (form) form.requestSubmit();
  };

  return (
    <div className="bg-white dark:bg-gray-800/90 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Search Marketplace &amp; Sets
        </span>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onRefreshPrices && (
            <button
              type="button"
              onClick={onRefreshPrices}
              disabled={isLoading}
              className="text-xs font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 transition cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60"
              title="Force reload live prices from market (bypasses 5-day cache)"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Prices</span>
            </button>
          )}
          <TcgToggle
            value={game}
            onChange={(newGame) => {
              setGame(newGame);
              const langCode = newGame === 'pokemon-japan' ? 'ja' : newGame === 'onepiece' ? 'onepiece' : 'en';
              onFilterChange({
                ...filters,
                languages: filters.languages?.includes(langCode) ? filters.languages : [langCode, ...filters.languages]
              });
            }}
          />
        </div>
      </div>

      <form id="search-form" onSubmit={onSearch} className="flex gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              game === 'pokemon-japan'
                ? 'Search Pokémon Japan (e.g. Lillie, Pikachu, 151, VMAX Climax, Shiny Star V)...'
                : game === 'onepiece'
                ? 'Search One Piece cards (e.g. Luffy, Zoro, Nami, OP-09)...'
                : 'Search by Pokémon (e.g. Mega Rayquaza, Charizard) or set (30th, Delta Reign)...'
            }
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition shadow-xs flex items-center justify-center min-w-[100px]"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* Popular Set Chips */}
      <SetFilterBar
        game={game === 'pokemon-japan' ? 'pokemon' : game}
        onSelectSet={handleQuickSet}
        activeQuery={query}
      />

      {/* TCGPlayer-Style Multi-Attribute Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={onFilterChange}
        onClear={onClearFilters}
        onApplySearch={() => onSearch()}
        totalResults={totalResults}
        ownedCount={ownedCount}
      />
    </div>
  );
}
