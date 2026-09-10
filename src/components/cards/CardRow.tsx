'use client';

import { CardItem } from '@/lib/types';
import { GRADE_OPTIONS } from '@/utils/constants';
import { formatCurrency } from '@/utils/format';
import { ExternalLink, Target, Trash2, ShoppingBag } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface CardRowProps {
  card: CardItem;
  onGradeChange: (id: number, grade: string) => void;
  onBuyClick: (card: CardItem) => void;
  onSnipeClick: (card: CardItem) => void;
  onDeleteClick: (id: number) => void;
}

export function CardRow({
  card,
  onGradeChange,
  onBuyClick,
  onSnipeClick,
  onDeleteClick
}: CardRowProps) {
  const isEbayBest = card.best_source === 'eBay';

  return (
    <tr className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/60">
      {/* Thumbnail */}
      <td className="p-4 w-20">
        <div className="w-12 h-16 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center p-0.5">
          {card.image ? (
            <img
              src={card.image}
              alt={card.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-[9px] text-gray-400">No Image</span>
          )}
        </div>
      </td>

      {/* Name & Set */}
      <td className="p-4">
        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug">
          {card.name}
        </p>
        <span className="inline-block mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60">
          {card.set_name || 'Unknown Set'}
        </span>
      </td>

      {/* Grade Selector */}
      <td className="p-4">
        <select
          value={card.grade || 'Raw (Ungraded)'}
          onChange={(e) => onGradeChange(card.id, e.target.value)}
          className="text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-blue-500 font-medium block w-full max-w-[130px] cursor-pointer"
        >
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </td>

      {/* Market / Best Price */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="font-black text-gray-900 dark:text-gray-100 text-base">
            {formatCurrency(card.live_price)}
          </span>

          {card.best_source && card.best_link && (
            <a
              href={card.best_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              <Badge variant={isEbayBest ? 'ebay' : 'tcg'}>
                {card.best_source}
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </Badge>
            </a>
          )}
        </div>

        {/* Opposite listing comparison (e.g. if TCG is primary, show eBay price) */}
        {!isEbayBest && card.ebay_price && (
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span>eBay: {formatCurrency(card.ebay_price)}</span>
            {card.ebay_link && (
              <a
                href={card.ebay_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                View
              </a>
            )}
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onBuyClick(card)}
            className="flex items-center gap-1 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-2xs"
            title="Mark as purchased and move to Collection"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bought</span>
          </button>

          <button
            type="button"
            onClick={() => onSnipeClick(card)}
            className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
            title="Create Discord Snipe Rule"
          >
            <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden md:inline">Snipe</span>
          </button>
        </div>
      </td>

      {/* Delete */}
      <td className="p-4 text-right">
        <button
          type="button"
          onClick={() => onDeleteClick(card.id)}
          className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          title="Remove from Tracked"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
