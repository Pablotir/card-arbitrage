'use client';

import React, { useState, useMemo } from 'react';
import { SearchCardResult, CardLanguage } from '@/lib/types';
import { Target, CheckCircle2, Sparkles, Bookmark, Check, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp, LayoutGrid, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { SafeImage } from '../ui/SafeImage';
import { getCardEra } from '@/lib/exclusiveRegistry';

interface SearchResultsProps {
  results: SearchCardResult[];
  onAddToList: (card: SearchCardResult) => void;
  onAddOptimizedToList?: (card: SearchCardResult, targetLang?: CardLanguage) => void;
  onAddAllOptimized?: (cards: SearchCardResult[]) => void;
  onAddBatchSelected?: (items: { card: SearchCardResult; language: CardLanguage }[]) => void;
  onOpenSniper: (card: SearchCardResult) => void;
  onToggleOwned?: (card: SearchCardResult) => void;
  onOpenOwnModal?: (card: SearchCardResult) => void;
  isOwned?: (card: SearchCardResult) => boolean;
  isTracked?: (card: SearchCardResult) => boolean;
  onFlushCache?: () => void;
}

const LANG_FLAGS: Record<CardLanguage, string> = {
  en: '🇺🇸 EN',
  ja: '🇯🇵 JP',
  ko: '🇰🇷 KR',
  zh: '🇨🇳 CH',
  onepiece: '🏴‍☠️ OP'
};

const LANG_CODE_DISPLAY: Record<string, string> = {
  en: 'EN',
  ja: 'JP',
  ko: 'KR',
  zh: 'CH',
  onepiece: 'OP'
};

/**
 * Extracts the base character/trainer name from a card title for grouping.
 * E.g. "Bianca's Devotion (Special Illustration Rare)" -> "bianca's devotion"
 */
function extractCharacterBaseName(name: string): string {
  return (name || '')
    .replace(/\s*\[(JP|JA|CH|ZH|KO|KR|EN)\s*Exclusive\]/gi, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/-(ex|vmax|vstar|v|gx)\b/gi, '')
    .replace(/\s*-\s*(Ultra Rare|Special Illustration Rare|SAR|SIR|SR|UR|Secret Rare|Art Rare|AR|IR)\b/gi, '')
    .trim()
    .toLowerCase();
}

interface EraSectionDef {
  id: string;
  title: string;
  badge: string;
  icon: string;
  colorClass: string;
}

const ERA_SECTIONS: EraSectionDef[] = [
  {
    id: 'me',
    title: 'Mega Evolution',
    badge: 'ME',
    icon: '⚡',
    colorClass: 'from-amber-500/10 via-orange-500/15 to-red-500/10 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200'
  },
  {
    id: 'sv',
    title: 'Scarlet & Violet',
    badge: 'SV',
    icon: '🌟',
    colorClass: 'from-violet-500/10 via-purple-500/15 to-indigo-500/10 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
  },
  {
    id: 'swsh',
    title: 'Sword & Shield',
    badge: 'SWSH',
    icon: '⚔️',
    colorClass: 'from-blue-500/10 via-cyan-500/15 to-sky-500/10 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200'
  },
  {
    id: 'sm',
    title: 'Sun & Moon',
    badge: 'SM',
    icon: '☀️',
    colorClass: 'from-amber-500/10 via-yellow-500/15 to-orange-500/10 border-yellow-300 dark:border-yellow-800 text-amber-900 dark:text-amber-200'
  },
  {
    id: 'xy',
    title: 'XY Series',
    badge: 'XY',
    icon: '💎',
    colorClass: 'from-sky-500/10 via-blue-500/15 to-indigo-500/10 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200'
  },
  {
    id: 'bw',
    title: 'Black & White',
    badge: 'BW',
    icon: '⚫',
    colorClass: 'from-gray-500/10 via-slate-500/15 to-zinc-500/10 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200'
  },
  {
    id: 'hgss',
    title: 'HeartGold & SoulSilver',
    badge: 'HGSS',
    icon: '🏆',
    colorClass: 'from-yellow-500/10 via-amber-500/15 to-gold-500/10 border-yellow-300 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200'
  },
  {
    id: 'dp',
    title: 'Diamond & Pearl / Platinum',
    badge: 'DP',
    icon: '✨',
    colorClass: 'from-teal-500/10 via-emerald-500/15 to-cyan-500/10 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200'
  },
  {
    id: 'ex',
    title: 'EX Series (Ruby & Sapphire)',
    badge: 'EX',
    icon: '⭐',
    colorClass: 'from-rose-500/10 via-red-500/15 to-pink-500/10 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
  },
  {
    id: 'classic',
    title: 'Vintage & Classic (WotC / e-Card / Neo / Base)',
    badge: 'Classic',
    icon: '📜',
    colorClass: 'from-stone-500/10 via-amber-500/15 to-yellow-500/10 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
  },
  {
    id: 'other',
    title: 'Special Promos & Collaborations',
    badge: 'Special',
    icon: '🎁',
    colorClass: 'from-purple-500/10 via-fuchsia-500/15 to-pink-500/10 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
  }
];

export function SearchResults({
  results,
  onAddToList,
  onAddOptimizedToList,
  onAddAllOptimized,
  onAddBatchSelected,
  onOpenSniper,
  onToggleOwned,
  onOpenOwnModal,
  isOwned,
  isTracked,
  onFlushCache
}: SearchResultsProps) {
  // User manual language selection per card: cardId -> CardLanguage
  const [selectedCardLanguages, setSelectedCardLanguages] = useState<Record<string, CardLanguage>>({});
  // Set of card IDs that were explicitly selected (either by manual chip click or price slider)
  const [explicitlySelectedIds, setExplicitlySelectedIds] = useState<Set<string>>(new Set());

  // Interactive Visual Card Sizing Slider (min-width in px: 210px to 420px, default 290px)
  const [cardMinSize, setCardMinSize] = useState<number>(290);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

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

  const getCardImageCandidates = (card: SearchCardResult): string[] => {
    const list: string[] = [];

    // 1. Existing card image fields (high & low webp)
    if (card.image && !card.image.includes('cardback') && !card.image.includes('back.png')) {
      list.push(card.image);
      if (card.image.endsWith('/high.webp')) {
        list.push(card.image.replace('/high.webp', '/low.webp'));
      }
    }
    if (card.imageUrl && !card.imageUrl.includes('cardback') && !card.imageUrl.includes('back.png')) {
      if (!list.includes(card.imageUrl)) list.push(card.imageUrl);
      if (card.imageUrl.endsWith('/high.webp')) {
        list.push(card.imageUrl.replace('/high.webp', '/low.webp'));
      }
    }

    // 2. TCGPlayer CDN (High res and standard fits)
    if (card.tcgplayerId) {
      list.push(`https://product-images.tcgplayer.com/fit-in/438x438/${card.tcgplayerId}.jpg`);
      list.push(`https://tcgplayer-cdn.tcgplayer.com/product/${card.tcgplayerId}_in_1000x1000.jpg`);
      list.push(`https://product-images.tcgplayer.com/fit-in/650x650/${card.tcgplayerId}.jpg`);
    }

    // 3. Official pokemontcg.io scans
    const cleanId = (card.id || '').toLowerCase();
    const parts = cleanId.split('-');
    const rawSet = parts[0] || '';
    const num = card.number || parts[1] || '';
    const paddedNum = /^\d+$/.test(num) ? num.padStart(3, '0') : num;

    if (rawSet && num) {
      const setSlug = rawSet.replace('.', '').toLowerCase();
      list.push(`https://images.pokemontcg.io/${setSlug}/${num}_hires.png`);
      list.push(`https://images.pokemontcg.io/${setSlug}/${num}.png`);
      if (paddedNum !== num) {
        list.push(`https://images.pokemontcg.io/${setSlug}/${paddedNum}_hires.png`);
        list.push(`https://images.pokemontcg.io/${setSlug}/${paddedNum}.png`);
      }
    }

    // 4. TCGdex Japanese & Asian CDN
    if (rawSet && num) {
      const rawUpper = rawSet.toUpperCase();
      const isSwsh = rawUpper.startsWith('SWSH') || rawUpper.startsWith('S') || rawUpper.startsWith('CS');
      const series = rawUpper.startsWith('ME')
        ? 'ME'
        : rawUpper.startsWith('SV')
        ? 'SV'
        : rawUpper.startsWith('SM')
        ? 'SM'
        : isSwsh
        ? 'S'
        : rawUpper.startsWith('XY')
        ? 'XY'
        : rawUpper.startsWith('BW')
        ? 'BW'
        : 'SV';

      list.push(`https://assets.tcgdex.net/ja/${series}/${rawSet}/${paddedNum}/high.webp`);
      list.push(`https://assets.tcgdex.net/ja/${series}/${rawSet}/${paddedNum}/low.webp`);
      list.push(`https://assets.tcgdex.net/en/${series.toLowerCase()}/${rawSet}/${num}/high.webp`);
      list.push(`https://assets.tcgdex.net/en/${series.toLowerCase()}/${rawSet}/${num}/low.webp`);

      // Special case for Tag All Stars (SM12a) casing
      if (cleanId.includes('sm12a') || rawSet === 'sm12a') {
        list.push(`https://assets.tcgdex.net/ja/SM/sm12a/${paddedNum}/high.webp`);
        list.push(`https://assets.tcgdex.net/ja/sm/sm12a/${paddedNum}/high.webp`);
      }
    }

    return list.filter((url, idx, self) => Boolean(url && self.indexOf(url) === idx));
  };

  const selectedCount = explicitlySelectedIds.size;
  const thresholdMatchCount = results.filter((c) => {
    const enPrice = c.languages?.en?.price ?? (c.price ? parseFloat(String(c.price)) : 0);
    return enPrice >= priceThreshold;
  }).length;

  // Group cards by Pokémon era in chronological order with centered headers
  const NON_LATIN_RE = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uac00-\ud7af]/;

  const groupedByEra = useMemo(() => {
    const map: Record<string, SearchCardResult[]> = {};
    for (const era of ERA_SECTIONS) {
      map[era.id] = [];
    }

    for (const card of results) {
      // Skip cards with non-English card names or set names (they leaked through dedup)
      if (NON_LATIN_RE.test(card.name || '') || NON_LATIN_RE.test(card.setName || card.set_name || '')) {
        continue;
      }

      // Check if any candidate image can be produced
      const candidates = getCardImageCandidates(card);
      if (candidates.length === 0) continue;

      let eraId = getCardEra(card.id, card.setName || card.set_name);
      // Remaps
      if (['ecard', 'neo', 'vintage'].includes(eraId)) eraId = 'classic';
      if (!map[eraId]) {
        map[eraId] = [];
      }
      map[eraId].push(card);
    }

    return ERA_SECTIONS
      .filter((sec) => map[sec.id] && map[sec.id].length > 0)
      .map((sec) => {
        const sortedCards = [...map[sec.id]].sort((a, b) => {
          // 1. Exclusives pinned to the top of each era
          const aEx = a.isExclusive ? 1 : 0;
          const bEx = b.isExclusive ? 1 : 0;
          if (aEx !== bEx) return bEx - aEx;

          // 2. Group remaining cards by Set Name
          const setA = (a.setName || a.set_name || '').toLowerCase().trim();
          const setB = (b.setName || b.set_name || '').toLowerCase().trim();
          if (setA !== setB) return setA.localeCompare(setB);

          // 3. Within each set, group cards by Character / Trainer base name
          const charA = extractCharacterBaseName(a.name || '');
          const charB = extractCharacterBaseName(b.name || '');
          if (charA !== charB) return charA.localeCompare(charB);

          // 4. Order matching characters by card number / rarity
          const numA = parseInt((a.number || a.id.split('-')[1] || '0').replace(/\D/g, ''), 10) || 0;
          const numB = parseInt((b.number || b.id.split('-')[1] || '0').replace(/\D/g, ''), 10) || 0;
          if (numA !== numB) return numA - numB;

          return (a.name || '').localeCompare(b.name || '');
        });

        return {
          ...sec,
          cards: sortedCards
        };
      });
  }, [results]);


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

      {/* View & Layout Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gray-50/90 dark:bg-gray-800/70 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-xs shadow-2xs">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Interactive Card Visual Size Slider */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
              <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Card Visual Size:</span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Compact</span>
            <input
              type="range"
              min="210"
              max="420"
              step="10"
              value={cardMinSize}
              onChange={(e) => setCardMinSize(parseInt(e.target.value, 10))}
              className="w-28 sm:w-40 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              title={`Card min-width: ${cardMinSize}px`}
            />
            <span className="text-[11px] text-gray-400 font-medium">Large</span>
            <span className="text-[11px] font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60">
              {cardMinSize}px
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-600 dark:text-gray-400">Card Density:</span>
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0.5">
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition cursor-pointer ${
                  density === 'comfortable'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition cursor-pointer ${
                  density === 'compact'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Compact
              </button>
            </div>
          </div>
        </div>

        {onFlushCache && (
          <button
            type="button"
            onClick={onFlushCache}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold py-1 px-2.5 rounded-lg text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-900 transition cursor-pointer shadow-2xs"
            title="Purge saved local database caches and re-query live cards"
          >
            <RotateCcw className="w-3 h-3 text-red-500" />
            <span>Flush Local Cache &amp; Reload</span>
          </button>
        )}
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

      {/* 3. Cards Organized by Era with Centered Headers */}
      <div className="space-y-10">
        {groupedByEra.map((sec) => (
          <div key={sec.id} className="space-y-4">
            {/* Centered Era Header with Badges and Divider */}
            <div className="flex items-center justify-center my-6">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
              <div className={`mx-4 px-5 py-2 rounded-2xl bg-linear-to-r ${sec.colorClass} border font-black text-sm tracking-wide shadow-xs flex items-center gap-2.5`}>
                <span className="text-base">{sec.icon}</span>
                <span className="text-[11px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-white/80 dark:bg-gray-900/80 shadow-2xs">
                  {sec.badge}
                </span>
                <span className="font-extrabold">{sec.title}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-gray-900/60 opacity-80">
                  {sec.cards.length} {sec.cards.length === 1 ? 'card' : 'cards'}
                </span>
              </div>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
            </div>

            {/* Dynamic Grid using Card Visual Size Slider */}
            <div
              className={`grid ${density === 'compact' ? 'gap-2.5' : 'gap-3.5'}`}
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinSize}px, 1fr))`
              }}
            >
              {sec.cards.map((card, idx) => {
                const imageCandidates = getCardImageCandidates(card);
                const primaryImg = imageCandidates[0] || '';
                const backupImgs = imageCandidates.slice(1);
                const setName = card.setName || card.set_name || 'Expansion';
                const owned = isOwned ? isOwned(card) : false;
                const inWishlist = isTracked ? isTracked(card) : false;

                const hasLanguages = card.languages && Object.keys(card.languages).length > 1;
                const hasSavings = Boolean(card.savingsVsEnglish && card.savingsVsEnglish > 0);
                const cardLang = card.language || 'en';

                const chosenLang = getChosenLangForCard(card);
                const chosenPrice = getChosenPriceForCard(card, chosenLang);
                const isExplicitlyChosen = explicitlySelectedIds.has(card.id);
                const chosenLangDisplay = LANG_CODE_DISPLAY[chosenLang] || chosenLang.toUpperCase();

                // Dynamic image sizing: scales with the slider
                // At 210px min-width → imgW≈90px; at 420px → imgW≈180px
                const isCompact = density === 'compact';
                const isLarge = cardMinSize >= 330;
                const isXLarge = cardMinSize >= 380;
                const imgW = Math.round(cardMinSize * (isCompact ? 0.38 : 0.42));
                const imgH = Math.round(imgW * 1.4); // standard card aspect ratio

                return (
                  <div
                    key={card.id || idx}
                    className={`group bg-white dark:bg-gray-800/90 rounded-2xl border transition flex flex-col justify-between overflow-hidden ${
                      isCompact ? 'p-2.5' : isLarge ? 'p-4' : 'p-3.5'
                    } ${
                      isExplicitlyChosen
                        ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/30 shadow-md shadow-indigo-500/10'
                        : owned
                        ? 'border-emerald-200 dark:border-emerald-800/60'
                        : 'border-gray-100 dark:border-gray-700/80 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className={`flex ${isCompact ? 'gap-2' : isLarge ? 'gap-3.5' : 'gap-2.5'} min-w-0`}>
                        {/* Card Image — dynamically sized via slider */}
                        <div
                          className="shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1 relative"
                          style={{ width: `${imgW}px`, height: `${imgH}px` }}
                        >
                          <SafeImage
                            src={primaryImg}
                            fallbackSrc={backupImgs[0]}
                            backupSrcs={backupImgs.slice(1)}
                            alt={card.name}
                            fallbackText={card.name}
                            className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-200"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-start">
                          <div className="flex items-center gap-1 flex-wrap max-w-full">
                            {owned && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 flex items-center gap-0.5 shrink-0">
                                ✓ Owned
                              </span>
                            )}
                            {card.isExclusive ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 truncate">
                                {LANG_CODE_DISPLAY[cardLang] || cardLang.toUpperCase()} Exclusive
                              </span>
                            ) : cardLang !== 'en' ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate">
                                {LANG_CODE_DISPLAY[cardLang] || cardLang.toUpperCase()}
                              </span>
                            ) : null}

                            {isExplicitlyChosen && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/90 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shrink-0">
                                🎯 {chosenLangDisplay} Chosen
                              </span>
                            )}
                          </div>

                          <h4 className={`font-bold text-gray-900 dark:text-gray-100 ${isXLarge ? 'text-lg font-black' : isLarge ? 'text-base font-extrabold' : 'text-sm font-bold'} leading-tight truncate mt-1 block`} title={card.name}>
                            {card.name}
                          </h4>

                          <span className={`${isXLarge ? 'text-sm font-semibold' : isLarge ? 'text-xs font-semibold' : 'text-xs font-medium'} text-blue-600 dark:text-blue-400 truncate mt-0.5 block`} title={setName}>
                            {setName}
                          </span>

                          {card.rarity && card.rarity.toLowerCase() !== 'none' && (
                            <span className={`inline-block mt-1 ${isXLarge ? 'text-xs' : isLarge ? 'text-[11px]' : 'text-[10px]'} font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/60 max-w-full truncate`} title={card.rarity}>
                              {card.rarity}
                            </span>
                          )}

                          <div className="mt-auto pt-1 flex items-baseline gap-1.5 flex-wrap">
                            <span className={`${isXLarge ? 'text-sm font-medium' : isLarge ? 'text-xs font-medium' : 'text-[11px]'} text-gray-400 shrink-0`}>
                              {`${LANG_CODE_DISPLAY[cardLang] || 'EN'} Mkt:`}
                            </span>
                            <span className={`${isXLarge ? 'text-xl font-black' : isLarge ? 'text-lg font-black' : 'text-sm font-extrabold'} text-gray-900 dark:text-gray-100 truncate`}>
                              {card.price ? formatCurrency(card.price) : 'N/A'}
                            </span>
                            {card.pricingSource && (
                              <span className={`${isXLarge ? 'text-[11px]' : 'text-[9px]'} font-semibold px-1 rounded truncate ${
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
                        <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/60 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`${isXLarge ? 'text-xs font-bold' : isLarge ? 'text-xs font-bold' : 'text-[11px] font-bold'} text-gray-500 dark:text-gray-400`}>Pick Language:</span>
                            {hasSavings && (
                              <span className={`${isXLarge ? 'text-xs font-black px-2 py-0.5' : isLarge ? 'text-[11px] font-black px-1.5 py-0.5' : 'text-[10px] font-black px-1.5 py-0.2'} text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-800/50 truncate`}>
                                Save {card.savingsVsEnglish}% on {LANG_CODE_DISPLAY[card.cheapestLanguage || 'alt'] || 'ALT'}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[11px]">
                            {Object.entries(card.languages!).map(([langKey, langInfo]) => {
                              const isTileSelected = chosenLang === langKey;
                              const isTileExplicit = isExplicitlyChosen && isTileSelected;
                              const isCheapest = langInfo.isCheapest;

                              return (
                                <button
                                  key={langKey}
                                  type="button"
                                  onClick={() => handleSelectCardLang(card.id, langKey as CardLanguage)}
                                  className={`${isXLarge ? 'px-2.5 py-1.5 text-xs' : isLarge ? 'px-2 py-1 text-[11px]' : 'px-1.5 py-1 text-[10px]'} rounded-lg border flex items-center justify-between transition-all cursor-pointer min-w-0 ${
                                    isTileExplicit
                                      ? 'bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-500 dark:border-indigo-400 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/90 shadow-md shadow-indigo-500/30 scale-[1.02] font-black'
                                      : isTileSelected
                                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-400 shadow-2xs font-bold'
                                      : 'bg-gray-50 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/80'
                                  }`}
                                  title={`Click to select ${LANG_FLAGS[langKey as CardLanguage] || LANG_CODE_DISPLAY[langKey] || langKey.toUpperCase()} for Quick Add`}
                                >
                                  <span className="flex items-center gap-0.5 min-w-0 truncate">
                                    <span className="truncate">{LANG_FLAGS[langKey as CardLanguage] || LANG_CODE_DISPLAY[langKey] || langKey.toUpperCase()}</span>
                                    {isTileExplicit && (
                                      <span className="text-[8px] bg-indigo-600 text-white font-black px-0.5 rounded-xs">
                                        ✓
                                      </span>
                                    )}
                                    {!isTileExplicit && isCheapest && (
                                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">★</span>
                                    )}
                                  </span>
                                  <span className={`${isXLarge ? 'font-black text-xs' : isLarge ? 'font-extrabold text-[11px]' : 'font-semibold text-[10px]'} shrink-0 ml-1`}>{formatCurrency(langInfo.price)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2.5 border-t border-gray-100 dark:border-gray-700/60 mt-2 space-y-1.5">
                      {/* 1. Chosen / Lowest-Cost Version Wishlist Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onAddOptimizedToList) {
                            onAddOptimizedToList(card, chosenLang);
                          }
                        }}
                        className={`w-full flex items-center justify-center gap-1.5 ${isXLarge ? 'text-sm font-black py-2.5 px-3' : isLarge ? 'text-xs font-bold py-2 px-2' : 'text-xs font-bold py-1.5 px-2'} rounded-xl transition cursor-pointer truncate ${
                          isExplicitlyChosen
                            ? 'bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-purple-700 text-white ring-2 ring-indigo-400/50 shadow-md shadow-indigo-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        }`}
                        title={`Add ${chosenLangDisplay} version to Wishlist at ${formatCurrency(chosenPrice)}`}
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {isExplicitlyChosen ? 'Wishlist Chosen' : 'Wishlist Cheapest'} ({chosenLangDisplay}: {formatCurrency(chosenPrice)})
                        </span>
                      </button>

                      {/* 2. Action Buttons: I Own This, Wishlist & Snipe */}
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenOwnModal) {
                              onOpenOwnModal(card);
                            } else if (onToggleOwned) {
                              onToggleOwned(card);
                            }
                          }}
                          className={`flex items-center justify-center gap-1 ${isXLarge ? 'py-2.5 text-xs font-bold' : isLarge ? 'py-2 text-xs font-bold' : 'py-1.5 text-xs font-semibold'} px-1 rounded-xl transition border cursor-pointer min-w-0 ${
                            owned
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs hover:bg-emerald-700'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          }`}
                          title={owned ? 'Card is in your collection - click to edit details' : 'Mark as owned (set price, language, condition)'}
                        >
                          {owned ? <Check className="w-3 h-3 shrink-0" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />}
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
                          } ${isXLarge ? 'py-2.5 text-xs font-bold' : isLarge ? 'py-2 text-xs font-bold' : 'py-1.5 text-xs font-semibold'} px-1 rounded-xl transition min-w-0`}
                        >
                          {inWishlist ? <Check className="w-3 h-3 shrink-0" /> : <Bookmark className="w-3 h-3 shrink-0" />}
                          <span className="truncate">{inWishlist ? 'Wishlisted' : 'Wishlist'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenSniper(card)}
                          className={`flex items-center justify-center gap-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 ${isXLarge ? 'py-2.5 text-xs font-bold' : isLarge ? 'py-2 text-xs font-bold' : 'py-1.5 text-xs font-semibold'} px-1 rounded-xl transition cursor-pointer min-w-0`}
                        >
                          <Target className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="truncate">Snipe</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
</div>
  );
}
