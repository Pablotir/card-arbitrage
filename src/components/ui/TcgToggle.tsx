'use client';

import { TcgGame } from '@/lib/types';

interface TcgToggleProps {
  value: TcgGame;
  onChange: (val: TcgGame) => void;
}

export function TcgToggle({ value, onChange }: TcgToggleProps) {
  return (
    <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-xs font-semibold select-none border border-gray-200 dark:border-gray-700">
      {/* Sliding pill */}
      <div
        className={`absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-full shadow-sm transition-transform duration-200 ${
          value === 'onepiece' ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ width: 'calc(50% - 4px)', left: 4 }}
      />
      <button
        type="button"
        onClick={() => onChange('pokemon')}
        className={`relative z-10 px-3.5 py-1.5 rounded-full transition-colors duration-150 flex items-center gap-1.5 ${
          value === 'pokemon' 
            ? 'text-gray-900 dark:text-gray-100 font-bold' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        }`}
      >
        <span>?</span> Pokémon
      </button>
      <button
        type="button"
        onClick={() => onChange('onepiece')}
        className={`relative z-10 px-3.5 py-1.5 rounded-full transition-colors duration-150 flex items-center gap-1.5 ${
          value === 'onepiece' 
            ? 'text-gray-900 dark:text-gray-100 font-bold' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        }`}
      >
        <span>?</span> One Piece
      </button>
    </div>
  );
}
