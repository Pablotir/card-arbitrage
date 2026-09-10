'use client';

import { TcgGame } from '@/lib/types';
import { POPULAR_POKEMON_SETS, POPULAR_ONEPIECE_SETS } from '@/utils/constants';
import { Sparkles } from 'lucide-react';

interface SetFilterBarProps {
  game: TcgGame;
  onSelectSet: (setQuery: string) => void;
  activeQuery?: string;
}

export function SetFilterBar({ game, onSelectSet, activeQuery = '' }: SetFilterBarProps) {
  const sets = game === 'pokemon' ? POPULAR_POKEMON_SETS : POPULAR_ONEPIECE_SETS;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
      <span className="text-gray-400 dark:text-gray-500 font-semibold flex items-center gap-1 flex-shrink-0 text-[11px] uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        Popular Sets:
      </span>
      {sets.map((s) => {
        const isActive = activeQuery.toLowerCase().includes(s.query.toLowerCase());
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectSet(s.query)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 border ${
              isActive
                ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>{s.name}</span>
            {s.isNew && (
              <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1 rounded-sm uppercase tracking-tight">
                New
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
