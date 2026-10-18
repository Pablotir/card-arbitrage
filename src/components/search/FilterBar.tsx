'use client';

import { useState, useRef, useEffect } from 'react';
import { SearchFilterState, CardLanguage } from '@/lib/types';
import { ChevronDown, X, Check, Sparkles, Filter, EyeOff } from 'lucide-react';

interface FilterBarProps {
  filters: SearchFilterState;
  onChange: (newFilters: SearchFilterState) => void;
  onClear: () => void;
  onApplySearch?: () => void;
  totalResults?: number;
  ownedCount?: number;
}

const LANGUAGE_OPTIONS: Array<{ id: CardLanguage; label: string; flag: string }> = [
  { id: 'en', label: 'English (EN)', flag: '🇺🇸' },
  { id: 'ja', label: 'Japanese (JP)', flag: '🇯🇵' },
  { id: 'ko', label: 'Korean (KR)', flag: '🇰🇷' },
  { id: 'zh', label: 'Chinese (ZH)', flag: '🇨🇳' },
  { id: 'onepiece', label: 'One Piece', flag: '🏴‍☠️' },
];

const CATEGORY_OPTIONS = [
  'Supporter',
  'Item',
  'Stadium',
  'Tool',
  'Trainer',
  'Pokémon',
  'Energy',
];

const RARITY_OPTIONS = [
  'Promo',
  'Ultra Rare',
  'Special Illustration Rare',
  'Secret Rare',
  'Illustration Rare',
  'Art Rare',
  'Hyper Rare',
  'Super Rare',
  'Full Art Trainer',
  'Shiny Holo Rare',
  'Prism Rare',
  'Classic Collection',
  'Character Rare',
  'Character Super Rare',
  'Kagayaku',
  'Holo Rare',
  'Rare Holo',
  'Rare',
  'Double Rare',
  'ACE SPEC Rare',
  'Uncommon',
  'Common',
  'None',
];

const CONDITION_OPTIONS = [
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
  'Damaged',
];

const PRINTING_OPTIONS = [
  'Normal',
  'Holofoil',
  'Reverse Holofoil',
  '1st Edition',
];

