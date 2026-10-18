import { SearchCardResult, CardLanguage } from './types';

// ==========================================
// 1. TRUE EXCLUSIVE WHITELISTS & DEFINITIONS
// ==========================================

/**
 * Verified list of true Japanese-exclusive card IDs.
 * These represent cards with unique artwork, promotional distributions, or printings
 * that NEVER received an official English equivalent.
 */
export const TRUE_JP_EXCLUSIVE_IDS = new Set<string>([
  // Extra Battle Day Promos
  'sm-p-395', // Extra Battle Day Acerola (395/SM-P)
  'sm-p-396', // Extra Battle Day Guzma (396/SM-P)
  'sm-p-397', // Extra Battle Day Lillie (397/SM-P)
  'sm-p-398', // Extra Battle Day N (398/SM-P)
  'sm-p-399', // Extra Battle Day Gladion (399/SM-P)
  
  // The Masked Royal Promos
  'sm-p-064',
  'sm-p-100',
  
  // Alolan Friends Promo
  'sm-p-401',
  
  // Team Skull Grunt Promo
  'sm-p-013',

  // Tag All Stars Full Art Exclusives (Never printed as Full Art in English)
  'sm12a-189', // Will Full Art (189/173)
  'sm12a-191', // Misty & Lorelei Full Art (191/173)
  'sm12a-192', // Sightseer Full Art (192/173)
  'sm12a-193', // Blue's Tactics Alt Art Full Art (193/173)
  'sm12a-194', // Bellelba & Brycen-Man Full Art (194/173)
  'sm12a-195', // Hapu Full Art (195/173)
  'sm12a-196', // Green's Exploration Alt Art Full Art (196/173)
  'sm12a-199', // Clay Full Art (199/173)
  'sm12a-201', // Red's Challenge Alt Art Full Art (201/173)

  // Japan Post Stamp Box Promos
  's-p-226', // Cramorant Beauty Looking Back (226/S-P)
  's-p-227', // Pikachu Moon Goose (227/S-P)

  // McDonald's Japan "Burgerchu" / Food Promos
  'm-p-020', // McDonald's Pikachu eating burger ("Burgerchu")
  '020-m-p',
  '020/m-p',

  // Munch: A Retrospective Scream Promos (Tokyo Art Museum)
  'sm-p-286', // Psyduck Scream (286/SM-P)
  'sm-p-287', // Eevee Scream (287/SM-P)
  'sm-p-288', // Pikachu Scream (288/SM-P)
  'sm-p-289', // Mimikyu Scream (289/SM-P)
  'sm-p-290', // Rowlet Scream (290/SM-P)

  // Poncho-Wearing Pikachu Promos
  'xy-p-207', // Mega Charizard X Poncho Pikachu
  'xy-p-208', // Mega Charizard Y Poncho Pikachu
  'xy-p-230', // Rayquaza Poncho Pikachu
  'xy-p-231', // Shiny Rayquaza Poncho Pikachu
  'xy-p-293', // Mario Pikachu
  'xy-p-294', // Mario Pikachu Full Art
  'xy-p-295', // Luigi Pikachu
  'xy-p-296', // Luigi Pikachu Full Art

  // Pretend Boss Pikachu Promos (Team Rocket, Aqua, Magma, Galactic, Plasma, Flare, Skull)
  'sm-p-005',
  'sm-p-006',
  'sm-p-007',
  'sm-p-008',
  'sm-p-009',
  'sm-p-010',
  'sm-p-011',

  // Regional Japanese Pokémon Center Promos
  's-p-002', // Shibuya Pikachu (Graffiti)
  's-p-144', // Kanazawa Pikachu (Kimono)
  's-p-147', // Kanazawa's Pikachu
  'sm-p-280', // Yokohama Sailor Pikachu
  'sm-p-281',

  // Vintage Legendary Exclusives
  'corocoro-mew', // CoroCoro Shining Mew (2001)
  'ooyama-pikachu', // Ooyama's Pikachu (Vending Machine)
]);

/**
 * Verified list of true Chinese-exclusive card IDs and patterns (Simplified & Traditional Chinese).
 * These represent cards with unique artwork, regional McDonald's/collaboration stamps,
 * Gem Pack alternate arts, and lottery promos released ONLY in Chinese.
 */
export const TRUE_ZH_EXCLUSIVE_IDS = new Set<string>([
  // McDonald's China Promo Collaboration ("Burgerchu" / Golden Arches stamp)
  'sv-p-033', // 2024 McDonald's China Pikachu Promo (033/SV-P)
  'm-p-020',
  '033-sv-p',
  '033/sv-p',

  // Simplified Chinese Lottery & Achievement Promos
  'sv-p-001', // World Championships Milestone Pikachu
  'sv-p-002', // Gym Battle Champion Pikachu
  'sv-p-003', // Mew ex Lottery Mission Special Promo
  'sv-p-004', // Gem Pack Event Pikachu

  // Pokémon Center Taipei Grand Opening Promo
  'sv-p-019', // Taipei Pikachu (019/SV-P)

  // Gem Pack Vol. 1 - Vol. 4 Exclusive Alternate Artworks (Never printed in EN/JA)
  'gem-gengar',     // Exclusive Gengar with Clefairy dolls artwork
  'gem-cubone',     // Exclusive Cubone Full Art artwork
  'gem-ceruledge',  // Exclusive Ceruledge illustration
  'gem-ponyta',     // Exclusive Ponyta illustration
  'gem-arcanine-ex',// Exclusive Arcanine ex alternate art
  'gem-pikachu',    // Exclusive Captain Pikachu illustration
]);

