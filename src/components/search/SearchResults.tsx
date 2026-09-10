'use client';

import { SearchCardResult } from '@/lib/types';
import { Plus, Target } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface SearchResultsProps {
  results: SearchCardResult[];
  onAddToList: (card: SearchCardResult) => void;
  onOpenSniper: (card: SearchCardResult) => void;
}

export function SearchResults({ results, onAddToList, onOpenSniper }: SearchResultsProps) {
  if (results.length === 0) return null;

  const getCardImg = (card: SearchCardResult) => {
    if (card.image) return card.image;
    if (card.imageUrl) return card.imageUrl;
    if (card.tcgplayerId) return `https://product-images.tcgplayer.com/fit-in/438x438/${card.tcgplayerId}.jpg`;
    return '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Search Results ({results.length})
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Showing verified cards &amp; market prices
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((card, idx) => {
          const img = getCardImg(card);
          const setName = card.setName || card.set_name || 'Expansion';

          return (
            <div
              key={card.id || idx}
              className="group bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-4 flex gap-4 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition flex-col justify-between"
            >
              <div className="flex gap-3">
                <div className="w-20 h-28 flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1">
                  {img ? (
                    <img
                      src={img}
                      alt={card.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-200"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400 text-center">No Image</span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-start min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight truncate" title={card.name}>
                    {card.name}
                  </h4>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate mt-0.5" title={setName}>
                    {setName}
                  </span>

                  {card.price ? (
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xs text-gray-400">Est.</span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(card.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400 mt-2">Market: N/A</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 mt-2">
                <button
                  type="button"
                  onClick={() => onAddToList(card)}
                  className="flex items-center justify-center gap-1.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-xs font-semibold py-2 px-3 rounded-xl transition shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Track</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSniper(card)}
                  className="flex items-center justify-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold py-2 px-3 rounded-xl transition"
                >
                  <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Snipe</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