export function FilterBar({
  filters,
  onChange,
  onClear,
  onApplySearch,
  totalResults
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Generic multi-select toggle
  const toggleArrayItem = <T extends string>(
    field: keyof SearchFilterState,
    item: T
  ) => {
    const list = (filters[field] as T[]) || [];
    const exists = list.includes(item);
    const updated = exists ? list.filter((i) => i !== item) : [...list, item];
    onChange({ ...filters, [field]: updated });
  };

  // Quick Preset: Full Art Trainers (Unowned)
  const handlePresetFullArtTrainers = () => {
    onChange({
      ...filters,
      languages: ['en', 'ja'],
      categories: ['Supporter'],
      rarities: [
        'Promo',
        'Ultra Rare',
        'Special Illustration Rare',
        'Secret Rare',
        'Super Rare',
        'Illustration Rare',
        'Art Rare',
        'Character Super Rare',
        'Character Rare',
        'Full Art Trainer'
      ],
      onlyUnowned: true
    });
    if (onApplySearch) setTimeout(onApplySearch, 50);
  };

  // Quick Preset: All 4 Languages Multi-Comparison
  const handlePresetAllLanguages = () => {
    onChange({
      ...filters,
      languages: ['en', 'ja', 'ko', 'zh']
    });
    if (onApplySearch) setTimeout(onApplySearch, 50);
  };

  // Calculate active filter count
  const activeCount =
    (filters.languages?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.rarities?.length || 0) +
    (filters.conditions?.length || 0) +
    (filters.printings?.length || 0) +
    (filters.onlyUnowned ? 1 : 0);

  return (
    <div ref={containerRef} className="space-y-3 pt-2">
      {/* Quick Action Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-gray-400 dark:text-gray-500 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Quick Finds:
        </span>
        <button
          type="button"
          onClick={handlePresetFullArtTrainers}
          className="bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 shadow-2xs"
        >
          <span>🌟 Full Art Trainers I Don&apos;t Have</span>
        </button>
        <button
          type="button"
          onClick={handlePresetAllLanguages}
          className="bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 shadow-2xs"
        >
          <span>🌐 Compare All 4 Languages (EN, JP, KR, ZH)</span>
        </button>
      </div>

      {/* Main Filter Bar Triggers (All Multi-Select) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Active Filters Counter */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-2xs">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ml-0.5">
              {activeCount}
            </span>
          )}
        </div>

        {/* 1. Language Multi-Select Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('languages')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-2xs ${
              filters.languages?.length > 0
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300'
            }`}
          >
            <span>Language</span>
            {filters.languages?.length > 0 && (
              <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-extrabold">
                {filters.languages.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {openDropdown === 'languages' && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Select Languages</span>
                {filters.languages?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, languages: [] })}
                    className="text-blue-600 hover:underline text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="pt-1 space-y-0.5">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isChecked = filters.languages?.includes(lang.id);
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => toggleArrayItem('languages', lang.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Category / Subtype Multi-Select Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('categories')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-2xs ${
              filters.categories?.length > 0
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300'
            }`}
          >
            <span>Card Type</span>
            {filters.categories?.length > 0 && (
              <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-extrabold">
                {filters.categories.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {openDropdown === 'categories' && (
            <div className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Select Types</span>
                {filters.categories?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, categories: [] })}
                    className="text-blue-600 hover:underline text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="pt-1 space-y-0.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isChecked = filters.categories?.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleArrayItem('categories', cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span>{cat}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Rarity Multi-Select Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('rarities')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-2xs ${
              filters.rarities?.length > 0
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300'
            }`}
          >
            <span>Rarity</span>
            {filters.rarities?.length > 0 && (
              <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-extrabold">
                {filters.rarities.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {openDropdown === 'rarities' && (
            <div className="absolute left-0 top-full mt-1.5 w-64 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Select Rarities</span>
                {filters.rarities?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, rarities: [] })}
                    className="text-blue-600 hover:underline text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="pt-1 space-y-0.5">
                {RARITY_OPTIONS.map((r) => {
                  const isChecked = filters.rarities?.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleArrayItem('rarities', r)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span>{r}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. Condition Multi-Select Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('conditions')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-2xs ${
              filters.conditions?.length > 0
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300'
            }`}
          >
            <span>Condition</span>
            {filters.conditions?.length > 0 && (
              <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-extrabold">
                {filters.conditions.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {openDropdown === 'conditions' && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Conditions</span>
                {filters.conditions?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, conditions: [] })}
                    className="text-blue-600 hover:underline text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="pt-1 space-y-0.5">
                {CONDITION_OPTIONS.map((c) => {
                  const isChecked = filters.conditions?.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleArrayItem('conditions', c)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span>{c}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. Printing Multi-Select Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('printings')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-2xs ${
              filters.printings?.length > 0
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300'
            }`}
          >
            <span>Printing</span>
            {filters.printings?.length > 0 && (
              <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-extrabold">
                {filters.printings.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {openDropdown === 'printings' && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Printings</span>
                {filters.printings?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, printings: [] })}
                    className="text-blue-600 hover:underline text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="pt-1 space-y-0.5">
                {PRINTING_OPTIONS.map((p) => {
                  const isChecked = filters.printings?.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleArrayItem('printings', p)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span>{p}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 6. Missing from Collection ("Cards I Don't Have") Toggle */}
        <button
          type="button"
          onClick={() => onChange({ ...filters, onlyUnowned: !filters.onlyUnowned })}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-2xs ${
            filters.onlyUnowned
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
          }`}
          title="Filter out cards already in your wishlist or collection"
        >
          <EyeOff className={`w-3.5 h-3.5 ${filters.onlyUnowned ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
          <span>Cards I Don&apos;t Have</span>
          {filters.onlyUnowned && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        {/* Apply Search Button */}
        {onApplySearch && (
          <button
            type="button"
            onClick={onApplySearch}
            className="ml-auto inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-xs"
          >
            Apply Filters
          </button>
        )}
      </div>

      {/* Active Filter Chips Row (matching TCGPlayer UI) */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {/* Language Chips */}
          {filters.languages?.map((langId) => {
            const opt = LANGUAGE_OPTIONS.find((o) => o.id === langId);
            return (
              <span
                key={langId}
                className="inline-flex items-center gap-1.5 border border-blue-500/60 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                <span>{opt?.flag} {opt?.label}</span>
                <button
                  type="button"
                  onClick={() => toggleArrayItem('languages', langId)}
                  className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5"
                  aria-label={`Remove ${opt?.label} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Category Chips */}
          {filters.categories?.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1.5 border border-blue-500/60 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg text-xs font-semibold"
            >
              {cat}
              <button
                type="button"
                onClick={() => toggleArrayItem('categories', cat)}
                className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5"
                aria-label={`Remove ${cat} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Rarity Chips */}
          {filters.rarities?.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1.5 border border-blue-500/60 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg text-xs font-semibold"
            >
              {r}
              <button
                type="button"
                onClick={() => toggleArrayItem('rarities', r)}
                className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5"
                aria-label={`Remove ${r} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Condition Chips */}
          {filters.conditions?.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 border border-blue-500/60 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg text-xs font-semibold"
            >
              {c}
              <button
                type="button"
                onClick={() => toggleArrayItem('conditions', c)}
                className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5"
                aria-label={`Remove ${c} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Printing Chips */}
          {filters.printings?.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 border border-blue-500/60 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg text-xs font-semibold"
            >
              {p}
              <button
                type="button"
                onClick={() => toggleArrayItem('printings', p)}
                className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5"
                aria-label={`Remove ${p} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Missing from Collection Chip */}
          {filters.onlyUnowned && (
            <span className="inline-flex items-center gap-1.5 border border-emerald-500/60 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
              Missing from Wishlist/Collection
              <button
                type="button"
                onClick={() => onChange({ ...filters, onlyUnowned: false })}
                className="hover:text-emerald-900 dark:hover:text-emerald-100 p-0.5"
                aria-label="Remove missing filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Clear Filters Link */}
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:underline px-2 py-1 ml-1"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
