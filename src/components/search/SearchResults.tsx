'use client';

import React, { useState, useMemo } from 'react';
import { SearchCardResult, CardLanguage } from '@/lib/types';
import { Target, CheckCircle2, Sparkles, Bookmark, Check, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { SafeImage } from '../ui/SafeImage';
import { getCardEra, CURATED_TRUE_EXCLUSIVES } from '@/lib/exclusiveRegistry';
import { getKnownCardPrice } from '@/lib/knownPrices';

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

export const LANG_CODE_DISPLAY: Record<string, string> = {
  en: 'EN',
  ja: 'JP',
  jp: 'JP',
  ko: 'KR',
  kr: 'KR',
  zh: 'CH',
  ch: 'CH',
  onepiece: 'OP',
  op: 'OP'
};

export function formatLangCode(code?: string): string {
  if (!code) return 'EN';
  const norm = code.toLowerCase().trim();
  return LANG_CODE_DISPLAY[norm] || norm.toUpperCase();
}

/**
 * Extracts the base character/trainer name from a card title for grouping.
 * E.g. "Bianca's Devotion (Special Illustration Rare)" -> "bianca's devotion"
 */
function extractCharacterBaseName(name: string): string {
  return (name || '')
    .replace(/\s*\[(JP|JA|CH|ZH|KO|KR|EN|OP)\s*Exclusive\]/gi, '')
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

export interface PromoSubEraDef {
  id: string;
  title: string;
  badge: string;
  icon: string;
}

export const PROMO_SUB_ERAS: PromoSubEraDef[] = [
  { id: 'me_promo', title: 'Mega Evolution Promos', badge: 'ME-P', icon: '⚡' },
  { id: 'sv_promo', title: 'Scarlet & Violet Promos', badge: 'SV-P', icon: '🌟' },
  { id: 'swsh_promo', title: 'Sword & Shield Promos', badge: 'SWSH-P', icon: '⚔️' },
  { id: 'sm_promo', title: 'Sun & Moon Promos (inc. Extra Battle Day)', badge: 'SM-P', icon: '☀️' },
  { id: 'xy_promo', title: 'XY Series Promos', badge: 'XY-P', icon: '💎' },
  { id: 'bw_promo', title: 'Black & White Promos', badge: 'BW-P', icon: '⚫' },
  { id: 'classic_promo', title: 'Vintage & Classic Promos (HGSS / DP / WotC)', badge: 'Classic-P', icon: '📜' },
  { id: 'collab_promo', title: 'Special Collaborations & Stamped Exclusives', badge: 'Collab', icon: '🎁' }
];

export function isPromoCard(card: SearchCardResult): boolean {
  if (!card) return false;
  const name = (card.name || '').toLowerCase();
  const set = (card.setName || card.set_name || '').toLowerCase();
  const rarity = (card.rarity || '').toLowerCase();
  const id = (card.id || '').toLowerCase();

  // EXCLUSIONS from generic promo routing:
  // 1. N's Plan and Hilda are expansion SARs from Black Bolt (CSV11) and White Flare (CSV12), NOT promos!
  if (
    id.includes('ns-plan') ||
    id.includes('hilda') ||
    id.includes('csv11') ||
    id.includes('csv12') ||
    set.includes('black bolt') ||
    set.includes('white flare')
  ) {
    return false;
  }

  // 2. Other Chinese expansion sets (CSV, Starry Crystal, Gem Pack, Collect 151 C)
  if (id.startsWith('csv') || id.includes('151c') || set.includes('starry crystal') || set.includes('gem pack')) {
    return false;
  }

  // 3. Celebrations (Professor's Research - Oak) belongs in SWSH Era (25th Anniversary), not promo
  if (set.includes('celebrations') || id.startsWith('cel25') || id.startsWith('swsh-cel')) {
    return false;
  }

  // 4. 30th Anniversary / 30th Celebration cards belong in Mega Evolution Era, not promo
  if (set.includes('30th celebration') || set.includes('30th anniversary') || id.includes('30th') || set.includes('m6a') || id.startsWith('m6a')) {
    return false;
  }

  // 5. Extra Battle Day, Alolan Friends, The Masked Royal belong in the Sun & Moon Era!
  if (
    set.includes('extra battle day') ||
    name.includes('extra battle day') ||
    id === 'sm-p-395' ||
    id === 'sm-p-396' ||
    id === 'sm-p-397' ||
    id === 'sm-p-398' ||
    id === 'sm-p-399' ||
    id === 'sm-p-401' ||
    id === 'sm-p-064' ||
    id === 'sm-p-100' ||
    name.includes('alolan friends') ||
    name.includes('masked royal')
  ) {
    return false;
  }

  // Stamped & Retail/Food Collaborations always route to 'other'
  if (
    set.includes('mcdonald') ||
    set.includes('happy meal') ||
    set.includes('pizza hut') ||
    set.includes('domino') ||
    set.includes('special delivery') ||
    set.includes('van gogh') ||
    set.includes('yu nagaba') ||
    name.includes('special delivery') ||
    name.includes('grey felt hat') ||
    name.includes('yu nagaba') ||
    name.includes('burgerchu') ||
    name.includes('toys "r" us') ||
    name.includes('gamestop')
  ) {
    return true;
  }

  // Stamped promos
  if (set.includes('stamped') || name.includes('stamped')) {
    return true;
  }

  // Specific Promo series (Black Star Promos)
  if (
    set.includes('black star') ||
    id.startsWith('swshp') ||
    id.startsWith('svp') ||
    id.startsWith('xyp') ||
    id.startsWith('bwp') ||
    id.startsWith('s-p-') ||
    id.startsWith('xy-p-') ||
    id.startsWith('bw-p-') ||
    id.startsWith('sv-p-')
  ) {
    return true;
  }

  if (rarity.includes('promo') || name.includes('promo')) {
    return true;
  }

  return false;
}

export function getPromoSubEra(card: SearchCardResult): string {
  const name = (card.name || '').toLowerCase();
  const set = (card.setName || card.set_name || '').toLowerCase();
  const id = (card.id || '').toLowerCase();

  if (
    set.includes('mcdonald') ||
    set.includes('pizza hut') ||
    set.includes('domino') ||
    set.includes('van gogh') ||
    set.includes('yu nagaba') ||
    set.includes('special delivery') ||
    name.includes('special delivery') ||
    name.includes('grey felt hat') ||
    name.includes('yu nagaba') ||
    name.includes('burgerchu') ||
    id.includes('m-p')
  ) {
    return 'collab_promo';
  }

  const era = getCardEra(card.id, card.setName || card.set_name);
  if (era === 'me') return 'me_promo';
  if (era === 'sv') return 'sv_promo';
  if (era === 'swsh') return 'swsh_promo';
  if (era === 'sm') return 'sm_promo';
  if (era === 'xy') return 'xy_promo';
  if (era === 'bw') return 'bw_promo';
  if (['hgss', 'dp', 'ex', 'classic', 'ecard', 'neo', 'vintage'].includes(era)) return 'classic_promo';
  return 'collab_promo';
}

/**
 * Returns numeric release timestamp (YYYYMM) for chronological set sorting (newest first).
 * Precisely calibrated to match official TCGPlayer release order for both English and Japanese sets.
 */
export function getSetReleaseWeight(setName?: string, cardId?: string): number {
  const s = (setName || '').toLowerCase();
  const id = (cardId || '').toLowerCase();

  // 1. Mega Evolution English & Japanese Sets (2025 - 2026)
  if (s.includes('delta reign') || id.startsWith('me06') || s.includes('me06')) return 202612;
  if (s.includes('ascended heroes') || id.includes('ascended') || s.includes('me: ascended')) return 202611;
  if (s.includes('30th celebration') || s.includes('30th anniversary') || id.includes('30th') || s.includes('m6a') || id.startsWith('m6a')) return 202610;
  if (s.includes('storm emeralda') || id.startsWith('m6') || s.includes('m6:')) return 202609;
  if (s.includes('pitch black') || id.startsWith('me05') || s.includes('me05')) return 202609;
  if (s.includes('abyss eye') || id.startsWith('m5') || s.includes('m5:')) return 202608;
  if (s.includes('chaos rising') || id.startsWith('me04') || s.includes('me04')) return 202608;
  if (s.includes('ninja spinner') || id.startsWith('m4') || s.includes('m4:')) return 202607;
  if (s.includes('perfect order') || id.startsWith('me03') || s.includes('me03')) return 202607;
  if (s.includes('nihil zero') || id.startsWith('m3') || s.includes('m3:')) return 202606;
  if (s.includes('phantasmal flames') || id.startsWith('me02') || s.includes('me02')) return 202606;
  if (s.includes('mega dream ex') || id.startsWith('m2a') || s.includes('m2a')) return 202605;
  if (s.includes('inferno x') || id.startsWith('m2') || s.includes('m2:')) return 202604;
  if (s.includes('mega brave') || id.startsWith('m1l') || s.includes('m1l')) return 202603;
  if (s.includes('mega symphonia') || id.startsWith('m1s') || s.includes('m1s')) return 202602;
  if (s.includes('mega evolution') || id.startsWith('me01') || s.includes('me01') || id.startsWith('me-') || id.startsWith('me/')) return 202601;

  // 2. Scarlet & Violet (2023 - 2025)
  if (s.includes('black bolt') || id.includes('csv11') || s.includes('csv11') || id.includes('sv11b') || s.includes('sv11b')) return 202509;
  if (s.includes('white flare') || id.includes('csv12') || s.includes('csv12') || id.includes('sv11w') || s.includes('sv11w')) return 202508;
  if (s.includes('team rocket') || s.includes('glory of team rocket') || id.startsWith('sv10') || s.includes('sv10')) return 202504;
  if (s.includes('heat wave arena') || id.startsWith('sv9a') || s.includes('sv9a')) return 202503;
  if (s.includes('battle partners') || id.startsWith('sv9') || s.includes('sv9')) return 202501;
  if (s.includes('prismatic evolutions') || s.includes('terastal festival') || id.startsWith('sv8pt5') || id.startsWith('sv8a') || s.includes('sv8a')) return 202412;
  if (s.includes('surging sparks') || s.includes('super electric breaker') || id.startsWith('sv8') || s.includes('sv8')) return 202411;
  if (s.includes('paradise dragona') || id.startsWith('sv7a') || s.includes('sv7a')) return 202409;
  if (s.includes('stellar crown') || s.includes('stellar miracle') || id.startsWith('sv7') || id.includes('csv9pt5c')) return 202409;
  if (s.includes('starry crystal') || id.includes('csv9c') || s.includes('csv9c')) return 202409;
  if (s.includes('shrouded fable') || s.includes('night wanderer') || id.startsWith('sv6pt5') || id.startsWith('sv6a') || id.includes('csv8c')) return 202408;
  if (s.includes('twilight masquerade') || s.includes('mask of change') || id.startsWith('sv6') || id.includes('csv7c')) return 202405;
  if (s.includes('crimson haze') || id.startsWith('sv5a') || s.includes('sv5a')) return 202403;
  if (s.includes('temporal forces') || s.includes('cyber judge') || s.includes('wild force') || id.startsWith('sv5') || id.includes('csv5c')) return 202403;
  if (s.includes('paldean fates') || s.includes('shiny treasure') || id.startsWith('sv4pt5') || id.startsWith('sv4a')) return 202401;
  if (s.includes('paradox rift') || s.includes('ancient roar') || s.includes('future flash') || id.startsWith('sv4') || id.includes('csv4c')) return 202311;
  if (s.includes('raging surf') || id.startsWith('sv3a') || s.includes('sv3a')) return 202309;
  if (s.includes('151') || id.startsWith('sv3pt5') || id.startsWith('sv2a') || id.includes('151c')) return 202309;
  if (s.includes('obsidian flames') || s.includes('ruler of the black flame') || id.startsWith('sv3')) return 202308;
  if (s.includes('paldea evolved') || s.includes('clay burst') || s.includes('snow hazard') || id.startsWith('sv2')) return 202306;
  if (s.includes('triplet beat') || id.startsWith('sv1a') || s.includes('sv1a')) return 202303;
  if (s.includes('scarlet & violet') || s.includes('scarlet ex') || s.includes('violet ex') || id.startsWith('sv1')) return 202303;

  // 3. Sword & Shield (2020 - 2023)
  if (s.includes('crown zenith') || s.includes('vstar universe') || id.startsWith('swsh12pt5') || id.startsWith('swsh12pt5gg') || id.startsWith('s12a')) return 202301;
  if (s.includes('silver tempest') || s.includes('paradigm trigger') || id.startsWith('swsh12') || id.startsWith('swsh12tg') || id.startsWith('s12')) return 202211;
  if (s.includes('incandescent arcana') || id.startsWith('s11a') || s.includes('s11a')) return 202209;
  if (s.includes('lost origin') || s.includes('lost abyss') || id.startsWith('swsh11') || id.startsWith('swsh11tg') || id.startsWith('s11')) return 202209;
  if (s.includes('pokemon go') || id.startsWith('pgo') || id.startsWith('swsh10pt5')) return 202207;
  if (s.includes('dark phantasma') || id.startsWith('s10a') || s.includes('s10a')) return 202205;
  if (s.includes('astral radiance') || s.includes('space juggler') || s.includes('time gazer') || id.startsWith('swsh10') || id.startsWith('swsh10tg') || id.startsWith('s10')) return 202205;
  if (s.includes('battle region') || id.startsWith('s9a') || s.includes('s9a')) return 202202;
  if (s.includes('brilliant stars') || s.includes('star birth') || id.startsWith('swsh9') || id.startsWith('swsh9tg') || id.startsWith('s9')) return 202202;
  if (s.includes('vmax climax') || id.startsWith('s8b') || s.includes('s8b')) return 202112;
  if (s.includes('fusion strike') || s.includes('fusion arts') || id.startsWith('swsh8') || id.startsWith('s8')) return 202111;
  if (s.includes('celebrations') || s.includes('25th anniversary') || id.startsWith('cel25') || id.startsWith('s8a')) return 202110;
  if (s.includes('evolving skies') || s.includes('blue sky stream') || s.includes('skyscraping') || id.startsWith('swsh7') || id.startsWith('s7')) return 202108;
  if (s.includes('chilling reign') || s.includes('silver lance') || s.includes('jet-black') || id.startsWith('swsh6') || id.startsWith('s6')) return 202106;
  if (s.includes('eevee heroes') || id.startsWith('s6a') || s.includes('s6a')) return 202105;
  if (s.includes('peerless fighters') || id.startsWith('s5a') || s.includes('s5a')) return 202103;
  if (s.includes('battle styles') || s.includes('single strike') || s.includes('rapid strike') || id.startsWith('swsh5') || id.startsWith('s5')) return 202103;
  if (s.includes('shining fates') || s.includes('shiny star v') || id.startsWith('swsh45') || id.startsWith('s4a')) return 202102;
  if (s.includes('vivid voltage') || s.includes('astonishing volt') || id.startsWith('swsh4') || id.startsWith('s4')) return 202011;
  if (s.includes('champion\'s path') || s.includes('legendary heartbeat') || id.startsWith('swsh35') || id.startsWith('s3a')) return 202009;
  if (s.includes('darkness ablaze') || s.includes('infinity zone') || id.startsWith('swsh3') || id.startsWith('s3')) return 202008;
  if (s.includes('explosive walker') || id.startsWith('s2a') || s.includes('s2a')) return 202005;
  if (s.includes('rebel clash') || s.includes('rebellion crash') || id.startsWith('swsh2') || id.startsWith('s2')) return 202005;
  if (s.includes('vmax rising') || id.startsWith('s1a') || s.includes('s1a')) return 202002;
  if (s.includes('sword & shield') || s.includes('sword') || s.includes('shield') || id.startsWith('swsh1') || id.startsWith('s1')) return 202002;

  // 4. Sun & Moon (2017 - 2019)
  if (s.includes('cosmic eclipse') || s.includes('alter genesis') || id.startsWith('sm12') || s.includes('sm12')) return 201911;
  if (s.includes('tag all stars') || id.startsWith('sm12a') || s.includes('sm12a')) return 201910;
  if (s.includes('dream league') || id.startsWith('sm11b') || s.includes('sm11b')) return 201908;
  if (s.includes('hidden fates') || s.includes('shiny vault') || id.startsWith('sma') || id.startsWith('sm115')) return 201908;
  if (s.includes('unified minds') || s.includes('miracle twin') || s.includes('sky legend') || s.includes('gg end') || id.startsWith('sm11') || id.startsWith('sm10b')) return 201908;
  if (s.includes('unbroken bonds') || s.includes('double blaze') || id.startsWith('sm10')) return 201905;
  if (s.includes('team up') || s.includes('tag bolt') || s.includes('full metal wall') || s.includes('night unison') || id.startsWith('sm9')) return 201902;
  if (s.includes('ultra shiny') || id.startsWith('sm8b') || s.includes('sm8b')) return 201811;
  if (s.includes('lost thunder') || s.includes('dark order') || s.includes('super-burst') || id.startsWith('sm8')) return 201811;
  if (s.includes('dragon majesty') || s.includes('fairy rise') || id.startsWith('sm75') || id.startsWith('sm7b')) return 201809;
  if (s.includes('celestial storm') || s.includes('thunderclap spark') || s.includes('charisma of the wrecked') || id.startsWith('sm7')) return 201808;
  if (s.includes('forbidden light') || s.includes('champion road') || s.includes('dragon storm') || id.startsWith('sm6')) return 201805;
  if (s.includes('ultra prism') || s.includes('ultra force') || id.startsWith('sm5')) return 201802;
  if (s.includes('crimson invasion') || s.includes('ultra sun') || s.includes('ultra moon') || s.includes('battle boost') || id.startsWith('sm4')) return 201711;
  if (s.includes('shining legends') || id.startsWith('sm35') || id.startsWith('sm3p')) return 201710;
  if (s.includes('burning shadows') || s.includes('fighting rainbow') || s.includes('darkness that consumes') || id.startsWith('sm3')) return 201708;
  if (s.includes('guardians rising') || s.includes('facing pose') || id.startsWith('sm2')) return 201705;
  if (s.includes('the best of xy') || id.startsWith('sm2l') || id.startsWith('xy171')) return 201704;
  if (s.includes('sun & moon') || id.startsWith('sm1')) return 201702;

  // 5. XY Series (2014 - 2017)
  if (s.includes('best of xy') || id.startsWith('sm2l') || id.startsWith('xy171')) return 201704;
  if (s.includes('evolutions') || id.startsWith('xy12')) return 201611;
  if (s.includes('steam siege') || id.startsWith('xy11')) return 201608;
  if (s.includes('fates collide') || id.startsWith('xy10')) return 201605;
  if (s.includes('generations') || id.startsWith('g1')) return 201602;
  if (s.includes('breakpoint') || id.startsWith('xy9')) return 201602;
  if (s.includes('breakthrough') || id.startsWith('xy8')) return 201511;
  if (s.includes('ancient origins') || id.startsWith('xy7')) return 201508;
  if (s.includes('roaring skies') || id.startsWith('xy6')) return 201505;
  if (s.includes('double crisis') || id.startsWith('dc1')) return 201503;
  if (s.includes('primal clash') || id.startsWith('xy5')) return 201502;
  if (s.includes('phantom forces') || id.startsWith('xy4')) return 201411;
  if (s.includes('furious fists') || id.startsWith('xy3')) return 201408;
  if (s.includes('flashfire') || id.startsWith('xy2')) return 201405;
  if (s.includes('xy base') || id.startsWith('xy1') || s === 'xy') return 201402;

  // 6. Black & White (2011 - 2013)
  if (s.includes('legendary treasures') || id.startsWith('bw11')) return 201311;
  if (s.includes('plasma blast') || id.startsWith('bw10')) return 201308;
  if (s.includes('plasma freeze') || id.startsWith('bw9')) return 201305;
  if (s.includes('plasma storm') || id.startsWith('bw8')) return 201302;
  if (s.includes('boundaries crossed') || id.startsWith('bw7')) return 201211;
  if (s.includes('dragons exalted') || id.startsWith('bw6')) return 201208;
  if (s.includes('dark explorers') || id.startsWith('bw5')) return 201205;
  if (s.includes('next destinies') || id.startsWith('bw4')) return 201202;
  if (s.includes('noble victories') || id.startsWith('bw3')) return 201111;
  if (s.includes('emerging powers') || id.startsWith('bw2')) return 201108;
  if (s.includes('black & white') || id.startsWith('bw1')) return 201104;

  // 7. HGSS (2010 - 2011)
  if (s.includes('call of legends') || id.startsWith('col')) return 201102;
  if (s.includes('triumphant') || id.startsWith('hgss4')) return 201011;
  if (s.includes('undaunted') || id.startsWith('hgss3')) return 201008;
  if (s.includes('unleashed') || id.startsWith('hgss2')) return 201005;
  if (s.includes('heartgold') || s.includes('soulsilver') || id.startsWith('hgss1')) return 201002;

  // 8. DP (2007 - 2009)
  if (s.includes('arceus') || id.startsWith('pl4')) return 200911;
  if (s.includes('supreme victors') || id.startsWith('pl3')) return 200908;
  if (s.includes('rising rivals') || id.startsWith('pl2')) return 200905;
  if (s.includes('platinum') || id.startsWith('pl1')) return 200902;
  if (s.includes('stormfront') || id.startsWith('dp7')) return 200811;
  if (s.includes('legends awakened') || id.startsWith('dp6')) return 200808;
  if (s.includes('majestic dawn') || id.startsWith('dp5')) return 200805;
  if (s.includes('great encounters') || id.startsWith('dp4')) return 200802;
  if (s.includes('secret wonders') || id.startsWith('dp3')) return 200711;
  if (s.includes('mysterious treasures') || id.startsWith('dp2')) return 200708;
  if (s.includes('diamond') || s.includes('pearl') || id.startsWith('dp1')) return 200705;

  return 200000;
}

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
    if (card.languages && card.languages[lang]?.price != null && card.languages[lang]?.price! > 0.05) {
      return card.languages[lang]?.price!;
    }
    if (card.cheapestLanguage === lang && card.cheapestPrice != null && card.cheapestPrice > 0.05) {
      return card.cheapestPrice;
    }
    const rawPrice = typeof card.price === 'number' ? card.price : parseFloat(String(card.price || '0')) || null;
    if (rawPrice && rawPrice > 0.05) return rawPrice;

    // Fallback to verified Near Mint comps from knownPrices
    const known = getKnownCardPrice(card.id, card.name, card.rarity, card.setName || card.set_name);
    if (known) return known.price;

    return rawPrice;
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
    const cleanId = (card.id || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    const cleanName = (card.name || '').toLowerCase().replace(/[\u2018\u2019]/g, "'");

    // 1. Curated true exclusive scan match
    const matchedCurated = CURATED_TRUE_EXCLUSIVES.find((c) => {
      const cId = c.id.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleanId === cId || (cId.length > 4 && cleanId.includes(cId))) return true;
      const cName = c.name.toLowerCase().replace(/[\u2018\u2019]/g, "'");
      if (cleanName === cName) return true;
      return false;
    });

    if (matchedCurated) {
      if (matchedCurated.image) list.push(matchedCurated.image);
      if (matchedCurated.imageUrl && !list.includes(matchedCurated.imageUrl)) list.push(matchedCurated.imageUrl);
    }

    // 2. Existing card image fields (high & low webp)
    if (card.image && !card.image.includes('cardback') && !card.image.includes('back.png')) {
      if (!list.includes(card.image)) list.push(card.image);
      if (card.image.endsWith('/high.webp')) {
        const low = card.image.replace('/high.webp', '/low.webp');
        if (!list.includes(low)) list.push(low);
      }
    }
    if (card.imageUrl && !card.imageUrl.includes('cardback') && !card.imageUrl.includes('back.png')) {
      if (!list.includes(card.imageUrl)) list.push(card.imageUrl);
      if (card.imageUrl.endsWith('/high.webp')) {
        const low = card.imageUrl.replace('/high.webp', '/low.webp');
        if (!list.includes(low)) list.push(low);
      }
    }

    // 3. TCGPlayer CDN (High res and standard fits)
    if (card.tcgplayerId) {
      list.push(`https://tcgplayer-cdn.tcgplayer.com/product/${card.tcgplayerId}_in_1000x1000.jpg`);
      list.push(`https://product-images.tcgplayer.com/fit-in/438x438/${card.tcgplayerId}.jpg`);
      list.push(`https://product-images.tcgplayer.com/fit-in/650x650/${card.tcgplayerId}.jpg`);
    }

    // 4. Known TCGPlayer Product IDs from knownPrices
    const knownPrice = getKnownCardPrice(card.id, card.name, card.rarity, card.setName || card.set_name);
    if (knownPrice && knownPrice.tcgplayerId) {
      list.push(`https://tcgplayer-cdn.tcgplayer.com/product/${knownPrice.tcgplayerId}_in_1000x1000.jpg`);
      list.push(`https://product-images.tcgplayer.com/fit-in/438x438/${knownPrice.tcgplayerId}.jpg`);
    }

    // 5. Official pokemontcg.io scans
    const parts = cleanId.split('-');
    const rawSet = parts[0] || '';
    const num = card.number || parts[1] || '';
    const paddedNum = /^\d+$/.test(num) ? num.padStart(3, '0') : num;
    const numUpper = num.toUpperCase();

    // Special handling for Crown Zenith Galarian Gallery (GG01 - GG70)
    if (numUpper.startsWith('GG') || cleanId.includes('gg') || rawSet === 'swsh12pt5gg') {
      list.push(`https://images.pokemontcg.io/swsh12pt5gg/${numUpper}_hires.png`);
      list.push(`https://images.pokemontcg.io/swsh12pt5gg/${numUpper}.png`);
    }

    // Special handling for Trainer Gallery sets (TG01 - TG30)
    if (numUpper.startsWith('TG') || cleanId.includes('tg')) {
      if (rawSet.startsWith('swsh12') || cleanId.includes('swsh12')) {
        list.push(`https://images.pokemontcg.io/swsh12tg/${numUpper}_hires.png`);
        list.push(`https://images.pokemontcg.io/swsh12tg/${numUpper}.png`);
      } else if (rawSet.startsWith('swsh11') || cleanId.includes('swsh11')) {
        list.push(`https://images.pokemontcg.io/swsh11tg/${numUpper}_hires.png`);
        list.push(`https://images.pokemontcg.io/swsh11tg/${numUpper}.png`);
      } else if (rawSet.startsWith('swsh10') || cleanId.includes('swsh10')) {
        list.push(`https://images.pokemontcg.io/swsh10tg/${numUpper}_hires.png`);
        list.push(`https://images.pokemontcg.io/swsh10tg/${numUpper}.png`);
      } else if (rawSet.startsWith('swsh9') || cleanId.includes('swsh9')) {
        list.push(`https://images.pokemontcg.io/swsh9tg/${numUpper}_hires.png`);
        list.push(`https://images.pokemontcg.io/swsh9tg/${numUpper}.png`);
      }
    }

    // General pokemontcg.io fallback
    if (rawSet && num) {
      const setSlug = rawSet.replace('.', '').toLowerCase();
      list.push(`https://images.pokemontcg.io/${setSlug}/${num}_hires.png`);
      list.push(`https://images.pokemontcg.io/${setSlug}/${num}.png`);
      if (paddedNum !== num) {
        list.push(`https://images.pokemontcg.io/${setSlug}/${paddedNum}_hires.png`);
        list.push(`https://images.pokemontcg.io/${setSlug}/${paddedNum}.png`);
      }
    }

    // 6. TCGdex Japanese & Asian CDN (with uppercase SM/SM12a)
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

      if (cleanId.includes('sm12a') || rawUpper.includes('SM12A')) {
        list.push(`https://assets.tcgdex.net/ja/SM/SM12a/${paddedNum}/high.webp`);
        list.push(`https://assets.tcgdex.net/ja/SM/SM12a/${num}/high.webp`);
        list.push(`https://assets.tcgdex.net/ja/SM/SM12a/${paddedNum}/low.webp`);
      }

      list.push(`https://assets.tcgdex.net/ja/${series}/${rawSet}/${paddedNum}/high.webp`);
      list.push(`https://assets.tcgdex.net/ja/${series}/${rawSet}/${paddedNum}/low.webp`);
      list.push(`https://assets.tcgdex.net/en/${series.toLowerCase()}/${rawSet}/${num}/high.webp`);
      list.push(`https://assets.tcgdex.net/en/${series.toLowerCase()}/${rawSet}/${num}/low.webp`);
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

      // All promo cards route to 'other' ("Special Promos & Collaborations")
      if (isPromoCard(card)) {
        map['other'].push(card);
        continue;
      }

      let eraId = getCardEra(card.id, card.setName || card.set_name);
      // Remaps
      if (['ecard', 'neo', 'vintage'].includes(eraId)) eraId = 'classic';
      if (!map[eraId]) {
        map[eraId] = [];
      }
      map[eraId].push(card);
    }

    const sortCardList = (list: SearchCardResult[]) => {
      return [...list].sort((a, b) => {
        // 1. Exclusives pinned to the top of each era
        const aEx = a.isExclusive ? 1 : 0;
        const bEx = b.isExclusive ? 1 : 0;
        if (aEx !== bEx) return bEx - aEx;

        // 2. Chronological Set Release Ordering (newest release to oldest release)
        const weightA = getSetReleaseWeight(a.setName || a.set_name, a.id);
        const weightB = getSetReleaseWeight(b.setName || b.set_name, b.id);
        if (weightA !== weightB) return weightB - weightA;

        // 3. Alphabetical Set Name tie-breaker
        const setA = (a.setName || a.set_name || '').toLowerCase().trim();
        const setB = (b.setName || b.set_name || '').toLowerCase().trim();
        if (setA !== setB) return setA.localeCompare(setB);

        // 4. Within each set, group cards by Character / Trainer base name
        const charA = extractCharacterBaseName(a.name || '');
        const charB = extractCharacterBaseName(b.name || '');
        if (charA !== charB) return charA.localeCompare(charB);

        // 5. Order matching characters by card number
        const numA = parseInt((a.number || a.id.split('-')[1] || '0').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt((b.number || b.id.split('-')[1] || '0').replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) return numA - numB;

        return (a.name || '').localeCompare(b.name || '');
      });
    };

    return ERA_SECTIONS
      .filter((sec) => map[sec.id] && map[sec.id].length > 0)
      .map((sec) => {
        if (sec.id === 'other') {
          // Group promo cards by Promo Sub-Eras
          const subMap: Record<string, SearchCardResult[]> = {};
          for (const sub of PROMO_SUB_ERAS) {
            subMap[sub.id] = [];
          }
          for (const card of map['other']) {
            const subId = getPromoSubEra(card);
            if (!subMap[subId]) subMap[subId] = [];
            subMap[subId].push(card);
          }

          const promoSubGroups = PROMO_SUB_ERAS
            .filter((sub) => subMap[sub.id] && subMap[sub.id].length > 0)
            .map((sub) => ({
              ...sub,
              cards: sortCardList(subMap[sub.id])
            }));

          return {
            ...sec,
            cards: sortCardList(map['other']),
            promoSubGroups
          };
        }

        const eraCards = map[sec.id] || [];
        const exclusives = eraCards.filter((c) => c.isExclusive);
        const regulars = eraCards.filter((c) => !c.isExclusive);

        const sortCardsInGroup = (cards: SearchCardResult[]) => {
          return [...cards].sort((a, b) => {
            const charA = extractCharacterBaseName(a.name || '');
            const charB = extractCharacterBaseName(b.name || '');
            if (charA !== charB) return charA.localeCompare(charB);
            const numA = parseInt((a.number || a.id.split('-')[1] || '0').replace(/\D/g, ''), 10) || 0;
            const numB = parseInt((b.number || b.id.split('-')[1] || '0').replace(/\D/g, ''), 10) || 0;
            if (numA !== numB) return numA - numB;
            return (a.name || '').localeCompare(b.name || '');
          });
        };

        const setMap = new Map<string, SearchCardResult[]>();
        for (const c of regulars) {
          const sName = c.setName || c.set_name || 'Expansion';
          if (!setMap.has(sName)) setMap.set(sName, []);
          setMap.get(sName)!.push(c);
        }

        const setGroups = Array.from(setMap.entries()).map(([setName, sCards]) => ({
          setName,
          releaseWeight: getSetReleaseWeight(setName, sCards[0]?.id),
          cards: sortCardsInGroup(sCards)
        }));

        setGroups.sort((a, b) => {
          if (a.releaseWeight !== b.releaseWeight) {
            return b.releaseWeight - a.releaseWeight;
          }
          return a.setName.localeCompare(b.setName);
        });

        const sortedExclusives = sortCardsInGroup(exclusives);

        return {
          ...sec,
          cards: [...sortedExclusives, ...setGroups.flatMap((sg) => sg.cards)],
          exclusives: sortedExclusives,
          setGroups
        };
      });
  }, [results]);

  // Render individual card tile
  const renderCardTile = (card: SearchCardResult, idx: number) => {
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
    const chosenLangDisplay = formatLangCode(chosenLang);

    // Dynamic image & typography sizing via slider
    const isCompact = density === 'compact';
    const isLarge = cardMinSize >= 330;
    const isXLarge = cardMinSize >= 380;
    const imgW = Math.round(cardMinSize * (isCompact ? 0.38 : 0.42));
    const imgH = Math.round(imgW * 1.4);

    const displayMktPrice = getChosenPriceForCard(card, cardLang) ?? (card.price ? parseFloat(String(card.price)) : null);

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
            {/* Card Image */}
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
                    {formatLangCode(cardLang)} Exclusive
                  </span>
                ) : cardLang !== 'en' ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate">
                    {formatLangCode(cardLang)}
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
                  {`${formatLangCode(cardLang)} Mkt:`}
                </span>
                <span className={`${isXLarge ? 'text-xl font-black' : isLarge ? 'text-lg font-black' : 'text-sm font-extrabold'} text-gray-900 dark:text-gray-100 truncate`}>
                  {displayMktPrice ? formatCurrency(displayMktPrice) : 'N/A'}
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

          {/* Multi-Language Price Comparison Matrix */}
          {hasLanguages && (
            <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/60 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`${isXLarge ? 'text-xs font-bold' : isLarge ? 'text-xs font-bold' : 'text-[11px] font-bold'} text-gray-500 dark:text-gray-400`}>Pick Language:</span>
                {hasSavings && (
                  <span className={`${isXLarge ? 'text-xs font-black px-2 py-0.5' : isLarge ? 'text-[11px] font-black px-1.5 py-0.5' : 'text-[10px] font-black px-1.5 py-0.2'} text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-800/50 truncate`}>
                    Save {card.savingsVsEnglish}% on {formatLangCode(card.cheapestLanguage || 'alt')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {Object.entries(card.languages!).map(([langKey, langInfo]) => {
                  const isTileSelected = chosenLang === langKey;
                  const isTileExplicit = isExplicitlyChosen && isTileSelected;
                  const isCheapest = langInfo.isCheapest;
                  const langDisplay = formatLangCode(langKey);

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
                      title={`Click to select ${LANG_FLAGS[langKey as CardLanguage] || langDisplay} for Quick Add`}
                    >
                      <span className="flex items-center gap-0.5 min-w-0 truncate">
                        <span className="truncate">{LANG_FLAGS[langKey as CardLanguage] || langDisplay}</span>
                        {isTileExplicit && (
                          <span className="text-[8px] bg-indigo-600 text-white font-black px-0.5 rounded-xs">
                            ✓
                          </span>
                        )}
                        {!isTileExplicit && isCheapest && (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">★</span>
                        )}
                      </span>
                      <span className={`${isXLarge ? 'font-black text-xs' : isLarge ? 'font-extrabold text-[11px]' : 'font-semibold text-[10px]'} shrink-0 ml-1`}>
                        {formatCurrency(langInfo.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2.5 border-t border-gray-100 dark:border-gray-700/60 mt-2 space-y-1.5">
          {/* Wishlist Button */}
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

          {/* Action Row: I Own This, Wishlist & Snipe */}
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
  };

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

      {/* 3. Cards Organized by Era with Centered Headers & Chronological Set Ordering */}
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

            {/* Special Promos & Collaborations Sub-Era Section */}
            {sec.id === 'other' && (sec as any).promoSubGroups && (sec as any).promoSubGroups.length > 0 ? (
              <div className="space-y-8">
                {((sec as any).promoSubGroups as { id: string; title: string; badge: string; icon: string; cards: SearchCardResult[] }[]).map((sub) => (
                  <div key={sub.id} className="space-y-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-xs font-bold text-purple-900 dark:text-purple-200 w-fit">
                      <span>{sub.icon}</span>
                      <span className="font-extrabold uppercase tracking-wider">{sub.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200/70 dark:bg-purple-900/70 font-mono font-bold">
                        {sub.cards.length} {sub.cards.length === 1 ? 'card' : 'cards'}
                      </span>
                    </div>
                    <div
                      className={`grid ${density === 'compact' ? 'gap-2.5' : 'gap-3.5'}`}
                      style={{
                        gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinSize}px, 1fr))`
                      }}
                    >
                      {sub.cards.map((card, idx) => renderCardTile(card, idx))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Regular Expansion Era: Regional Exclusives Pinned at Top, Followed by Chronological Set Subheaders */
              <div className="space-y-6">
                {/* 1. Regional Exclusives Pinned at Top of Era */}
                {(sec as any).exclusives && (sec as any).exclusives.length > 0 && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-linear-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-300 dark:border-amber-700/80 shadow-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-black w-fit">
                      <span>🏆</span>
                      <span className="uppercase tracking-wider">Regional Exclusives</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/90 dark:bg-amber-900/90 font-mono font-bold">
                        {(sec as any).exclusives.length} {(sec as any).exclusives.length === 1 ? 'card' : 'cards'}
                      </span>
                    </div>
                    <div
                      className={`grid ${density === 'compact' ? 'gap-2.5' : 'gap-3.5'}`}
                      style={{
                        gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinSize}px, 1fr))`
                      }}
                    >
                      {(sec as any).exclusives.map((card: SearchCardResult, idx: number) => renderCardTile(card, idx))}
                    </div>
                  </div>
                )}

                {/* 2. Chronological Set Subheaders & Grids (Newest to Oldest) */}
                {(sec as any).setGroups && (sec as any).setGroups.length > 0 ? (
                  ((sec as any).setGroups as { setName: string; cards: SearchCardResult[] }[]).map((setGroup) => (
                    <div key={setGroup.setName} className="space-y-3">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs font-black text-gray-800 dark:text-gray-200 w-fit shadow-2xs">
                        <span>📦</span>
                        <span className="font-extrabold">{setGroup.setName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono font-bold">
                          {setGroup.cards.length} {setGroup.cards.length === 1 ? 'card' : 'cards'}
                        </span>
                      </div>
                      <div
                        className={`grid ${density === 'compact' ? 'gap-2.5' : 'gap-3.5'}`}
                        style={{
                          gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinSize}px, 1fr))`
                        }}
                      >
                        {setGroup.cards.map((card: SearchCardResult, idx: number) => renderCardTile(card, idx))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className={`grid ${density === 'compact' ? 'gap-2.5' : 'gap-3.5'}`}
                    style={{
                      gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinSize}px, 1fr))`
                    }}
                  >
                    {sec.cards.map((card, idx) => renderCardTile(card, idx))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
