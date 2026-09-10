'use client';

import { Search, Loader2 } from 'lucide-react';
import { TcgToggle } from '../ui/TcgToggle';
import { SetFilterBar } from './SetFilterBar';
import { TcgGame } from '@/lib/types';

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  game: TcgGame;
  setGame: (g: TcgGame) => void;
  onSearch: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function SearchBar({
  query,
  setQuery,
  game,
  setGame,
  onSearch,
  isLoading
}: SearchBarProps) {
  const handleQuickSet = (targetSet: string) => {
    setQuery(targetSet);
    // Dispatch search
    const form = document.getElementById('search-form') as HTMLFormElement;
    if (form) form.requestSubmit();
  };

  return (
    <div className="bg-white dark:bg-gray-800/90 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Search Marketplace &amp; Sets
        </span>
        <TcgToggle value={game} onChange={setGame} />
      </div>

      <form id="search-form" onSubmit={onSearch} className="flex gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              game === 'pokemon'
                ? 'Search by Pokémon (e.g. Mega Rayquaza, Charizard) or set (30th, Delta Reign)...'
                : 'Search One Piece cards (e.g. Luffy, Zoro, Nami, OP-09)...'
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

      {/* Quick set filters */}
      <SetFilterBar game={game} onSelectSet={handleQuickSet} activeQuery={query} />
    </div>
  );
}