// ==========================================
// 2. EXCLUSIVITY CHECKERS
// ==========================================

/**
 * Checks if a Japanese card is a true verified exclusive that never received an English release.
 */
export function isTrueJapaneseExclusive(card: {
  id?: string;
  name?: string;
  localId?: string;
  set?: { id?: string };
}): boolean {
  if (!card) return false;
  const idNorm = (card.id || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const localId = (card.localId || '').trim();
  const nameLower = (card.name || '').toLowerCase();

  // 1. Direct ID match
  if (TRUE_JP_EXCLUSIVE_IDS.has(idNorm)) return true;

  // 2. Famous promo names
  if (nameLower.includes('alolan friends') || nameLower.includes('アローラの仲間たち')) return true;
  if (nameLower.includes('masked royal') || nameLower.includes('ロイヤルマスク')) return true;
  if (nameLower.includes('munch') || nameLower.includes('scream') || nameLower.includes('叫び')) {
    if (nameLower.includes('pikachu') || nameLower.includes('mimikyu') || nameLower.includes('eevee') || nameLower.includes('psyduck') || nameLower.includes('rowlet')) {
      return true;
    }
  }
  if (nameLower.includes('mario pikachu') || nameLower.includes('luigi pikachu') || nameLower.includes('poncho')) {
    return true;
  }
  if (nameLower.includes('burgerchu') || (nameLower.includes('mcdonald') && (nameLower.includes('pikachu') || localId === '020'))) {
    return true;
  }
  if (nameLower.includes('shining mew') && (idNorm.includes('promo') || idNorm.includes('coro'))) {
    return true;
  }

  // 3. Tag All Stars exclusive Full Arts (Will 189, Misty & Lorelei 191, Sightseer 192, Alt Arts 193/196/201, Bellelba 194, Hapu 195, Clay 199)
  const setIdNorm = (card.set?.id || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (idNorm.includes('sm12a') || setIdNorm.includes('sm12a')) {
    if (['189', '191', '192', '193', '194', '195', '196', '199', '201'].includes(localId)) return true;
    if (nameLower.includes('will') || nameLower.includes('イツキ')) return true;
    if (nameLower.includes('bellelba') || nameLower.includes('ジュジュベ')) return true;
    if (nameLower.includes('hapu') || nameLower.includes('ハプウ')) return true;
    if (nameLower.includes('clay') || nameLower.includes('ヤーコン')) return true;
  }

  // 4. Extra Battle Day promo numbers (395-399, 401, 064, 100)
  if (idNorm.includes('sm-p') || idNorm.includes('smp')) {
    if (['395', '396', '397', '398', '399', '401', '064', '100', '286', '287', '288', '289', '290', '280', '281'].includes(localId)) return true;
  }

  // 5. Stamp box promos (226, 227 in S-P)
  if (idNorm.includes('s-p') || idNorm.includes('sp')) {
    if (['226', '227', '002', '144', '147'].includes(localId)) return true;
  }

  // 6. XY-P Ponchos (207, 208, 230, 231, 293, 294, 295, 296)
  if (idNorm.includes('xy-p') || idNorm.includes('xyp')) {
    if (['207', '208', '230', '231', '293', '294', '295', '296'].includes(localId)) return true;
  }

  return false;
}

/**
 * Checks if a Chinese card is a true verified exclusive that only released in Chinese.
 */
export function isTrueChineseExclusive(card: {
  id?: string;
  name?: string;
  localId?: string;
  setName?: string;
}): boolean {
  if (!card) return false;
  const idNorm = (card.id || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const localId = (card.localId || '').trim();
  const nameLower = (card.name || '').toLowerCase();
  const setLower = (card.setName || '').toLowerCase();

  // 1. Direct ID match
  if (TRUE_ZH_EXCLUSIVE_IDS.has(idNorm)) return true;

  // 2. McDonald's China "Burgerchu" / Golden Arches stamp
  if (nameLower.includes('burgerchu') || (nameLower.includes('mcdonald') && (nameLower.includes('pikachu') || localId === '033'))) {
    return true;
  }

  // 3. Taipei Pokémon Center Grand Opening Pikachu
  if (nameLower.includes('taipei pikachu') || (nameLower.includes('taipei') && nameLower.includes('pikachu'))) {
    return true;
  }

  // 4. Gem Pack exclusive artworks (Simplified Chinese Gem Pack Vol 1-4)
  if (setLower.includes('gem pack') || setLower.includes('九彩汇聚') || nameLower.includes('gem pack')) {
    if (['gengar', 'cubone', 'ceruledge', 'ponyta', 'arcanine', 'captain pikachu'].some(k => nameLower.includes(k))) {
      return true;
    }
  }

  // 5. Lunar New Year / Red Envelope Promos
  if (nameLower.includes('lunar new year') || nameLower.includes('year of the dragon') || nameLower.includes('year of the rabbit')) {
    return true;
  }

  // 6. Pizza Hut collaboration promos
  if (nameLower.includes('pizza hut')) {
    return true;
  }

  // 7. Special Chinese SV-P Promos (001-004, 019, 033)
  if (idNorm.includes('sv-p') || idNorm.includes('svp')) {
    if (['001', '002', '003', '004', '019', '033'].includes(localId)) return true;
  }

  return false;
}

/**
 * Universal exclusive checker for any language.
 */
export function isTrueExclusive(card: SearchCardResult, lang?: CardLanguage): boolean {
  const language = lang || card.language || 'en';
  if (language === 'ja') return isTrueJapaneseExclusive(card);
  if (language === 'zh') return isTrueChineseExclusive(card);
  return false;
}

// ==========================================
// 3. ERA IDENTIFIERS & FILTERS
// ==========================================

export interface EraDefinition {
  id: string;
  name: string;
  shortName: string;
  years: string;
  prefixes: string[];
}

export const POKEMON_ERAS: EraDefinition[] = [
  {
    id: 'me',
    name: 'Mega Era / Pocket (ME / M)',
    shortName: 'Mega / Pocket',
    years: '2025–2026+',
    prefixes: ['me', 'm1', 'm2', 'm3', 'm4', 'm5', 'm-p']
  },
  {
    id: 'sv',
    name: 'Scarlet & Violet (SV)',
    shortName: 'Scarlet & Violet',
    years: '2023–Present',
    prefixes: ['sv', 'sv01', 'sv02', 'sv03', 'sv04', 'sv05', 'sv06', 'sv07', 'sv08', 'sv-p', 'svln']
  },
  {
    id: 'swsh',
    name: 'Sword & Shield (SWSH)',
    shortName: 'Sword & Shield',
    years: '2020–2023',
    prefixes: ['swsh', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's-p']
  },
  {
    id: 'sm',
    name: 'Sun & Moon (SM)',
    shortName: 'Sun & Moon',
    years: '2017–2019',
    prefixes: ['sm', 'sma', 'sm-p', 'smp']
  },
  {
    id: 'xy',
    name: 'XY Series (XY)',
    shortName: 'XY',
    years: '2013–2016',
    prefixes: ['xy', 'xy-p', 'xyp']
  },
  {
    id: 'bw',
    name: 'Black & White (BW)',
    shortName: 'Black & White',
    years: '2011–2013',
    prefixes: ['bw', 'bw-p', 'bwp']
  },
  {
    id: 'hgss',
    name: 'HeartGold & SoulSilver (HGSS / Call of Legends)',
    shortName: 'HGSS / Legend',
    years: '2010–2011',
    prefixes: ['hgss', 'col', 'l1', 'l2', 'l3']
  },
  {
    id: 'dp',
    name: 'Diamond & Pearl / Platinum (DP / Pt)',
    shortName: 'DP / Platinum',
    years: '2006–2009',
    prefixes: ['dp', 'pl', 'dpt']
  },
  {
    id: 'ex',
    name: 'EX Series / Ruby & Sapphire (EX / RS)',
    shortName: 'EX (Ruby/Sapphire)',
    years: '2003–2006',
    prefixes: ['ex', 'adv', 'pcg']
  },
  {
    id: 'ecard',
    name: 'e-Card Series (Expedition / Aquapolis / Skyridge)',
    shortName: 'e-Card',
    years: '2001–2003',
    prefixes: ['ecard', 'exp', 'aqu', 'sky', 'e1', 'e2', 'e3', 'e4', 'e5']
  },
  {
    id: 'neo',
    name: 'Neo Series (Genesis / Revelation / Destiny)',
    shortName: 'Neo Series',
    years: '2000–2001',
    prefixes: ['neo', 'neo1', 'neo2', 'neo3', 'neo4']
  },
  {
    id: 'vintage',
    name: 'Original Classic (Base / Jungle / Fossil / Rocket / Gym)',
    shortName: 'Base / Vintage',
    years: '1999–2000',
    prefixes: ['base', 'jungle', 'fossil', 'rocket', 'gym', 'pmcg']
  }
];

/**
 * Determines which Pokémon TCG era a card belongs to based on its ID and set name.
 */
export function getCardEra(cardId?: string, setName?: string): string {
  const id = (cardId || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const set = (setName || '').toLowerCase();

  for (const era of POKEMON_ERAS) {
    if (era.prefixes.some(p => id.startsWith(p) || id.includes(`-${p}`) || set.includes(era.shortName.toLowerCase()))) {
      return era.id;
    }
  }

  // Fallbacks by set keywords
  if (set.includes('scarlet') || set.includes('violet') || set.includes('151') || set.includes('paldean') || set.includes('paradox') || set.includes('temporal') || set.includes('twilight') || set.includes('stellar') || set.includes('surging') || set.includes('prismatic')) return 'sv';
  if (set.includes('sword') || set.includes('shield') || set.includes('vivid') || set.includes('darkness') || set.includes('battle styles') || set.includes('chilling') || set.includes('evolving') || set.includes('fusion') || set.includes('brilliant') || set.includes('astral') || set.includes('lost origin') || set.includes('silver tempest') || set.includes('crown zenith')) return 'swsh';
  if (set.includes('sun') || set.includes('moon') || set.includes('guardians') || set.includes('burning shadows') || set.includes('crimson') || set.includes('ultra prism') || set.includes('forbidden light') || set.includes('celestial') || set.includes('dragon majesty') || set.includes('lost thunder') || set.includes('team up') || set.includes('unbroken') || set.includes('unified minds') || set.includes('hidden fates') || set.includes('cosmic eclipse') || set.includes('tag all stars')) return 'sm';
  if (set.includes('flashfire') || set.includes('furious fists') || set.includes('phantom forces') || set.includes('primal clash') || set.includes('roaring skies') || set.includes('ancient origins') || set.includes('breakthrough') || set.includes('breakpoint') || set.includes('generations') || set.includes('fates collide') || set.includes('steam siege') || set.includes('evolutions')) return 'xy';
  if (set.includes('noble victories') || set.includes('next destinies') || set.includes('dark explorers') || set.includes('dragons exalted') || set.includes('boundaries crossed') || set.includes('plasma')) return 'bw';
  if (set.includes('heartgold') || set.includes('soulsilver') || set.includes('triumphant') || set.includes('undaunted') || set.includes('unleashed') || set.includes('call of legends')) return 'hgss';
  if (set.includes('diamond') || set.includes('pearl') || set.includes('platinum') || set.includes('mysterious treasures') || set.includes('secret wonders') || set.includes('great encounters') || set.includes('majestic dawn') || set.includes('legends awakened') || set.includes('stormfront') || set.includes('rising rivals') || set.includes('supreme victors') || set.includes('arceus')) return 'dp';
  if (set.includes('ruby') || set.includes('sapphire') || set.includes('sandstorm') || set.includes('dragon') || set.includes('magma') || set.includes('aqua') || set.includes('hidden legends') || set.includes('firered') || set.includes('leafgreen') || set.includes('deoxys') || set.includes('emerald') || set.includes('unseen forces') || set.includes('delta species') || set.includes('legend maker') || set.includes('holon') || set.includes('crystal guardians') || set.includes('power keepers')) return 'ex';
  if (set.includes('expedition') || set.includes('aquapolis') || set.includes('skyridge')) return 'ecard';
  if (set.includes('genesis') || set.includes('discovery') || set.includes('revelation') || set.includes('destiny')) return 'neo';
  if (set.includes('base') || set.includes('jungle') || set.includes('fossil') || set.includes('rocket') || set.includes('gym')) return 'vintage';

  return 'other';
}

// ==========================================
// 4. SPECIAL CARD TYPES & MECHANICS
// ==========================================

export interface SpecialTypeDefinition {
  id: string;
  label: string;
  era: string;
  description: string;
}

export const SPECIAL_CARD_TYPES: SpecialTypeDefinition[] = [
  {
    id: 'gold-star',
    label: '★ Gold Star',
    era: 'EX Series (2004–2007)',
    description: 'Ultra-rare shiny Pokemon cards featuring a gold star next to the name (Rayquaza Star, Charizard Star, Umbreon Star, etc.)'
  },
  {
    id: 'shining-crystal',
    label: '✨ Shining & Crystal Pokémon',
    era: 'Neo & e-Card Series',
    description: 'Secret rare holofoil Shining Pokemon (Shining Charizard, Shining Mew) and Crystal type-changing cards'
  },
  {
    id: 'lv-x',
    label: '⚡ Pokémon LV.X',
    era: 'Diamond & Pearl / Platinum',
    description: 'Cross-evolution LV.X holographic cards with illustrated foil extending beyond the frame'
  },
  {
    id: 'prime',
    label: '👑 Pokémon Prime',
    era: 'HeartGold & SoulSilver',
    description: 'Intense close-up holographic portraits with sparkling border and silver lettering'
  },
  {
    id: 'legend',
    label: '📜 LEGEND Cards (Two-Halves)',
    era: 'HeartGold & SoulSilver',
    description: 'Two-card top and bottom combinations forming a sweeping panoramic artwork (Lugia LEGEND, Ho-Oh LEGEND)'
  },
  {
    id: 'tag-team',
    label: '🤝 TAG TEAM GX',
    era: 'Sun & Moon',
    description: 'Dual-Pokemon heavy hitters with Tag Team GX attacks (Reshiram & Charizard GX, Gengar & Mimikyu GX)'
  },
  {
    id: 'sir',
    label: '🎨 Special Illustration Rare (SIR/SAR)',
    era: 'Scarlet & Violet',
    description: 'Full-card custom textured artistic masterpieces with top chase status'
  },
  {
    id: 'ir',
    label: '🖼️ Illustration Rare (IR/AR)',
    era: 'Scarlet & Violet',
    description: 'Full-art alternate story illustrations across modern sets'
  },
  {
    id: 'tg',
    label: '👥 Trainer Gallery & Character Rares (TG/GG/CHR)',
    era: 'SWSH & Cosmic Eclipse',
    description: 'Beloved cards featuring Pokemon interacting side-by-side with their iconic trainers'
  },
  {
    id: 'alt-art',
    label: '💎 Alternate Art (Alt Art)',
    era: 'SWSH & Sun & Moon',
    description: 'Coveted alternate artwork cards (Moonbreon, Rayquaza VMAX, Giratina V, Lugia V)'
  },
  {
    id: 'm-ex',
    label: '🧬 Mega EX (M-EX)',
    era: 'XY Series',
    description: 'Mega Evolution EX cards featuring Japanese calligraphic katakana attack text'
  },
  {
    id: 'classic-ex',
    label: '🔥 Classic Pokémon-ex',
    era: 'EX Series (2003–2007)',
    description: 'Vintage lowercase "ex" cards with metallic silver borders and dual prize mechanics'
  },
  {
    id: 'vmax-vstar',
    label: '⚡ Pokémon VMAX & VSTAR',
    era: 'Sword & Shield',
    description: 'Dynamax and VSTAR power cards from the Sword & Shield era'
  },
  {
    id: 'break',
    label: '💥 BREAK Evolution',
    era: 'XY Series',
    description: 'Horizontal gold foil cards representing BREAK evolutions'
  },
  {
    id: 'radiant',
    label: '🌟 Radiant Pokémon',
    era: 'Sword & Shield',
    description: 'Cross-hatch holographic shiny Pokemon restricted to 1 per deck'
  },
  {
    id: 'amazing-rare',
    label: '🌈 Amazing Rare',
    era: 'Sword & Shield',
    description: 'Rainbow prism burst background artworks with rainbow "A" symbol'
  },
  {
    id: 'prism-star',
    label: '♢ Prism Star',
    era: 'Sun & Moon',
    description: 'Prism Star cards sent to the Lost Zone upon fainting'
  },
  {
    id: 'ace-spec',
    label: '🃏 ACE SPEC',
    era: 'Black & White & SV',
    description: 'High-impact trainer and energy cards restricted to 1 per deck'
  },
  {
    id: 'stamped-promos',
    label: '🏷️ Stamped Promos & Collaborations',
    era: 'Special Collaborations',
    description: 'Iconic stamped cards from food collaborations (McDonald\'s, Domino\'s, Pizza Hut) and non-food events/retailers (Pokémon Center Special Delivery, Van Gogh Museum, Yu Nagaba, GameStop, Toys "R" Us, Staff & Championship stamps)'
  },
  {
    id: 'exclusives-only',
    label: '🏆 Language Exclusives Only',
    era: 'All Eras',
    description: 'Show only cards that are verified true regional exclusives (Japanese and Chinese only)'
  }
];

/**
 * Checks if a card matches a specific special card type or mechanic.
 */
export function matchSpecialType(card: SearchCardResult, typeId: string): boolean {
  if (!card) return false;
  const name = (card.name || '').toLowerCase();
  const rarity = (card.rarity || '').toLowerCase();
  const id = (card.id || '').toLowerCase();

  switch (typeId) {
    case 'gold-star':
      return (
        name.includes('★') ||
        name.includes(' star') ||
        rarity.includes('star') ||
        /\bstar\b/i.test(card.name || '')
      );

    case 'shining-crystal':
      return (
        name.startsWith('shining') ||
        name.startsWith('crystal') ||
        name.includes(' shining') ||
        name.includes(' crystal') ||
        rarity.includes('shining')
      );

    case 'lv-x':
      return (
        name.includes('lv.x') ||
        name.includes('lv. x') ||
        name.includes('lv x') ||
        rarity.includes('lv.x')
      );

    case 'prime':
      return (
        name.includes('prime') ||
        rarity.includes('prime') ||
        /\bprime\b/i.test(card.name || '')
      );

    case 'legend':
      return (
        name.includes('legend') ||
        rarity.includes('legend') ||
        /\blegend\b/i.test(card.name || '')
      );

    case 'tag-team':
      return (
        (name.includes('&') && (name.includes('gx') || name.includes('tag team'))) ||
        rarity.includes('tag team')
      );

    case 'sir':
      return (
        rarity.includes('special illustration') ||
        rarity.includes('sar') ||
        rarity.includes('special art rare')
      );

    case 'ir':
      return (
        rarity.includes('illustration rare') ||
        rarity.includes('art rare') ||
        rarity === 'ar' ||
        rarity === 'ir'
      );

    case 'tg':
      return (
        rarity.includes('character') ||
        id.includes('-tg') ||
        id.includes('-gg') ||
        name.includes('chr') ||
        name.includes('csr')
      );

    case 'alt-art':
      return (
        rarity.includes('special illustration') ||
        rarity.includes('alternate art') ||
        rarity.includes('alt art') ||
        (name.includes('vmax') && rarity.includes('secret')) ||
        id.includes('-tg') ||
        id.includes('-gg')
      );

    case 'm-ex':
      return (
        name.startsWith('m ') ||
        name.startsWith('mega ') ||
        name.includes('m-ex') ||
        name.includes('mega ex')
      );

    case 'classic-ex':
      return (
        (name.endsWith(' ex') || name.includes(' ex ')) &&
        getCardEra(card.id, card.setName) === 'ex'
      );

    case 'vmax-vstar':
      return name.includes('vmax') || name.includes('vstar');

    case 'break':
      return name.includes('break');

    case 'radiant':
      return name.startsWith('radiant') || rarity.includes('radiant') || rarity.includes('kagayaku');

    case 'amazing-rare':
      return rarity.includes('amazing') || name.includes('amazing rare');

    case 'prism-star':
      return (
        name.includes('◇') ||
        name.includes('♢') ||
        rarity.includes('prism') ||
        name.includes('prism star')
      );

    case 'ace-spec':
      return (
        rarity.includes('ace spec') ||
        name.includes('ace spec') ||
        (card.category || '').toLowerCase().includes('ace spec')
      );

    case 'stamped-promos':
    case 'burgerchu-stamped':
      return (
        name.includes('stamp') ||
        name.includes('stamped') ||
        name.includes('mcdonald') ||
        name.includes('mcd') ||
        name.includes('domino') ||
        name.includes('pizza hut') ||
        name.includes('coco') ||
        name.includes('mister donut') ||
        name.includes('7-eleven') ||
        name.includes('special delivery') ||
        name.includes('van gogh') ||
        name.includes('felt hat') ||
        name.includes('yu nagaba') ||
        name.includes('nagaba') ||
        name.includes('gamestop') ||
        name.includes('eb games') ||
        name.includes('best buy') ||
        name.includes('toys "r" us') ||
        name.includes('toys r us') ||
        name.includes('target') ||
        name.includes('prerelease') ||
        name.includes('staff') ||
        name.includes('play! pokemon') ||
        name.includes('league') ||
        name.includes('winner') ||
        name.includes('pokemon center') ||
        name.includes('taipei') ||
        name.includes('shibuya') ||
        name.includes('kanazawa') ||
        name.includes('burgerchu') ||
        id.includes('020-m-p') ||
        id.includes('020/m-p') ||
        id.includes('033-sv-p') ||
        id.includes('033/sv-p') ||
        id.includes('swsh074') ||
        id.includes('swsh075') ||
        id.includes('swsh111') ||
        id.includes('085-svp') ||
        id.includes('208-s-p') ||
        id.includes('062-sv-p') ||
        id.includes('005-l-p')
      );

    case 'exclusives-only':
      return card.isExclusive === true;

    default:
      return true;
  }
}

// ==========================================
// 5. CURATED ICONIC TRUE EXCLUSIVE CARDS
// ==========================================

export const CURATED_TRUE_EXCLUSIVES: SearchCardResult[] = [
  // Stamped Collaboration Promos - Food Places (McDonald's, Domino's, Pizza Hut)
  {
    id: 'm-p-020',
    name: 'Pikachu (McDonald’s Japan Promo 020/M-P) [JP Exclusive]',
    setName: 'McDonald’s Japan Happy Meal 2025',
    image: 'https://images.pokemontcg.io/mcd21/25_hires.png',
    imageUrl: 'https://images.pokemontcg.io/mcd21/25_hires.png',
    price: '28.50',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket / Mercari'
  },
  {
    id: 'sv-p-033',
    name: 'Pikachu (McDonald’s China Promo 033/SV-P) [CH Exclusive]',
    setName: 'McDonald’s China 2024 Collaboration',
    image: 'https://images.pokemontcg.io/mcd19/12_hires.png',
    imageUrl: 'https://images.pokemontcg.io/mcd19/12_hires.png',
    price: '34.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: '005-l-p',
    name: 'Snorlax (Domino’s Pizza Japan Stamped Promo) [JP Exclusive]',
    setName: 'Domino’s Pizza Japan L-P Promos',
    image: 'https://images.pokemontcg.io/col1/33_hires.png',
    imageUrl: 'https://images.pokemontcg.io/col1/33_hires.png',
    price: '145.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sv-p-022',
    name: 'Sprigatito (Pizza Hut China Stamped Promo) [CH Exclusive]',
    setName: 'Pizza Hut China SV-P Promos',
    image: 'https://images.pokemontcg.io/svp/003_hires.png',
    imageUrl: 'https://images.pokemontcg.io/svp/003_hires.png',
    price: '38.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },

  // Stamped Collaboration Promos - Non-Food (Pokémon Center, Museums, Artists, Retailers)
  {
    id: 'swsh074',
    name: 'Special Delivery Pikachu (Pokémon Center Stamped Promo SWSH074)',
    setName: 'SWSH Black Star Promos',
    image: 'https://images.pokemontcg.io/swshp/SWSH074_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH074_hires.png',
    price: '135.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'swsh075',
    name: 'Special Delivery Charizard (Pokémon Center Stamped Promo SWSH075)',
    setName: 'SWSH Black Star Promos',
    image: 'https://images.pokemontcg.io/swshp/SWSH075_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH075_hires.png',
    price: '42.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'swsh111',
    name: 'Special Delivery Bidoof (Pokémon Center Stamped Promo SWSH111)',
    setName: 'SWSH Black Star Promos',
    image: 'https://images.pokemontcg.io/swshp/SWSH111_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH111_hires.png',
    price: '280.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'svp-085',
    name: 'Pikachu with Grey Felt Hat (Van Gogh Museum Promo 085)',
    setName: 'Scarlet & Violet Promos',
    image: 'https://images.pokemontcg.io/svp/085_hires.png',
    imageUrl: 'https://images.pokemontcg.io/svp/085_hires.png',
    price: '92.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 's-p-208',
    name: 'Pikachu (Yu Nagaba Special Stamped Promo 208/S-P) [JP Exclusive]',
    setName: 'S-P Promotional Cards',
    image: 'https://images.pokemontcg.io/swshp/SWSH039_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH039_hires.png',
    price: '45.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sv-p-062',
    name: 'Eevee (Yu Nagaba Special Stamped Promo 062/SV-P) [JP Exclusive]',
    setName: 'SV-P Promotional Cards',
    image: 'https://images.pokemontcg.io/svp/001_hires.png',
    imageUrl: 'https://images.pokemontcg.io/svp/001_hires.png',
    price: '26.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'tru-pikachu',
    name: 'Pikachu (Toys "R" Us 20th Anniversary Stamped Promo)',
    setName: 'Generations Promos',
    image: 'https://images.pokemontcg.io/g1/26_hires.png',
    imageUrl: 'https://images.pokemontcg.io/g1/26_hires.png',
    price: '65.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'gamestop-miraidon',
    name: 'Miraidon (GameStop Stamped Exclusive Promo 013/SVP)',
    setName: 'Scarlet & Violet Promos',
    image: 'https://images.pokemontcg.io/svp/013_hires.png',
    imageUrl: 'https://images.pokemontcg.io/svp/013_hires.png',
    price: '18.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'swsh066-staff',
    name: 'Charizard (Vivid Voltage Prerelease "STAFF" Stamped Promo SWSH066)',
    setName: 'SWSH Black Star Promos',
    image: 'https://images.pokemontcg.io/swshp/SWSH066_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH066_hires.png',
    price: '850.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },

  // Chinese Exclusives: Gem Pack Alternate Artworks & Lotteries
  {
    id: 'gem-cubone',
    name: 'Cubone (Gem Pack Exclusive Full Art) [CH Exclusive]',
    setName: 'Simplified Chinese Gem Pack Vol. 1',
    image: 'https://images.pokemontcg.io/swsh4/114_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swsh4/114_hires.png',
    price: '85.00',
    rarity: 'Illustration Rare',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'gem-gengar',
    name: 'Gengar (Clefairy Dolls Exclusive Art) [CH Exclusive]',
    setName: 'Simplified Chinese Gem Pack Vol. 2',
    image: 'https://images.pokemontcg.io/swsh8/157_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swsh8/157_hires.png',
    price: '125.00',
    rarity: 'Special Illustration Rare',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'sv-p-019',
    name: 'Taipei’s Pikachu (Grand Opening Promo) [CH Exclusive]',
    setName: 'Pokémon Center Taipei Opening',
    image: 'https://images.pokemontcg.io/svp/001_hires.png',
    imageUrl: 'https://images.pokemontcg.io/svp/001_hires.png',
    price: '65.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'sv-p-003',
    name: 'Mew ex (Lottery Mission Special Promo) [CH Exclusive]',
    setName: 'Simplified Chinese SV-P Promos',
    image: 'https://images.pokemontcg.io/sv3pt5/151_hires.png',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/151_hires.png',
    price: '450.00',
    rarity: 'Special Illustration Rare',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },

  // Japanese Iconic Pokémon Exclusives: Scream, Poncho, Stamp Box
  {
    id: 'sm-p-288',
    name: 'Pikachu (Munch: The Scream Retrospective) [JP Exclusive]',
    setName: 'Tokyo Metropolitan Art Museum Promos',
    image: 'https://images.pokemontcg.io/smp/SM162_hires.png',
    imageUrl: 'https://images.pokemontcg.io/smp/SM162_hires.png',
    price: '950.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm-p-289',
    name: 'Mimikyu (Munch: The Scream Retrospective) [JP Exclusive]',
    setName: 'Tokyo Metropolitan Art Museum Promos',
    image: 'https://images.pokemontcg.io/smp/SM163_hires.png',
    imageUrl: 'https://images.pokemontcg.io/smp/SM163_hires.png',
    price: '1600.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'xy-p-230',
    name: 'Rayquaza Poncho Pikachu [JP Exclusive]',
    setName: 'XY-P Promotional Cards',
    image: 'https://images.pokemontcg.io/xyp/XY177_hires.png',
    imageUrl: 'https://images.pokemontcg.io/xyp/XY177_hires.png',
    price: '1850.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'xy-p-294',
    name: 'Mario Pikachu (Special Box Full Art) [JP Exclusive]',
    setName: 'XY-P Promotional Cards',
    image: 'https://images.pokemontcg.io/xyp/XY175_hires.png',
    imageUrl: 'https://images.pokemontcg.io/xyp/XY175_hires.png',
    price: '2400.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 's-p-226',
    name: 'Cramorant (Japan Post Stamp Box) [JP Exclusive]',
    setName: 'S-P Promotional Cards',
    image: 'https://images.pokemontcg.io/swshp/SWSH146_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH146_hires.png',
    price: '190.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 's-p-227',
    name: 'Pikachu (Japan Post Stamp Box) [JP Exclusive]',
    setName: 'S-P Promotional Cards',
    image: 'https://images.pokemontcg.io/swshp/SWSH145_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH145_hires.png',
    price: '380.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },

  // Japanese True Exclusive Full Art Trainers & Supporters
  {
    id: 'sm12a-189',
    name: 'Will (Tag All Stars Full Art 189/173) [JP Exclusive]',
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/sm/sm12a/189/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm12a/189/high.webp',
    price: '38.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm12a-191',
    name: 'Misty & Lorelei (Tag All Stars Full Art 191/173) [JP Exclusive]',
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/sm/sm12a/191/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm12a/191/high.webp',
    price: '115.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm12a-192',
    name: 'Sightseer (Tag All Stars Full Art 192/173) [JP Exclusive]',
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/sm/sm12a/192/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm12a/192/high.webp',
    price: '460.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm12a-193',
    name: "Blue's Tactics (Tag All Stars Alt Art Full Art 193/173) [JP Exclusive]",
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/sm/sm12a/193/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm12a/193/high.webp',
    price: '65.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm12a-194',
    name: 'Bellelba & Brycen-Man (Tag All Stars Full Art 194/173) [JP Exclusive]',
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/sm/sm12a/194/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm12a/194/high.webp',
    price: '42.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm12a-195',
    name: 'Hapu (Tag All Stars Full Art 195/173) [JP Exclusive]',
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/sm/sm12a/195/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm12a/195/high.webp',
    price: '45.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm12a-196',
    name: "Green's Exploration (Tag All Stars Alt Art Full Art 196/173) [JP Exclusive]",
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/sm/sm12a/196/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm12a/196/high.webp',
    price: '210.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm12a-199',
    name: 'Clay (Tag All Stars Full Art 199/173) [JP Exclusive]',
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/sm/sm12a/199/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm12a/199/high.webp',
    price: '28.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm12a-201',
    name: "Red's Challenge (Tag All Stars Alt Art Full Art 201/173) [JP Exclusive]",
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/sm/sm12a/201/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm12a/201/high.webp',
    price: '85.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm-p-401',
    name: 'Alolan Friends [JP Exclusive]',
    setName: 'SM-P Promotional Cards',
    image: 'https://assets.tcgdex.net/ja/sm/sm-p/401/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm-p/401/high.webp',
    price: '1450.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm-p-064',
    name: 'The Masked Royal [JP Exclusive]',
    setName: 'SM-P Promotional Cards',
    image: 'https://assets.tcgdex.net/ja/sm/sm-p/064/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm-p/064/high.webp',
    price: '3200.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm-p-397',
    name: 'Lillie (Extra Battle Day Promo) [JP Exclusive]',
    setName: 'Extra Battle Day Prize Promos',
    image: 'https://assets.tcgdex.net/ja/sm/sm-p/397/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm-p/397/high.webp',
    price: '4800.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm-p-395',
    name: 'Acerola (Extra Battle Day Promo) [JP Exclusive]',
    setName: 'Extra Battle Day Prize Promos',
    image: 'https://assets.tcgdex.net/ja/sm/sm-p/395/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm-p/395/high.webp',
    price: '3600.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm-p-396',
    name: 'Guzma (Extra Battle Day Promo) [JP Exclusive]',
    setName: 'Extra Battle Day Prize Promos',
    image: 'https://assets.tcgdex.net/ja/sm/sm-p/396/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/sm/sm-p/396/high.webp',
    price: '1200.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  }
];
