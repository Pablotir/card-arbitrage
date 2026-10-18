'use client';

import React, { useState } from 'react';
import { SearchCardResult, CardLanguage } from '@/lib/types';
import { Target, CheckCircle2, Sparkles, Bookmark, Check, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { SafeImage } from '../ui/SafeImage';

interface SearchResultsProps {
  results: SearchCardResult[];
  onAddToList: (card: SearchCardResult) => void;
  onAddOptimizedToList?: (card: SearchCardResult, targetLang?: CardLanguage) => void;
  onAddAllOptimized?: (cards: SearchCardResult[]) => void;
  onAddBatchSelected?: (items: { card: SearchCardResult; language: CardLanguage }[]) => void;
  onOpenSniper: (card: SearchCardResult) => void;
  onToggleOwned?: (card: SearchCardResult) => void;
  isOwned?: (card: SearchCardResult) => boolean;
  isTracked?: (card: SearchCardResult) => boolean;
}

const LANG_FLAGS: Record<CardLanguage, string> = {
  en: '🇺🇸 EN',
  ja: '🇯🇵 JP',
  ko: '🇰🇷 KR',
  zh: '🇨🇳 CH',
  onepiece: '🏴‍☠️ OP'
};

export function SearchResults({
  results,
  onAddToList,
  onAddOptimizedToList,
  onAddAllOptimized,
  onAddBatchSelected,
  onOpenSniper,
  onToggleOwned,
  isOwned,
  isTracked
}: SearchResultsProps) {
  // User manual language selection per card: cardId -> CardLanguage
  const [selectedCardLanguages, setSelectedCardLanguages] = useState<Record<string, CardLanguage>>({});
  // Set of card IDs that were explicitly selected (either by manual chip click or price slider)
  const [explicitlySelectedIds, setExplicitlySelectedIds] = useState<Set<string>>(new Set());

  // Smart Price Tier Slider State
  const [isSliderPanelOpen, setIsSliderPanelOpen] = useState<boolean>(true);
  const [priceThreshold, setPriceThreshold] = useState<number>(35);
  const [targetStrategyLang, setTargetStrategyLang] = useState<'cheapest' | 'ja' | 'ko' | 'zh'>('cheapest');

  if (results.length === 0) return null;

  // Determine active language for a card
  const getChosenLangForCard = (card: SearchCardResult): CardLanguage => {
    if (selectedCardLanguages[card.id]) {
      return selectedCardLanguages[card.id];
    }
    return card.cheapestLanguage || card.language || 'en';
  };

  // Determine price for active language on a card
  const getChosenPriceForCard = (card: SearchCardResult, lang: CardLanguage): number | null => {
    if (card.languages && card.languages[lang]?.price != null) {
      return card.languages[lang]?.price!;
    }
    if (card.cheapestLanguage === lang && card.cheapestPrice != null) {
      return card.cheapestPrice;
    }
    return typeof card.price === 'number' ? card.price : parseFloat(String(card.price || '0')) || null;
  };

  // Toggle or select a specific language for a card
  const handleSelectCardLang = (cardId: string, langKey: CardLanguage) => {
    setSelectedCardLanguages((prev) => ({
      ...prev,
      [cardId]: langKey
    }));
    setExplicitlySelectedIds((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  };

  // Apply Price Threshold Auto-Selector
  const handleApplyThresholdStrategy = (threshold: number, strategyLang: 'cheapest' | 'ja' | 'ko' | 'zh') => {
    const newSelections: Record<string, CardLanguage> = {};
    const newExplicitIds = new Set<string>();

    for (const card of results) {
      const enPrice = card.languages?.en?.price ?? (card.price ? parseFloat(String(card.price)) : 0);
      if (enPrice >= threshold) {
        let chosen: CardLanguage = 'en';
        if (strategyLang === 'cheapest') {
          chosen = card.cheapestLanguage || 'ja';
        } else if (strategyLang === 'ja') {
          chosen = card.languages?.ja ? 'ja' : (card.cheapestLanguage || 'ja');
        } else if (strategyLang === 'ko') {
          chosen = card.languages?.ko ? 'ko' : (card.cheapestLanguage || 'ko');
        } else if (strategyLang === 'zh') {
          chosen = card.languages?.zh ? 'zh' : (card.cheapestLanguage || 'zh');
        }
        newSelections[card.id] = chosen;
        newExplicitIds.add(card.id);
      } else {
        newSelections[card.id] = 'en';
      }
    }

    setSelectedCardLanguages(newSelections);
    setExplicitlySelectedIds(newExplicitIds);
  };

  // Reset all manual language selections back to defaults
  const handleResetSelections = () => {
    setSelectedCardLanguages({});
    setExplicitlySelectedIds(new Set());
  };

  // Quick Add ONLY Explicitly Selected Cards
  const handleAddOnlySelected = () => {
    if (!onAddBatchSelected) return;
    const items = results
      .filter((card) => explicitlySelectedIds.has(card.id))
      .map((card) => ({
        card,
        language: getChosenLangForCard(card)
      }));
    if (items.length > 0) {
      onAddBatchSelected(items);
    }
  };

  // Quick Add ALL Cards (Chosen Language for Selected, Auto-Cheapest for Rest)
  const handleAddAllSelectedOrCheapest = () => {
    if (onAddBatchSelected) {
      const items = results.map((card) => ({
        card,
        language: getChosenLangForCard(card)
      }));
      onAddBatchSelected(items);
    } else if (onAddAllOptimized) {
      onAddAllOptimized(results);
    }
  };

  const getCardImg = (card: SearchCardResult) => {
    if (card.image && !card.image.includes('cardback') && !card.image.includes('back.png')) {
      return card.image;
    }
    if (card.imageUrl && !card.imageUrl.includes('cardback') && !card.imageUrl.includes('back.png')) {
      return card.imageUrl;
    }
    if (card.id && (card.language === 'ja' || card.language === 'zh' || card.language === 'ko')) {
      const parts = card.id.split('-');
      if (parts.length >= 2) {
        const rawSet = parts[0];
        const num = parts[1];
        const series = rawSet.toUpperCase().startsWith('SV')
          ? 'SV'
          : rawSet.toUpperCase().startsWith('SM')
          ? 'SM'
          : rawSet.toUpperCase().startsWith('SWSH') || rawSet.toUpperCase().startsWith('S')
          ? 'SWSH'
          : rawSet.toUpperCase().startsWith('XY')
          ? 'XY'
          : rawSet.toUpperCase().startsWith('BW')
          ? 'BW'
          : 'SV';
        return `https://assets.tcgdex.net/ja/${series}/${rawSet}/${num}/high.webp`;
      }
    }
    if (card.tcgplayerId && card.language === 'en') {
      return `https://product-images.tcgplayer.com/fit-in/438x438/${card.tcgplayerId}.jpg`;
    }
    if (card.id && card.number) {
      const setSlug = card.id.split('-')[0]?.replace('.', '').toLowerCase();
      return `https://images.pokemontcg.io/${setSlug}/${card.number}.png`;
    }
    return '';
  };

  const getFallbackImg = (card: SearchCardResult) => {
    if (card.id && (card.language === 'ja' || card.language === 'zh' || card.language === 'ko')) {
      const parts = card.id.split('-');
      if (parts.length >= 2) {
        const rawSet = parts[0];
        const num = parts[1];
        const series = rawSet.toUpperCase().startsWith('SV')
          ? 'SV'
          : rawSet.toUpperCase().startsWith('SM')
          ? 'SM'
          : rawSet.toUpperCase().startsWith('SWSH') || rawSet.toUpperCase().startsWith('S')
          ? 'SWSH'
          : rawSet.toUpperCase().startsWith('XY')
          ? 'XY'
          : rawSet.toUpperCase().startsWith('BW')
          ? 'BW'
          : 'SV';
        return `https://assets.tcgdex.net/ja/${series}/${rawSet}/${num}/high.webp`;
      }
    }
    if (card.tcgplayerId && card.language === 'en') {
      return `https://product-images.tcgplayer.com/fit-in/438x438/${card.tcgplayerId}.jpg`;
    }
    if (card.id && card.number) {
      const setSlug = card.id.split('-')[0]?.replace('.', '').toLowerCase();
      return `https://images.pokemontcg.io/${setSlug}/${card.number}.png`;
    }
    return '';
  };

  const selectedCount = explicitlySelectedIds.size;
  const thresholdMatchCount = results.filter((c) => {
    const enPrice = c.languages?.en?.price ?? (c.price ? parseFloat(String(c.price)) : 0);
    return enPrice >= priceThreshold;
  }).length;

  return (
    <div className="space-y-4">
      {/* 1. Search Results Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-gray-800/90 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2 flex-wrap">
            <span>Search Results ({results.length})</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60 lowercase normal-case">
              Cost comparison active
            </span>
            {selectedCount > 0 && (
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60 animate-pulse">
                {selectedCount} custom selected
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Compare EN vs JP prices (includes KR &amp; CH for cards over $100). Click any language tile below to customize your selection.
          </p>
        </div>

        {/* Global Quick Add Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Toggle Price Slider Toolbar */}
          <button
            type="button"
            onClick={() => setIsSliderPanelOpen(!isSliderPanelOpen)}
            className={`inline-flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl border transition cursor-pointer ${
              isSliderPanelOpen
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                : 'bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
            }`}
            title="Toggle Smart Price-Tier Language Selector"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Price Level Strategy</span>
            {isSliderPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Add SELECTED ONLY */}
          <button
            type="button"
            onClick={handleAddOnlySelected}
            disabled={selectedCount === 0}
            className={`inline-flex items-center gap-1.5 text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition duration-150 transform ${
              selectedCount > 0
                ? 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white cursor-pointer hover:-translate-y-0.5 ring-2 ring-indigo-400/40 shadow-indigo-500/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-transparent'
            }`}
            title={selectedCount > 0 ? `Add only the ${selectedCount} cards with custom chosen languages` : 'Click language tiles on cards or use the slider to select cards'}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Quick Add Selected Only ({selectedCount})</span>
          </button>

          {/* Quick Add ALL (Selected + Auto Cheapest) */}
          <button
            type="button"
            onClick={handleAddAllSelectedOrCheapest}
            className="inline-flex items-center gap-1.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
            title="Add all search results: uses custom selected languages where chosen, and lowest-cost version for the rest"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Add All ({selectedCount > 0 ? 'Selected + Cheapest' : 'All Cheapest'})</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Price Level Strategy Slider Panel */}
      {isSliderPanelOpen && (
        <div className="bg-linear-to-r from-purple-50/70 via-indigo-50/50 to-blue-50/50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Strategy Controls */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Auto-Select Language by Price Threshold
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700">
                  EN Price &ge; ${priceThreshold}.00
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  ({thresholdMatchCount} cards qualify)
                </span>
              </div>

              {/* Slider Input */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 min-w-8">$15</span>
                <input
                  type="range"
                  min="15"
                  max="150"
                  step="5"
                  value={priceThreshold}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setPriceThreshold(val);
                    handleApplyThresholdStrategy(val, targetStrategyLang);
                  }}
                  className="w-full h-2 bg-purple-200 dark:bg-purple-900/60 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 min-w-8">$150+</span>
              </div>
            </div>

            {/* Target Language Radio Chips */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-1 bg-white dark:bg-gray-900/80 p-1 rounded-xl border border-purple-200 dark:border-purple-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setTargetStrategyLang('cheapest');
                    handleApplyThresholdStrategy(priceThreshold, 'cheapest');
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                    targetStrategyLang === 'cheapest'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  ★ Cheapest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetStrategyLang('ja');
                    handleApplyThresholdStrategy(priceThreshold, 'ja');
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                    targetStrategyLang === 'ja'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  🇯🇵 JP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetStrategyLang('ko');
                    handleApplyThresholdStrategy(priceThreshold, 'ko');
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                    targetStrategyLang === 'ko'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  🇰🇷 KR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetStrategyLang('zh');
                    handleApplyThresholdStrategy(priceThreshold, 'zh');
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                    targetStrategyLang === 'zh'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  🇨🇳 CH
                </button>
              </div>

              {/* Reset Button */}
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetSelections}
                  className="inline-flex items-center gap-1 text-[11px] font-bold py-1.5 px-2.5 rounded-xl text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition cursor-pointer"
                  title="Clear all custom language selections"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset ({selectedCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Cards Grid */}
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

          const chosenLang = getChosenLangForCard(card);
          const chosenPrice = getChosenPriceForCard(card, chosenLang);
          const isExplicitlyChosen = explicitlySelectedIds.has(card.id);
          const chosenLangDisplay = chosenLang === 'zh' ? 'CH' : chosenLang.toUpperCase();

          return (
            <div
              key={card.id || idx}
              className={`group bg-white dark:bg-gray-800/90 rounded-2xl border transition flex flex-col justify-between p-4 ${
                isExplicitlyChosen
                  ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/30 shadow-md shadow-indigo-500/10'
                  : owned
                  ? 'border-emerald-200 dark:border-emerald-800/60'
                  : 'border-gray-100 dark:border-gray-700/80 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex gap-3">
                  <div className="w-20 h-28 flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1 relative">
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

                      {/* Explicit Selection Indicator Pill */}
                      {isExplicitlyChosen && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/90 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                          🎯 {chosenLangDisplay} Chosen
                        </span>
                      )}
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
                        {cardLang === 'ja' ? 'JP Mkt:' : cardLang === 'zh' ? 'CH Mkt:' : cardLang === 'ko' ? 'KO Mkt:' : 'EN Mkt:'}
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

                {/* Multi-Language Price Comparison Matrix with Interactive Chips */}
                {hasLanguages && (
                  <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Pick Language:</span>
                      {hasSavings && (
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/50">
                          Save {card.savingsVsEnglish}% on {card.cheapestLanguage === 'zh' ? 'CH' : (card.cheapestLanguage || 'alt').toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {Object.entries(card.languages!).map(([langKey, langInfo]) => {
                        const isTileSelected = chosenLang === langKey;
                        const isTileExplicit = isExplicitlyChosen && isTileSelected;
                        const isCheapest = langInfo.isCheapest;

                        return (
                          <button
                            key={langKey}
                            type="button"
                            onClick={() => handleSelectCardLang(card.id, langKey as CardLanguage)}
                            className={`px-2 py-1.5 rounded-xl border flex items-center justify-between text-[11px] transition-all cursor-pointer ${
                              isTileExplicit
                                ? 'bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-500 dark:border-indigo-400 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/90 shadow-md shadow-indigo-500/30 scale-[1.03] font-black'
                                : isTileSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-400 shadow-2xs font-bold'
                                : 'bg-gray-50 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/80'
                            }`}
                            title={`Click to select ${LANG_FLAGS[langKey as CardLanguage] || langKey.toUpperCase()} for Quick Add`}
                          >
                            <span className="flex items-center gap-1 min-w-0">
                              <span className="truncate">{LANG_FLAGS[langKey as CardLanguage] || langKey.toUpperCase()}</span>
                              {isTileExplicit && (
                                <span className="text-[9px] bg-indigo-600 text-white font-black px-1 rounded-sm uppercase tracking-tighter">
                                  ✓
                                </span>
                              )}
                              {!isTileExplicit && isCheapest && (
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">★</span>
                              )}
                            </span>
                            <span className="font-semibold">{formatCurrency(langInfo.price)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 mt-2 space-y-1.5">
                {/* 1. Chosen / Lowest-Cost Version Wishlist Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (onAddOptimizedToList) {
                      onAddOptimizedToList(card, chosenLang);
                    }
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2.5 rounded-xl transition cursor-pointer ${
                    isExplicitlyChosen
                      ? 'bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-purple-700 text-white ring-2 ring-indigo-400/50 shadow-md shadow-indigo-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                  title={`Add ${chosenLangDisplay} version to Wishlist at ${formatCurrency(chosenPrice)}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isExplicitlyChosen ? 'Wishlist Chosen' : 'Wishlist Cheapest'} ({chosenLangDisplay}: {formatCurrency(chosenPrice)})
                  </span>
                </button>

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
