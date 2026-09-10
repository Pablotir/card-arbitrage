'use client';

import { CardItem } from '@/lib/types';
import { GRADE_OPTIONS } from '@/utils/constants';
import { formatCurrency } from '@/utils/format';
import { ExternalLink, Target, Trash2, ShoppingBag } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface CardGridProps {
  cards: CardItem[];
  onGradeChange: (id: number, grade: string) => void;
  onBuyClick: (card: CardItem) => void;
  onSnipeClick: (card: CardItem) => void;
  onDeleteClick: (id: number) => void;
}

export function CardGrid({
  cards,
  onGradeChange,
  onBuyClick,
  onSnipeClick,
  onDeleteClick
}: CardGridProps) {
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {cards.map((card) => {
        const isEbayBest = card.best_source === 'eBay';
        return (
          <div
            key={card.id}
            className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition duration-200"
          >
            <div>
              {/* Image */}
              <div className="w-full h-44 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center p-2 mb-3">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>

              {/* Card Meta */}
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug truncate" title={card.name}>
                {card.name}
              </h4>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate block mt-0.5">
                {card.set_name || 'Expansion'}
              </span>

              {/* Grade Selector */}
              <div className="mt-3">
                <select
                  value={card.grade || 'Raw (Ungraded)'}
                  onChange={(e) => onGradeChange(card.id, e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 outline-hidden focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Best Source */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Market Price</span>
                  <span className="font-black text-gray-900 dark:text-gray-100 text-base">
                    {formatCurrency(card.live_price)}
                  </span>
                </div>

                {card.best_source && card.best_link && (
                  <a
                    href={card.best_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge variant={isEbayBest ? 'ebay' : 'tcg'}>
                      {card.best_source}
                      <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </Badge>
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onBuyClick(card)}
                className="flex-1 flex items-center justify-center gap-1 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-xs font-semibold py-1.5 px-2 rounded-lg transition"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Bought</span>
              </button>

              <button
                type="button"
                onClick={() => onSnipeClick(card)}
                className="flex items-center justify-center p-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg transition"
                title="Snipe this card"
              >
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </button>

              <button
                type="button"
                onClick={() => onDeleteClick(card.id)}
                className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
