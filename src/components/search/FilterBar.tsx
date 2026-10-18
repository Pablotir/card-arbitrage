'use client';

import { useState, useRef, useEffect } from 'react';
import { SearchFilterState, CardLanguage } from '@/lib/types';
import { POKEMON_ERAS, SPECIAL_CARD_TYPES } from '@/lib/exclusiveRegistry';
import { ChevronDown, X, Check, Sparkles, Filter, EyeOff, Calendar, Flame, Layers } from 'lucide-react';

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
  { id: 'zh', label: 'Chinese (CH)', flag: '🇨🇳' },
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
      eras: [],
      specialTypes: [],
      onlyUnowned: true
    });
    if (onApplySearch) setTimeout(onApplySearch, 50);
  };

  // Quick Preset: Classic Holy Grails (Gold Stars, Primes, LV.X)
  const handlePresetVintageGrails = () => {
    onChange({
      ...filters,
      languages: ['en', 'ja'],
      specialTypes: ['gold-star', 'prime', 'lv-x', 'legend', 'shining-crystal', 'classic-ex']
    });
    if (onApplySearch) setTimeout(onApplySearch, 50);
  };

  // Quick Preset: Stamped & Collaboration Promos (Food & Non-Food)
  const handlePresetStampedPromos = () => {
    onChange({
      ...filters,
      languages: ['en', 'ja', 'zh'],
      specialTypes: ['stamped-promos', 'exclusives-only']
    });
    if (onApplySearch) setTimeout(onApplySearch, 50);
  };

  // Quick Preset: Tag Team & Alt Arts
  const handlePresetTagTeamAltArts = () => {
    onChange({
      ...filters,
      languages: ['en', 'ja'],
      specialTypes: ['tag-team', 'alt-art', 'sir']
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
    (filters.eras?.length || 0) +
    (filters.specialTypes?.length || 0) +
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
          <span>🌟 Full Art Trainers (Unowned)</span>
        </button>
        <button
          type="button"
          onClick={handlePresetVintageGrails}
          className="bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 shadow-2xs"
        >
          <span>★ Gold Stars, Primes &amp; LV.X</span>
        </button>
        <button
          type="button"
          onClick={handlePresetStampedPromos}
          className="bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 shadow-2xs"
        >
          <span>🏷️ Stamped Promos &amp; Collabs</span>
        </button>
        <button
          type="button"
          onClick={handlePresetTagTeamAltArts}
          className="bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 shadow-2xs"
        >
          <span>🤝 Tag Team &amp; Alt Arts</span>
        </button>
        <button
          type="button"
          onClick={handlePresetAllLanguages}
          className="bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 shadow-2xs"
        >
          <span>🌐 Compare 4 Languages (EN, JP, KR, CH)</span>
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
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isChecked = filters.languages?.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleArrayItem('languages', opt.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
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

        {/* 2. Category Multi-Select Dropdown */}
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
            <span>Category</span>
            {filters.categories?.length > 0 && (
              <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-extrabold">
                {filters.categories.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {openDropdown === 'categories' && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Card Category</span>
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
                <span className="font-bold text-gray-700 dark:text-gray-300">Card Rarities</span>
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
                      <span className="truncate">{r}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
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

        {/* 4. Eras & Generations Multi-Select Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('eras')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-2xs ${
              (filters.eras?.length || 0) > 0
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Era / Gen</span>
            {(filters.eras?.length || 0) > 0 && (
              <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-extrabold">
                {filters.eras!.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {openDropdown === 'eras' && (
            <div className="absolute left-0 top-full mt-1.5 w-72 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Eras &amp; Generations</span>
                {(filters.eras?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, eras: [] })}
                    className="text-indigo-600 hover:underline text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="pt-1 space-y-0.5">
                {POKEMON_ERAS.map((era) => {
                  const isChecked = filters.eras?.includes(era.id);
                  return (
                    <button
                      key={era.id}
                      type="button"
                      onClick={() => toggleArrayItem('eras', era.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-medium truncate">{era.name}</span>
                        <span className="text-[10px] text-gray-400">{era.years}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
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

        {/* 5. Special Cards & Mechanics Multi-Select Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('specialTypes')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-2xs ${
              (filters.specialTypes?.length || 0) > 0
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Special Types</span>
            {(filters.specialTypes?.length || 0) > 0 && (
              <span className="bg-amber-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-extrabold">
                {filters.specialTypes!.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {openDropdown === 'specialTypes' && (
            <div className="absolute left-0 top-full mt-1.5 w-80 max-h-84 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Special Cards &amp; Mechanics</span>
                {(filters.specialTypes?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, specialTypes: [] })}
                    className="text-amber-600 hover:underline text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="pt-1 space-y-0.5">
                {SPECIAL_CARD_TYPES.map((st) => {
                  const isChecked = filters.specialTypes?.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleArrayItem('specialTypes', st.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-xs truncate">{st.label}</span>
                        <span className="text-[10px] text-gray-400 leading-tight line-clamp-1">{st.era}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          isChecked
                            ? 'bg-amber-600 border-amber-600 text-white'
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

        {/* 6. Condition Multi-Select Dropdown */}
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

        {/* 7. Printing Multi-Select Dropdown */}
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
                <span className="font-bold text-gray-700 dark:text-gray-300">Printing / Foil</span>
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

        {/* 8. Missing from Collection ("Cards I Don't Have") Toggle */}
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

          {/* Era Chips */}
          {filters.eras?.map((eraId) => {
            const era = POKEMON_ERAS.find((e) => e.id === eraId);
            return (
              <span
                key={eraId}
                className="inline-flex items-center gap-1.5 border border-indigo-500/60 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                <Calendar className="w-3 h-3" />
                <span>{era?.name || eraId.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => toggleArrayItem('eras', eraId)}
                  className="hover:text-indigo-900 dark:hover:text-indigo-100 p-0.5"
                  aria-label={`Remove ${era?.name} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Special Types Chips */}
          {filters.specialTypes?.map((typeId) => {
            const st = SPECIAL_CARD_TYPES.find((s) => s.id === typeId);
            return (
              <span
                key={typeId}
                className="inline-flex items-center gap-1.5 border border-amber-500/60 bg-amber-50/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{st?.label || typeId}</span>
                <button
                  type="button"
                  onClick={() => toggleArrayItem('specialTypes', typeId)}
                  className="hover:text-amber-900 dark:hover:text-amber-100 p-0.5"
                  aria-label={`Remove ${st?.label} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

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
