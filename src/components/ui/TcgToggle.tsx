'use client';

import { TcgGame } from '@/lib/types';
import { Zap, Globe, Anchor } from 'lucide-react';

interface TcgToggleProps {
  value: TcgGame;
  onChange: (val: TcgGame) => void;
}

export function TcgToggle({ value, onChange }: TcgToggleProps) {
  const options: Array<{ id: TcgGame; label: string; icon: typeof Zap }> = [
    { id: 'pokemon', label: 'Pokémon (EN)', icon: Zap },
    { id: 'pokemon-japan', label: 'Pokémon Japan', icon: Globe },
    { id: 'onepiece', label: 'One Piece', icon: Anchor },
  ];

  return (
    <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 text-xs font-semibold select-none border border-gray-200 dark:border-gray-700">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 text-xs ${
              isActive
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-bold shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
