'use client';

import { SearchCardResult, CardLanguage } from '@/lib/types';
import { Plus, Target, CheckCircle2, Sparkles, Bookmark, Check } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { SafeImage } from '../ui/SafeImage';

interface SearchResultsProps {
  results: SearchCardResult[];
  onAddToList: (card: SearchCardResult) => void;
  onAddOptimizedToList?: (card: SearchCardResult) => void;
  onAddAllOptimized?: (cards: SearchCardResult[]) => void;
  onOpenSniper: (card: SearchCardResult) => void;
  onToggleOwned?: (card: SearchCardResult) => void;
  isOwned?: (card: SearchCardResult) => boolean;
  isTracked?: (card: SearchCardResult) => boolean;
}

const LANG_FLAGS: Record<CardLanguage, string> = {
  en: '🇺🇸 EN',
  ja: '🇯🇵 JP',
  ko: '🇰🇷 KR',
  zh: '🇨🇳 ZH',
  onepiece: '🏴‍☠️ OP'
};

export function SearchResults({
  results,
  onAddToList,
  onAddOptimizedToList,
  onAddAllOptimized,
  onOpenSniper,
  onToggleOwned,
  isOwned,
  isTracked
}: SearchResultsProps) {
  if (results.length === 0) return null;

  const getCardImg = (card: SearchCardResult) => {
    if (card.image) return card.image;
    if (card.imageUrl) return card.imageUrl;
    if (card.tcgplayerId) return `https://product-images.tcgplayer.com/fit-in/438x438/${card.tcgplayerId}.jpg`;
    if (card.id && card.number) {
      const setSlug = card.id.split('-')[0]?.replace('.', '').toLowerCase();
      return `https://images.pokemontcg.io/${setSlug}/${card.number}.png`;
    }
    return '';
  };

  const getFallbackImg = (card: SearchCardResult) => {
    if (card.tcgplayerId) {
      return `https://product-images.tcgplayer.com/fit-in/438x438/${card.tcgplayerId}.jpg`;
    }
    if (card.id && card.number) {
      const setSlug = card.id.split('-')[0]?.replace('.', '').toLowerCase();
      return `https://images.pokemontcg.io/${setSlug}/${card.number}.png`;
    }
    return '';
  };

  const handleAddCheapest = (card: SearchCardResult) => {
    if (onAddOptimizedToList) {
      onAddOptimizedToList(card);
    } else {
      // Create a copy with cheapest price and language
      const optimizedCard: SearchCardResult = {
        ...card,
        name: `${card.name} [${(card.cheapestLanguage || 'en').toUpperCase()}]`,
        price: card.cheapestPrice ? card.cheapestPrice.toFixed(2) : card.price,
        language: card.cheapestLanguage
      };
      onAddToList(optimizedCard);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Results Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-gray-800/80 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <span>Search Results ({results.length})</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60 lowercase normal-case">
              Cost comparison active
            </span>
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Compare EN vs JP prices (includes KR &amp; ZH for cards over $100)
          </p>
        </div>

        {onAddAllOptimized && (
          <button
            type="button"
            onClick={() => onAddAllOptimized(results)}
            className="inline-flex items-center gap-1.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition duration-150 transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Select All Optimized Versions to Wishlist</span>
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((card, idx) => {
          const img = getCardImg(card);
          const fallbackImg = getFallbackImg(card);
          const setName = card.setName || card.set_name || 'Expansion';
          const owned = isOwned ? isOwned(card) : false;
          const inWishlist = isTracked ? isTracked(card) : false;

          const hasLanguages = card.languages && Object.keys(card.languages).length > 1;
          const hasSavings = Boolean(card.savingsVsEnglish && card.savingsVsEnglish > 0);
          const cardLang = card.language || 'en';

          return (
            <div
              key={card.id || idx}
              className={`group bg-white dark:bg-gray-800/90 rounded-2xl border ${
                owned
                  ? 'border-emerald-200 dark:border-emerald-800/60'
                  : 'border-gray-100 dark:border-gray-700/80'
              } p-4 flex gap-4 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition flex-col justify-between`}
            >
              <div>
                <div className="flex gap-3">
                  <div className="w-20 h-28 flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1">
                    <SafeImage
                      src={img}
                      fallbackSrc={fallbackImg}
                      alt={card.name}
                      fallbackText={card.name}
                      className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-200"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-start min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {owned && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 flex items-center gap-0.5">
                          ✓ Owned
                        </span>
                      )}
                      {card.isExclusive ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80">
                          {LANG_FLAGS[cardLang] || cardLang.toUpperCase()} Exclusive
                        </span>
                      ) : cardLang !== 'en' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {LANG_FLAGS[cardLang] || cardLang.toUpperCase()}
                        </span>
                      ) : null}
                    </div>

                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight truncate mt-0.5" title={card.name}>
                      {card.name}
                    </h4>

                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate mt-0.5" title={setName}>
                      {setName}
                    </span>

                    {card.rarity && card.rarity.toLowerCase() !== 'none' && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/60 w-fit truncate">
                        {card.rarity}
                      </span>
                    )}

                    <div className="mt-auto pt-1.5 flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-[11px] text-gray-400">
                        {cardLang === 'ja' ? 'JP Mkt:' : cardLang === 'zh' ? 'ZH Mkt:' : cardLang === 'ko' ? 'KO Mkt:' : 'EN Mkt:'}
                      </span>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                        {card.price ? formatCurrency(card.price) : 'N/A'}
                      </span>
                      {card.pricingSource && (
                        <span className={`text-[9px] font-semibold px-1 rounded ${
                          card.pricingSource === 'TCGPlayer'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                          {card.pricingSource}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Multi-Language Price Comparison Matrix */}
                {hasLanguages && (
                  <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Language Pricing:</span>
                      {hasSavings && (
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/50">
                          Save {card.savingsVsEnglish}% on {(card.cheapestLanguage || 'alt').toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {Object.entries(card.languages!).map(([langKey, langInfo]) => {
                        const isCheapest = langInfo.isCheapest;
                        return (
                          <div
                            key={langKey}
                            className={`px-2 py-1 rounded-lg border flex items-center justify-between ${
                              isCheapest
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold'
                                : 'bg-gray-50 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              <span>{LANG_FLAGS[langKey as CardLanguage] || langKey.toUpperCase()}</span>
                              {isCheapest && <span className="text-[9px] text-emerald-600">★</span>}
                            </span>
                            <span>{formatCurrency(langInfo.price)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 mt-2 space-y-1.5">
                {/* 1. Cheapest Optimized Version Wishlist Button */}
                {hasSavings && (
                  <button
                    type="button"
                    onClick={() => handleAddCheapest(card)}
                    className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-2.5 rounded-xl transition shadow-2xs"
                    title={`Add lowest cost ${card.cheapestLanguage?.toUpperCase()} version to Wishlist`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Wishlist Cheapest ({(card.cheapestLanguage || 'alt').toUpperCase()}: {formatCurrency(card.cheapestPrice)})</span>
                  </button>
                )}

                {/* 2. Action Buttons: I Own This, Wishlist & Snipe */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleOwned && onToggleOwned(card)}
                    className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      owned
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs hover:bg-emerald-700'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                    }`}
                    title={owned ? 'Card is in your collection - click to remove' : 'Mark as owned (adds directly to collection)'}
                  >
                    {owned ? <Check className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    <span className="truncate">{owned ? 'Owned' : 'I Own'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddToList(card)}
                    disabled={inWishlist}
                    className={`flex items-center justify-center gap-1 ${
                      inWishlist
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-transparent'
                        : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white shadow-2xs cursor-pointer'
                    } text-xs font-semibold py-2 px-1.5 rounded-xl transition`}
                  >
                    {inWishlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span className="truncate">{inWishlist ? 'Wishlisted' : 'Wishlist'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenSniper(card)}
                    className="flex items-center justify-center gap-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold py-2 px-1.5 rounded-xl transition cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="truncate">Snipe</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
