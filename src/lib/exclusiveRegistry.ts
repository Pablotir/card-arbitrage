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

  // The Best of XY (SM2L) Exclusive Full Arts
  'sm2l-178', // Lysandre Full Art (178/171)
  'sm2l-179', // Professor Sycamore Full Art (179/171)
  'sm2l-180', // N Full Art (180/171)
  'sm2l-181', // Hex Maniac Full Art (181/171)
  'sm2l-182', // Blacksmith Full Art (182/171)
  'sm2l-183', // Karen Full Art (183/171)
  'sm2l-177', // Karen Full Art (177/171)
  'sm2l-184', // Delinquent Full Art (184/171)
  'sm2l-185', // Shauna Full Art (185/171)
  'sm2l-186', // Team Flare Grunt Full Art (186/171)

  // Character Promos
  'sm-p-279', // Red's Pikachu (279/SM-P)
  'sm-p-381', // Clefairy (Lillie Dream League Promo 381/SM-P)

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

  // Gem Pack Vol. 1 - Vol. 7 Exclusive Alternate Artworks (Never printed in EN/JA)
  'gem-gengar',     // Exclusive Gengar with Clefairy dolls artwork
  'gem-cubone',     // Exclusive Cubone Full Art artwork
  'gem-ceruledge',  // Exclusive Ceruledge illustration
  'gem-ponyta',     // Exclusive Ponyta illustration
  'gem-arcanine-ex',// Exclusive Arcanine ex alternate art
  'gem-pikachu',    // Exclusive Captain Pikachu illustration
  'gem-umbreon',    // Exclusive Umbreon Full Art
  'gem-leafeon',    // Exclusive Leafeon Full Art
  'gem-sylveon',    // Exclusive Sylveon Full Art
  'cbb7c-psyduck',  // Exclusive Misty's Psyduck Illustration Rare (Gem Pack Vol. 7)

  // Simplified Chinese Starry Crystal (CSV9C) Exclusive Full Art Trainers
  'csv9c-257',      // Lisia's Appeal SAR Exclusive Alternate Artwork (257/208)
  'csv9c-241',      // Lisia's Appeal SR (241/208)
  '257-csv9c',
  '241-csv9c',
  'cs-p-lisia',

  // Simplified Chinese Expansion Exclusive SAR Trainers (Black Bolt, White Flare, etc.)
  'csv11-ns-plan',  // N's Plan SAR (Black Bolt CSV11)
  'csv12-hilda',    // Hilda SAR (White Flare CSV12)
  'csv9pt5c-159',   // Rika SAR (Stellar Miracle CSV9.5C #159/129)
  'csv4c-157',      // Larry SAR (Paradox Rift CSV4C #157/129)
  'csv5c-245',      // Ciphermaniac's Codebreaking SAR (Temporal Forces CSV5C #245/204)
  'csv7c-255',      // Carmine SAR (Mask of Change CSV7C #255/207)
  'csv8c-276',      // Brock's Scouting SAR (Shrouded Fable CSV8C #276/222)

  // Simplified Chinese Promos & Stamp Boxes
  'cs-p-friends-alola', // Friends in Alola (Grand Opening Promo)
  'cs-p-friends-galar', // Friends in Galar (Stamp Box Promo)

  // Collect 151 C Pikachu Art Rares
  '151c-170',
  '151c-171',
  '151c-172',
  '151c-173',
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
  number?: string;
  set?: { id?: string };
  setName?: string;
}): boolean {
  if (!card) return false;
  const idNorm = (card.id || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const localId = (card.localId || card.number || idNorm.split('-')[1] || '').trim();
  const nameLower = (card.name || '').toLowerCase();
  const setLower = (card.setName || card.set?.id || '').toLowerCase();

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
  const setIdNorm = (card.set?.id || card.setName || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (idNorm.includes('sm12a') || setIdNorm.includes('sm12a') || setLower.includes('tag team gx') || setLower.includes('タッグオール')) {
    if (['189', '191', '192', '193', '194', '195', '196', '199', '201'].includes(localId)) return true;
    if (nameLower.includes('will') || nameLower.includes('イツキ')) return true;
    if (nameLower.includes('bellelba') || nameLower.includes('ジュジュベ')) return true;
    if (nameLower.includes('hapu') || nameLower.includes('ハプウ')) return true;
    if (nameLower.includes('clay') || nameLower.includes('ヤーコン')) return true;
    if (nameLower.includes('sightseer') || nameLower.includes('かんこうきゃく')) return true;
    if (nameLower.includes('misty & lorelei') || nameLower.includes('カスミ&カンナ')) return true;
  }

  // 3b. The Best of XY (SM2L) Exclusive Full Arts
  if (idNorm.includes('sm2l') || setIdNorm.includes('sm2l') || setLower.includes('best of xy') || setLower.includes('ベストオブxy')) {
    if (['180', '181', '182', '183', '177', '184', '185', '186'].includes(localId)) return true;
    if (nameLower.includes('hex maniac') || nameLower.includes('オカルトマニア')) return true;
    if (nameLower.includes('blacksmith') || nameLower.includes('鍛冶屋')) return true;
    if (nameLower.includes('karen') || nameLower.includes('カリン')) return true;
    if (nameLower.includes('delinquent') || nameLower.includes('こわいおねえさん')) return true;
    if (nameLower.includes('shauna') || nameLower.includes('サナ')) return true;
    if (nameLower.includes('team flare grunt') || nameLower.includes('フレア団したっぱ')) return true;
    if (nameLower === 'n' || nameLower.includes(' n ') || nameLower.startsWith('n ')) return true;
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

  // 4. Gem Pack exclusive artworks (Simplified Chinese Gem Pack Vol 1-7)
  if (setLower.includes('gem pack') || setLower.includes('九彩汇聚') || nameLower.includes('gem pack') || idNorm.includes('cbb')) {
    if (['gengar', 'cubone', 'ceruledge', 'ponyta', 'arcanine', 'captain pikachu', 'umbreon', 'leafeon', 'sylveon', 'psyduck'].some(k => nameLower.includes(k))) {
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

  // 8. Friends in Alola & Friends in Galar Chinese Exclusive Promos
  if ((nameLower.includes('friends in alola') || nameLower.includes('friends in galar')) && (idNorm.includes('cs-p') || setLower.includes('cs-p') || setLower.includes('simplified'))) {
    return true;
  }

  // 9. Simplified Chinese Starry Crystal (CSV9C) Exclusive Full Art Trainers (Lisia's Appeal 257 & 241)
  if (nameLower.includes('lisia') && (nameLower.includes('appeal') || setLower.includes('starry') || idNorm.includes('csv9c'))) {
    return true;
  }

  // 10. Simplified Chinese Black Bolt & White Flare Exclusive SAR Trainers (N's Plan & Hilda)
  if ((nameLower.includes("n's plan") || nameLower.includes('ns plan')) && (idNorm.includes('csv11') || setLower.includes('black bolt'))) {
    return true;
  }
  if (nameLower.includes('hilda') && (idNorm.includes('csv12') || setLower.includes('white flare'))) {
    return true;
  }

  // 11. Other Simplified Chinese Expansion Exclusive SAR Trainers (Rika, Larry, Ciphermaniac, Carmine, Brock)
  if (idNorm.includes('csv') || setLower.includes('csv')) {
    if (['rika', 'larry', 'ciphermaniac', 'carmine', 'brock'].some(k => nameLower.includes(k))) {
      return true;
    }
  }

  // 12. Collect 151 C Pikachu Art Rares (#170-#173)
  if ((idNorm.includes('151c') || setLower.includes('151 c')) && ['170', '171', '172', '173'].includes(localId)) {
    return true;
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
    name: 'Mega Evolution (ME)',
    shortName: 'Mega Evolution',
    years: '2025–Present',
    prefixes: ['me', 'me01', 'me02', 'me03', 'me04', 'm1', 'm2', 'm3', 'm4', 'm5', 'm-p']
  },
  {
    id: 'sv',
    name: 'Scarlet & Violet (SV)',
    shortName: 'Scarlet & Violet',
    years: '2023–Present',
    prefixes: ['sv', 'sv01', 'sv02', 'sv03', 'sv04', 'sv05', 'sv06', 'sv07', 'sv08', 'sv-p', 'svln', 'csv', 'cbb', '151c']
  },
  {
    id: 'swsh',
    name: 'Sword & Shield (SWSH)',
    shortName: 'Sword & Shield',
    years: '2020–2023',
    prefixes: ['swsh', 'swsh45', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's-p', 'sc1', 'sc2']
  },
  {
    id: 'sm',
    name: 'Sun & Moon (SM)',
    shortName: 'Sun & Moon',
    years: '2017–2019',
    prefixes: ['sm', 'sma', 'sm115', 'sm12a', 'sm-p', 'smp', 'ac1', 'ac2']
  },
  {
    id: 'xy',
    name: 'XY Series (XY)',
    shortName: 'XY',
    years: '2013–2016',
    prefixes: ['xy', 'sm2l', 'xy171', 'xy-p', 'xyp']
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

  // 1. High priority explicit overrides for cross-generational sets/promos
  if (set.includes('30th celebration') || set.includes('30th anniversary') || set.includes('m6a') || id.startsWith('me') || id.startsWith('m6') || set.includes('mega evolution') || set.includes('delta reign') || set.includes('ascended heroes') || set.includes('pitch black') || set.includes('chaos rising') || set.includes('perfect order') || set.includes('phantasmal flames')) {
    return 'me';
  }
  if (set.includes('celebrations') || id.startsWith('cel25') || id.startsWith('swsh-cel')) {
    return 'swsh';
  }
  if (
    set.includes('extra battle day') ||
    id.includes('395') || id.includes('396') || id.includes('397') || id.includes('398') || id.includes('399') ||
    id.includes('064') || id.includes('100') ||
    id.includes('friends-alola') || id.includes('alolan-friends') || set.includes('friends in alola') || set.includes('alolan friends') ||
    set.includes('masked royal')
  ) {
    return 'sm';
  }
  if (set.includes('black bolt') || set.includes('white flare') || id.includes('csv11') || id.includes('csv12') || id.includes('ns-plan') || id.includes('hilda')) {
    return 'sv';
  }
  if (set.includes('hidden fates') || id.startsWith('sma') || set.includes('sm115')) {
    return 'sm';
  }
  if (set.includes('shining fates') || id.startsWith('swsh45')) {
    return 'swsh';
  }
  if (id.includes('friends-galar') || set.includes('friends in galar')) {
    return 'swsh';
  }
  if (set.includes('tag all stars') || id.startsWith('sm12a')) {
    return 'sm';
  }
  if (set.includes('the best of xy') || id.startsWith('sm2l') || id.startsWith('xy171')) {
    return 'xy';
  }

  // 2. Set prefix match at start of card ID (e.g. 'sv01' from 'sv01-100', 'swsh12' from 'swsh12-TG23')
  const setPart = id.split('-')[0] || '';

  for (const era of POKEMON_ERAS) {
    if (
      era.prefixes.some(p => setPart === p || setPart.startsWith(p)) ||
      set.includes(era.shortName.toLowerCase()) ||
      set.includes(era.name.toLowerCase())
    ) {
      return era.id;
    }
  }

  // 3. Fallbacks by set keywords
  if (set.includes('chaos rising') || set.includes('mega evolution') || id.startsWith('me')) return 'me';
  if (set.includes('scarlet') || set.includes('violet') || set.includes('151') || set.includes('paldean') || set.includes('paradox') || set.includes('temporal') || set.includes('twilight') || set.includes('stellar') || set.includes('surging') || set.includes('prismatic') || set.includes('starry') || set.includes('gem pack') || set.includes('black bolt') || set.includes('white flare') || id.includes('csv') || id.includes('cbb') || id.includes('151c')) return 'sv';
  if (set.includes('sword') || set.includes('shield') || set.includes('vivid') || set.includes('darkness') || set.includes('battle styles') || set.includes('chilling') || set.includes('evolving') || set.includes('fusion') || set.includes('brilliant') || set.includes('astral') || set.includes('lost origin') || set.includes('silver tempest') || set.includes('crown zenith') || id.startsWith('sc1') || id.startsWith('sc2')) return 'swsh';
  if (set.includes('sun') || set.includes('moon') || set.includes('guardians') || set.includes('burning shadows') || set.includes('crimson') || set.includes('ultra prism') || set.includes('forbidden light') || set.includes('celestial') || set.includes('dragon majesty') || set.includes('lost thunder') || set.includes('team up') || set.includes('unbroken') || set.includes('unified minds') || set.includes('cosmic eclipse')) return 'sm';
  if (set.includes('flashfire') || set.includes('furious fists') || set.includes('phantom forces') || set.includes('primal clash') || set.includes('roaring skies') || set.includes('ancient origins') || set.includes('breakthrough') || set.includes('breakpoint') || set.includes('generations') || set.includes('fates collide') || set.includes('steam siege') || set.includes('evolutions') || id.startsWith('xy')) return 'xy';
  if (set.includes('noble victories') || set.includes('next destinies') || set.includes('dark explorers') || set.includes('dragons exalted') || set.includes('boundaries crossed') || set.includes('plasma') || id.startsWith('bw')) return 'bw';
  if (set.includes('heartgold') || set.includes('soulsilver') || set.includes('triumphant') || set.includes('undaunted') || set.includes('unleashed') || set.includes('call of legends') || id.startsWith('hgss')) return 'hgss';
  if (set.includes('diamond') || set.includes('pearl') || set.includes('platinum') || set.includes('mysterious treasures') || set.includes('secret wonders') || set.includes('great encounters') || set.includes('majestic dawn') || set.includes('legends awakened') || set.includes('stormfront') || set.includes('rising rivals') || set.includes('supreme victors') || set.includes('arceus') || id.startsWith('dp') || id.startsWith('pl')) return 'dp';
  if (set.includes('ruby') || set.includes('sapphire') || set.includes('sandstorm') || set.includes('dragon') || set.includes('magma') || set.includes('aqua') || set.includes('hidden legends') || set.includes('firered') || set.includes('leafgreen') || set.includes('deoxys') || set.includes('emerald') || set.includes('unseen forces') || set.includes('delta species') || set.includes('legend maker') || set.includes('holon') || set.includes('crystal guardians') || set.includes('power keepers') || id.startsWith('ex')) return 'ex';
  if (set.includes('expedition') || set.includes('aquapolis') || set.includes('skyridge') || id.startsWith('e1') || id.startsWith('e2')) return 'ecard';
  if (set.includes('genesis') || set.includes('discovery') || set.includes('revelation') || set.includes('destiny') || id.startsWith('neo')) return 'neo';
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/189/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/189/high.webp',
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/191/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/191/high.webp',
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/192/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/192/high.webp',
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/193/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/193/high.webp',
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/194/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/194/high.webp',
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/195/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/195/high.webp',
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/196/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/196/high.webp',
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/199/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/199/high.webp',
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/201/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/201/high.webp',
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
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598478_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598478_in_1000x1000.jpg',
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
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598161_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598161_in_1000x1000.jpg',
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
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598474_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598474_in_1000x1000.jpg',
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
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598472_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598472_in_1000x1000.jpg',
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
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598473_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598473_in_1000x1000.jpg',
    price: '1200.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm2l-182',
    name: 'Blacksmith (The Best of XY Full Art 182/171) [JP Exclusive]',
    setName: 'The Best of XY (SM2L)',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598717_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598717_in_1000x1000.jpg',
    price: '45.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'xy2-88a',
    name: 'Blacksmith (Alternate Full Art 88a/106)',
    setName: 'Alternate Art Promos',
    image: 'https://assets.tcgdex.net/en/xy/xy2/88a/high.webp',
    imageUrl: 'https://assets.tcgdex.net/en/xy/xy2/88a/high.webp',
    price: '45.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'sm2l-181',
    name: 'Hex Maniac (The Best of XY Full Art 181/171) [JP Exclusive]',
    setName: 'The Best of XY (SM2L)',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598818_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598818_in_1000x1000.jpg',
    price: '420.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket / Mercari'
  },
  {
    id: 'xy7-75a',
    name: 'Hex Maniac (Alternate Full Art 75a/98)',
    setName: 'Alternate Art Promos',
    image: 'https://assets.tcgdex.net/en/xy/xy7/75a/high.webp',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/148342_in_1000x1000.jpg',
    price: '126.40',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'sm2l-180',
    name: 'N (The Best of XY Full Art 180/171) [JP Exclusive]',
    setName: 'The Best of XY (SM2L)',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598897_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598897_in_1000x1000.jpg',
    price: '160.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket / Mercari'
  },
  {
    id: 'xy10-105a',
    name: 'N (Alternate Full Art 105a/124)',
    setName: 'Alternate Art Promos',
    image: 'https://assets.tcgdex.net/en/xy/xy10/105a/high.webp',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/148347_in_1000x1000.jpg',
    price: '68.50',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'sm2l-184',
    name: 'Delinquent (The Best of XY Full Art 184/171) [JP Exclusive]',
    setName: 'The Best of XY (SM2L)',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598755_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598755_in_1000x1000.jpg',
    price: '95.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket / Mercari'
  },
  {
    id: 'xy9-98b',
    name: 'Delinquent (Alternate Full Art 98b/122)',
    setName: 'Alternate Art Promos',
    image: 'https://assets.tcgdex.net/en/xy/xy9/98b/high.webp',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/148341_in_1000x1000.jpg',
    price: '32.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'sm2l-185',
    name: 'Shauna (The Best of XY Full Art 185/171) [JP Exclusive]',
    setName: 'The Best of XY (SM2L)',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598955_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598955_in_1000x1000.jpg',
    price: '110.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket / Mercari'
  },
  {
    id: 'xy10-111a',
    name: 'Shauna (Alternate Full Art 111a/124)',
    setName: 'Alternate Art Promos',
    image: 'https://assets.tcgdex.net/en/xy/xy10/111a/high.webp',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/148349_in_1000x1000.jpg',
    price: '34.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'sm2l-186',
    name: 'Team Flare Grunt (The Best of XY Full Art 186/171) [JP Exclusive]',
    setName: 'The Best of XY (SM2L)',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598983_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598983_in_1000x1000.jpg',
    price: '65.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket / Mercari'
  },
  {
    id: 'g1-73a',
    name: 'Team Flare Grunt (Alternate Full Art 73a/83)',
    setName: 'Alternate Art Promos',
    image: 'https://assets.tcgdex.net/en/xy/g1/73a/high.webp',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/148351_in_1000x1000.jpg',
    price: '18.50',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'sm-p-013',
    name: 'Team Skull Grunt (Special Box Full Art 013/SM-P) [JP Exclusive]',
    setName: 'SM-P Promotional Cards',
    image: 'https://images.pokemontcg.io/smp/SM24_hires.png',
    imageUrl: 'https://images.pokemontcg.io/smp/SM24_hires.png',
    price: '180.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket / Mercari'
  },
  {
    id: 'sm12a-193',
    name: "Blue's Tactics (Tag All Stars Alt Art Full Art 193/173) [JP Exclusive]",
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/193/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/193/high.webp',
    price: '95.00',
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
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/196/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/196/high.webp',
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
    id: 'sm12a-201',
    name: "Red's Challenge (Tag All Stars Alt Art Full Art 201/173) [JP Exclusive]",
    setName: 'Tag All Stars (SM12a)',
    image: 'https://assets.tcgdex.net/ja/SM/SM12a/201/high.webp',
    imageUrl: 'https://assets.tcgdex.net/ja/SM/SM12a/201/high.webp',
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
    id: 'swsh121',
    name: 'Marnie (Premium Tournament Collection Full Art Promo SWSH121)',
    setName: 'SWSH Black Star Promos',
    image: 'https://images.pokemontcg.io/swshp/SWSH121_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH121_hires.png',
    price: '42.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'swsh178',
    name: 'Professor Juniper (Premium Tournament Collection Full Art Promo SWSH178)',
    setName: 'SWSH Black Star Promos',
    image: 'https://images.pokemontcg.io/swshp/SWSH178_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH178_hires.png',
    price: '9.50',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'swsh251',
    name: "Boss's Orders [Cyrus] (Premium Tournament Collection Full Art Promo SWSH251)",
    setName: 'SWSH Black Star Promos',
    image: 'https://images.pokemontcg.io/swshp/SWSH251_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH251_hires.png',
    price: '18.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'swsh302',
    name: 'Klara (Premium Tournament Collection Full Art Promo SWSH302)',
    setName: 'SWSH Black Star Promos',
    image: 'https://images.pokemontcg.io/swshp/SWSH302_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH302_hires.png',
    price: '16.50',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'svp-124',
    name: 'Iono (Premium Tournament Collection Full Art Promo 124)',
    setName: 'Scarlet & Violet Promos',
    image: 'https://images.pokemontcg.io/svp/124_hires.png',
    imageUrl: 'https://images.pokemontcg.io/svp/124_hires.png',
    price: '22.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'sm2l-177',
    name: 'Karen (The Best of XY Full Art 177/171) [JP Exclusive]',
    setName: 'The Best of XY (SM2L)',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598716_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598716_in_1000x1000.jpg',
    price: '240.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'xy9-114a',
    name: 'Professor Sycamore (Alternate Full Art 114a/114)',
    setName: 'Alternate Art Promos',
    image: 'https://assets.tcgdex.net/en/xy/xy9/114a/high.webp',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/148348_in_1000x1000.jpg',
    price: '14.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'sm2l-179',
    name: 'Professor Sycamore (The Best of XY Full Art 179/171) [JP Exclusive]',
    setName: 'The Best of XY (SM2L)',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598971_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598971_in_1000x1000.jpg',
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
    id: 'sm2l-178',
    name: 'Lysandre (The Best of XY Full Art 178/171) [JP Exclusive]',
    setName: 'The Best of XY (SM2L)',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598851_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598851_in_1000x1000.jpg',
    price: '40.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'bw100',
    name: 'N (BW Black Star Promo Full Art BW100)',
    setName: 'BW Black Star Promos',
    image: 'https://images.pokemontcg.io/bwp/BW100_hires.png',
    imageUrl: 'https://images.pokemontcg.io/bwp/BW100_hires.png',
    price: '130.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'sm-p-381',
    name: "Clefairy / Lillie's Clefairy (Dream League Promo 381/SM-P) [JP Exclusive]",
    setName: 'SM-P Promotional Cards',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598476_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598476_in_1000x1000.jpg',
    price: '220.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'sm-p-279',
    name: "Red's Pikachu (20th Anniversary Promo 279/SM-P) [JP Exclusive]",
    setName: 'SM-P Promotional Cards',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598471_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598471_in_1000x1000.jpg',
    price: '85.00',
    rarity: 'Promo',
    category: 'Pokemon',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'me-30th-n',
    name: 'N (30th Celebration Classic Collection Full Art)',
    setName: 'ME: 30th Celebration',
    image: 'https://images.pokemontcg.io/bw3/101_hires.png',
    imageUrl: 'https://images.pokemontcg.io/bw3/101_hires.png',
    price: '48.00',
    rarity: 'Classic Collection',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'me-30th-misty',
    name: 'Misty (30th Celebration Classic Collection)',
    setName: 'ME: 30th Celebration',
    image: 'https://images.pokemontcg.io/gym1/18_hires.png',
    imageUrl: 'https://images.pokemontcg.io/gym1/18_hires.png',
    price: '35.00',
    rarity: 'Classic Collection',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'en',
    game: 'pokemon',
    isExclusive: false,
    pricingSource: 'TCGPlayer'
  },
  {
    id: 'm6a-n',
    name: 'N (MEGA Expansion 30th Celebration Full Art) [JP Exclusive]',
    setName: 'MEGA Expansion 30th Celebration (M6a)',
    image: 'https://images.pokemontcg.io/bw3/101_hires.png',
    imageUrl: 'https://images.pokemontcg.io/bw3/101_hires.png',
    price: '55.00',
    rarity: 'Classic Collection',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'm6a-misty',
    name: 'Misty (MEGA Expansion 30th Celebration) [JP Exclusive]',
    setName: 'MEGA Expansion 30th Celebration (M6a)',
    image: 'https://images.pokemontcg.io/gym1/18_hires.png',
    imageUrl: 'https://images.pokemontcg.io/gym1/18_hires.png',
    price: '38.00',
    rarity: 'Classic Collection',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'ja',
    game: 'pokemon-japan',
    isExclusive: true,
    pricingSource: 'Cardmarket'
  },
  {
    id: 'cs-p-friends-alola',
    name: 'Friends in Alola (Simplified Chinese Grand Opening Promo) [CH Exclusive]',
    setName: 'Simplified Chinese CS-P Promos',
    image: 'https://tcgplayer-cdn.tcgplayer.com/product/598478_in_1000x1000.jpg',
    imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/598478_in_1000x1000.jpg',
    price: '380.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'cs-p-friends-galar',
    name: 'Friends in Galar (Simplified Chinese Stamp Box Promo) [CH Exclusive]',
    setName: 'Simplified Chinese CS-P Promos',
    image: 'https://images.pokemontcg.io/swsh12tg/TG23_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swsh12tg/TG23_hires.png',
    price: '220.00',
    rarity: 'Promo',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'csv9c-257',
    name: "Lisia's Appeal (Starry Crystal CSV9C SAR 257/208) [CH Exclusive]",
    setName: 'Starry Crystal (CSV9C)',
    image: 'https://media.pokipair.com/2026/05/06112014/CSVL1-Journey-Promo-Pack-Simplified-Chinese-Pokemon-PokiPair-092.png',
    imageUrl: 'https://media.pokipair.com/2026/05/06112014/CSVL1-Journey-Promo-Pack-Simplified-Chinese-Pokemon-PokiPair-092.png',
    price: '240.00',
    rarity: 'Special Illustration Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'csv9c-241',
    name: "Lisia's Appeal (Starry Crystal CSV9C SR 241/208) [CH Exclusive]",
    setName: 'Starry Crystal (CSV9C)',
    image: 'https://images.pokemontcg.io/sv8/234_hires.png',
    imageUrl: 'https://images.pokemontcg.io/sv8/234_hires.png',
    price: '85.00',
    rarity: 'Ultra Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'csv11-ns-plan',
    name: "N's Plan (Black Bolt CSV11 SAR) [CH Exclusive]",
    setName: 'Black Bolt (CSV11)',
    image: 'https://www.pokebeach.com/news/2026/10/N.png',
    imageUrl: 'https://www.pokebeach.com/news/2026/10/N.png',
    price: '210.00',
    rarity: 'Special Illustration Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'csv12-hilda',
    name: 'Hilda (White Flare CSV12 SAR) [CH Exclusive]',
    setName: 'White Flare (CSV12)',
    image: 'https://www.pokebeach.com/news/2026/10/Hilda.png',
    imageUrl: 'https://www.pokebeach.com/news/2026/10/Hilda.png',
    price: '280.00',
    rarity: 'Special Illustration Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'csv9pt5c-159',
    name: 'Rika (Stellar Miracle CSV9.5C SAR 159/129) [CH Exclusive]',
    setName: 'Stellar Miracle (CSV9.5C)',
    image: 'https://media.pokipair.com/2025/07/08221929/Reward-Round-CSV4-Simplified-Chinese-Pokemon-Set-List-389.png',
    imageUrl: 'https://media.pokipair.com/2025/07/08221929/Reward-Round-CSV4-Simplified-Chinese-Pokemon-Set-List-389.png',
    price: '125.00',
    rarity: 'Special Illustration Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'csv4c-157',
    name: 'Larry (Paradox Rift CSV4C SAR 157/129) [CH Exclusive]',
    setName: 'Paradox Rift (CSV4C)',
    image: 'https://media.pokipair.com/2025/08/09001126/Larry-Dark-Crystal-Blaze-CS5-Simplified-Chinese-Pokemon-PokiPair-Store.png',
    imageUrl: 'https://media.pokipair.com/2025/08/09001126/Larry-Dark-Crystal-Blaze-CS5-Simplified-Chinese-Pokemon-PokiPair-Store.png',
    price: '55.00',
    rarity: 'Special Illustration Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'csv5c-245',
    name: "Ciphermaniac's Codebreaking (Temporal Forces CSV5C SAR 245/204) [CH Exclusive]",
    setName: 'Temporal Forces (CSV5C)',
    image: 'https://media.pokipair.com/2026/01/14181856/CSV7-Blade-Awakened-Card-List-Simplified-Chinese-Pokemon-PokiPair-Store-598.png',
    imageUrl: 'https://media.pokipair.com/2026/01/14181856/CSV7-Blade-Awakened-Card-List-Simplified-Chinese-Pokemon-PokiPair-Store-598.png',
    price: '65.00',
    rarity: 'Special Illustration Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'csv7c-255',
    name: 'Carmine (Mask of Change CSV7C SAR 255/207) [CH Exclusive]',
    setName: 'Twilight Masquerade (CSV7C)',
    image: 'https://media.pokipair.com/2026/03/13084226/Bright-Fantasy-CSV8-Set-List-Simplified-Chinese-Pokemon-Ireland-Pokipair-Store-Ireland-607.png',
    imageUrl: 'https://media.pokipair.com/2026/03/13084226/Bright-Fantasy-CSV8-Set-List-Simplified-Chinese-Pokemon-Ireland-Pokipair-Store-Ireland-607.png',
    price: '145.00',
    rarity: 'Special Illustration Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'csv8c-276',
    name: "Brock's Scouting (Shrouded Fable CSV8C SAR 276/222) [CH Exclusive]",
    setName: 'Shrouded Fable (CSV8C)',
    image: 'https://media.pokipair.com/2026/08/10100732/Chasing-Glory-CSV10-Simplified-Chinese-Pokemon-Set-List-PokiPair-Ireland-672.png',
    imageUrl: 'https://media.pokipair.com/2026/08/10100732/Chasing-Glory-CSV10-Simplified-Chinese-Pokemon-Set-List-PokiPair-Ireland-672.png',
    price: '75.00',
    rarity: 'Special Illustration Rare',
    category: 'Trainer',
    trainerType: 'Supporter',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'cbb7c-psyduck',
    name: "Misty's Psyduck (Gem Pack Vol. 7 CBB7C Exclusive Art) [CH Exclusive]",
    setName: 'Simplified Chinese Gem Pack Vol. 7',
    image: 'https://images.pokemontcg.io/sv3pt5/175_hires.png',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/175_hires.png',
    price: '160.00',
    rarity: 'Illustration Rare',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: '151c-170',
    name: 'Pikachu (Collect 151 C Art Rare 170/165) [CH Exclusive]',
    setName: 'Collect 151 (151 C)',
    image: 'https://images.pokemontcg.io/sv3pt5/173_hires.png',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/173_hires.png',
    price: '110.00',
    rarity: 'Illustration Rare',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'gem-umbreon',
    name: 'Umbreon (Gem Pack Vol. 5 Exclusive Full Art) [CH Exclusive]',
    setName: 'Simplified Chinese Gem Pack Vol. 5',
    image: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    price: '320.00',
    rarity: 'Special Illustration Rare',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'gem-leafeon',
    name: 'Leafeon (Gem Pack Vol. 5 Exclusive Full Art) [CH Exclusive]',
    setName: 'Simplified Chinese Gem Pack Vol. 5',
    image: 'https://images.pokemontcg.io/swsh7/205_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swsh7/205_hires.png',
    price: '140.00',
    rarity: 'Illustration Rare',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  },
  {
    id: 'gem-sylveon',
    name: 'Sylveon (Gem Pack Vol. 6 Exclusive Full Art) [CH Exclusive]',
    setName: 'Simplified Chinese Gem Pack Vol. 6',
    image: 'https://images.pokemontcg.io/swsh7/212_hires.png',
    imageUrl: 'https://images.pokemontcg.io/swsh7/212_hires.png',
    price: '260.00',
    rarity: 'Special Illustration Rare',
    category: 'Pokemon',
    language: 'zh',
    game: 'pokemon',
    isExclusive: true,
    pricingSource: 'Asian Comps'
  }
];
