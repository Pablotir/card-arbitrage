import { SearchCardResult } from './types';

// Comprehensive dictionary mapping Japanese card & trainer names to their official English releases
export const JP_TRAINER_NAME_MAP: Record<string, string> = {
  // --- Sun & Moon Era Popular & Full Art Trainers ---
  'オーキド博士のセッティング': "Professor Oak's Setup",
  'オーキド博士': "Professor Oak",
  'オオキド博士': "Professor Oak",
  'マーズ': 'Mars',
  'ハンサム': 'Looker',
  'ローラースケーター': 'Roller Skater',
  '地底探険隊': 'Underground Expedition',
  'ぼんぐり職人': 'Apricorn Maker',
  'ポケモンブリーダー': 'Pokémon Breeder',
  'ポケモンブリーダーの育成': "Pokemon Breeder's Nurturing",
  'モノマネむすめ': 'Copycat',
  'アカネ': 'Whitney',
  'カルネ': 'Diantha',
  'ユリーカ': 'Bonnie',
  'ザオボー': 'Faba',
  'フウとラン': 'Tate & Liza',
  'きとうし': 'Channeler',
  'タケシのガッツ': "Brock's Grit",
  'タケシの訓練': "Brock's Training",
  'タケシ': 'Brock',
  'エーテル財団職員': 'Aether Foundation Employee',
  'ビッケ': 'Wicke',
  'マーレイン': 'Molayne',
  'クチナシ': 'Nanu',
  'カツラの一発勝負': "Blaine's Last Stand",
  'カツラ': 'Blaine',
  'ミカン': 'Jasmine',
  'ミカンのまなざし': "Jasmine's Gaze",
  'ヒガナ': 'Zinnia',
  'ヒガナの決意': "Zinnia's Resolve",
  'ギーマ': 'Grimsley',
  'ギーマの一手': "Grimsley's Move",
  'かいじゅうマニア': 'Poké Maniac',
  'コーチトレーナー': 'Coach Trainer',
  'ムサシとコジロウ': 'Jessie & James',
  'キョウの罠': "Koga's Trap",
  'キョウ': 'Koga',
  'スカル団のしたっぱ': 'Team Skull Grunt',
  'デンジ': 'Volkner',
  'ウルトラ調査隊': 'Ultra Recon Squad',
  'ウツギ博士のレクチャー': "Professor Elm's Lecture",
  'ウツギ博士': "Professor Elm",
  'サカキの追放': "Giovanni's Exile",
  'サカキのカリスマ': "Giovanni's Charisma",
  'サカキの追跡': "Giovanni's Scheme",
  'サカキの計画': "Giovanni's Scheme",
  'サカキ': 'Giovanni',
  'ロケット団のサカキ': "Team Rocket's Giovanni",
  'カスミ&カンナ': 'Misty & Lorelei',
  'カスミ＆カンナ': 'Misty & Lorelei',
  'カスミのおねがい': "Misty's Favor",
  'カスミのやる気': "Misty's Determination",
  'カスミの元気': "Misty's Determination",
  'カスミ': 'Misty',
  'ジュジュベ&ハチクマン': 'Bellelba & Brycen-Man',
  'ジュジュべ＆ハチクマン': 'Bellelba & Brycen-Man',
  'イツキ': 'Will',
  'ホミカ': 'Roxie',
  'ホミカの演奏': 'Roxie',
  'レッド&グリーン': 'Red & Blue',
  'レッド＆グリーン': 'Red & Blue',
  'レッドの挑戦': "Red's Challenge",
  'レッド': 'Red',
  'ブルーの探索': "Blue's Tactics",
  'ブルー': 'Blue',
  'グリーンの戦略': "Green's Exploration",
  'グリーン': 'Green',
  'マチスの作戦': "Lt. Surge's Strategy",
  'マチスの取引': "Lt. Surge's Strategy",
  'マチスの戦略': "Lt. Surge's Strategy",
  'マチス': 'Lt. Surge',
  'シロナ&カトレア': 'Cynthia & Caitlin',
  'シロナ＆カトレア': 'Cynthia & Caitlin',
  'グズマ&ハラ': 'Guzma & Hala',
  'グズマ＆ハラ': 'Guzma & Hala',
  'マオ&スイレン': 'Mallow & Lana',
  'マオ＆スイレン': 'Mallow & Lana',
  'かんこうきゃく': 'Sightseer',
  'からておうの稽古': 'Black Belt',
  'からておう': 'Black Belt',
  '釣り人': 'Fisherman',
  'つりびと': 'Fisherman',
  'やまおとこ': 'Hiker',
  'とりつかい': 'Bird Keeper',
  'TVレポーター': 'TV Reporter',
  'おじょうさま': 'Lady',
  '溶接工': 'Welder',
  'ジャッジマン': 'Judge',
  'ハプウ': 'Hapu',
  'ルザミーネ': 'Lusamine',
  'プルメリ': 'Plumeria',
  'グズマ': 'Guzma',
  'ククイ博士': 'Professor Kukui',
  'リーリエ': 'Lillie',
  'リーリエの決心': "Lillie's Determination",
  'リーリエの全力': "Lillie's Full Force",
  'スイレン': 'Lana',
  'スイレンのお世話': "Lana's Aid",
  'マオ': 'Mallow',
  'カキ': 'Kiawe',
  'イリマ': 'Ilima',
  'ハラ': 'Hala',
  'グラジオ': 'Gladion',
  'グラジオの決戦': "Gladion's Final Battle",
  'ハウ': 'Hau',
  'ライチ': 'Olivia',
  'マーマネ': 'Sophocles',
  'ナヌウ': 'Nanu',
  'マツリカ': 'Mina',
  'カヒリ': 'Kahili',
  'ナツメの暗示': "Sabrina's Suggestion",
  'ナツメのお願い': "Sabrina's Suggestion",
  'ナツメの超能力': "Sabrina's ESP",
  'ナツメ': 'Sabrina',
  'エリカのおもてなし': "Erika's Hospitality",
  'エリカの招待': "Erika's Invitation",
  'エリカ': 'Erika',
  'ルミタン': 'Evelyn',
  'ラニュイ': 'Dana',
  'ルスワール': 'Nita',
  'ラジュルネ': 'Morgan',
  'メイ': 'Rosa',
  'メイのはげまし': "Rosa's Encouragement",
  'シロナ': 'Cynthia',
  'シロナの覇気': "Cynthia's Ambition",
  'カトレア': 'Caitlin',
  'フウロ': 'Skyla',
  'ロイヤルマスク': 'The Masked Royal',
  'アローラの仲間たち': 'Alolan Friends',
  'ガラルの仲間たち': 'Friends in Galar',
  'シンオウの仲間たち': 'Friends in Sinnoh',
  'ヒスイの仲間たち': 'Friends in Hisui',

  // --- Sword & Shield Era Popular & Full Art Trainers ---
  'メロン': 'Melony',
  'ヤロー': 'Milo',
  'ユウリ': 'Gloria',
  'ルリナ': 'Nessa',
  'ソニア': 'Sonia',
  'マリィ': 'Marnie',
  'マリィの練習': "Marnie's Practice",
  'マリィのプライド': "Marnie's Pride",
  'クララ': 'Klara',
  'サイトウ': 'Bea',
  'キバナ': 'Raihan',
  'ダンデ': 'Leon',
  'オニオン': 'Allister',
  'カブ': 'Kabu',
  'ポプラ': 'Opal',
  'ネズ': 'Piers',
  'ローズ': 'Rose',
  'シャクヤ': 'Peonia',
  'ピオニー': 'Peony',
  'ドクター': 'Doctor',
  'アロマなおねえさん': 'Aroma Lady',
  'カレンの信念': "Karen's Conviction",
  'シバ': 'Bruno',
  'フヨウ': 'Phoebe',
  'モミ': 'Cheryl',
  'コルニの気合い': "Korrina's Focus",
  'キクコ': 'Agatha',
  'ズミ': 'Siebold',
  'ボスの指令': "Boss's Orders",
  'カゲツ': 'Sidney',
  'スクールガール': 'Schoolgirl',
  'スクールボーイ': 'Schoolboy',
  'ススキ': 'Iscan',
  'タイサイ': 'Choy',
  'ダンサー': 'Dancer',
  'トウコ': 'Hilda',
  'ネジキ': 'Thorton',
  'ノボリとクダリ': 'Ingo & Emmet',
  'バーネット博士': 'Professor Burnet',
  'ポッドとデントとコーン': 'Chili & Cilan & Cress',
  'マクワ': 'Gordie',
  'マスタード いちげきのかた': 'Single Strike Style Mustard',
  'マスタード れんげきのかた': 'Rapid Strike Style Mustard',
  'ミクリ': 'Wallace',
  'メリッサ': 'Fantina',
  '冒険家の発見': "Adventurer's Discovery",
  '野盗三姉妹': 'Miss Fortune Sisters',
  'アスナ': 'Flannery',
  'ソッドとシルディ': 'Sordward & Shielbert',
  'ヒナツ': 'Arezu',
  'ウォロ': 'Volo',
  'セキ': 'Adaman',
  'カイ': 'Irida',
  'セレナ': 'Serena',
  'スズナ': 'Candice',
  'さぎょういん': 'Worker',
  'ふりそで': 'Furisode Girl',
  'ジンジャー': 'Ginger',

  // --- Scarlet & Violet Era Trainers ---
  'ナンジャモ': 'Iono',
  'ミモザ': 'Miriam',
  'キハダ': 'Dendra',
  'クラベル': 'Clavell',
  'ペパー': 'Arven',
  'ネモ': 'Nemona',
  'グルーシャ': 'Grusha',
  'リップ': 'Tulip',
  'チリ': 'Rika',
  'ポピー': 'Poppy',
  'アオキ': 'Larry',
  'アオキの手際': "Larry's Professionalism",
  'ハッサク': 'Hassel',
  'オモダカ': 'Geeta',
  'ジニア': 'Jacq',
  'コルサ': 'Brassius',
  'セイジ': 'Salvatore',
  'ビワ': 'Eri',
  'カシオペア': 'Penny',
  'ボタン': 'Penny',
  'ゼイユ': 'Carmine',
  'スグリ': 'Kieran',
  'ブライア': 'Briar',
  'タロ': 'Lacey',
  'カキツバタ': 'Drayton',
  'アカマツ': 'Crispin',
  'ネリネ': 'Amarys',
  'サザレ': 'Perrin',
  'オルティガ': 'Ortega',
  'ピーニャ': 'Giacomo',
  'シュウメイ': 'Atticus',
  'メロコ': 'Mela',
  'ベルのまごころ': "Bianca's Devotion",
  'ベル': 'Bianca',
  'カエデ': 'Katy',
  'サーファー': 'Surfer',
  'ヒビキの冒険': "Ethan's Adventure",
  'ヒビキ': 'Ethan',
  'ドラセナ': 'Drasna',
  'アンズの秘技': "Janine's Secret Art",
  'アンズ': 'Janine',
  'クセロシキのたくらみ': "Xerosic's Machinations",
  'クセロシキ': 'Xerosic',
  '探検家の先導': "Explorer's Guidance",
  '暗号マニアの解読': "Ciphermaniac's Codebreaking",
  'シアノ': 'Cyrano',
  'シトロンの機転': "Clemont's Quick Wit",
  'カナリィ': 'Canari',
  'ロケット団のアテナ': "Team Rocket's Ariana",
  'ロケット団のアポロ': "Team Rocket's Archer",
  'ロケット団のラムダ': "Team Rocket's Petrel",
  'ロケット団のランス': "Team Rocket's Proton",
  'ロケット団のレシーバー': "Team Rocket's Receiver",
  'ナナミの手助け': "Daisy's Help",
  'ナナミ': 'Daisy',
  'マサキの転送': "Bill's Transfer",
  'マサキのメンテナンス': "Bill's Maintenance",
  'マサキ': 'Bill',
  'フトゥー博士のシナリオ': "Professor Turo's Scenario",
  'フトゥー': 'Professor Turo',
  'オーリム博士の気迫': "Professor Sada's Vitality",
  'オーリム': 'Professor Sada',
  '博士の研究': "Professor's Research",
  '博士の研究（フトゥー博士）': "Professor's Research (Professor Turo)",
  '博士の研究（オーリム博士）': "Professor's Research (Professor Sada)",

  // --- Black & White / XY / Vintage Trainers ---
  'N': 'N',
  'Nの覚悟': "N's Resolve",
  'Nの筋書き': "N's Plot",
  'Nのポイントアップ': "N's PP Up",
  'アクロマ': 'Colress',
  'アクロマの実験': "Colress's Experiment",
  'アクロマの執念': "Colress's Tenacity",
  'コルニ': 'Korrina',
  'フラダリ': 'Lysandre',
  'アズサ': 'Brigette',
  'センパイとコウハイ': 'Teammates',
  'オダマキ博士の観察': "Professor Birch's Observations",
  'ダイゴ': 'Steven',
  'ダイゴの決断': "Steven's Resolve",
  'ナギ': 'Winona',
  'ミツル': 'Wally',
  'ミツルの思いやり': "Wally's Compassion",
  'オカルトマニア': 'Hex Maniac',
  'こわいおねえさん': 'Delinquent',
  'ポケモンセンターのお姉さん': 'Pokémon Center Lady',
  'プラターヌ博士': 'Professor Sycamore',
  'アララギ博士': 'Professor Juniper',
  'ナナカマド博士': 'Professor Rowan',
  'マグノリア博士': 'Professor Magnolia',
  'ポケモンレンジャー': 'Pokémon Ranger',
  'ニンジャごっこ': 'Ninja Boy',
  'ポケモンごっこ': 'Poké Kid',
  'マキシ': 'Crasher Wake',
  'ナタネ': 'Gardenia',
  'ナタネの活気': "Gardenia's Vigor",
  'ハマナのバックアップ': "Roseanne's Backup",
  'ハマナ': 'Roseanne',
  'ピクニックガール': 'Picnicker',
  'たんぱんこぞう': 'Youngster',
  'ミニスカート': 'Lass',
  'じゅくがえり': 'Schoolboy',
  'ポケモンだいすきクラブ': 'Pokémon Fan Club',
  'コトネ': 'Lyra',
  'シルバー': 'Silver',
  'クリス': 'Kris',
  'ワタル': 'Lance',
  'イブキ': 'Clair',
  'カミツレ': 'Elesa',
  'カミツレのきらめき': "Elesa's Sparkle",
  'アカギ': 'Cyrus',
  'ゲーチス': 'Ghetsis',
  'ルチア': 'Lisia',
  'ルチアのアピール': "Lisia's Appeal"
};

// Pre-sorted dictionary keys by length descending to match longest phrases first
const SORTED_JP_KEYS = Object.keys(JP_TRAINER_NAME_MAP).sort((a, b) => b.length - a.length);

/**
 * Normalizes a card name by removing punctuation, curly quotes, collector numbers, and language tags.
 */
export function normalizeCardName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'") // Convert curly quotes to straight apostrophe
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s*\[(ja|jp|en|ko|zh|op|exclusive|jp exclusive)\]/gi, '')
    .replace(/-\s*\d+[\/\d]*.*$/g, '') // Strip collector suffix like "- 104/094" or "- 196/165"
    .replace(/\(.*?\)/g, '') // Strip parentheses like "(Super Rare)"
    .replace(/[^a-z0-9'\s]/g, '') // Keep alphanumeric and apostrophes
    .trim();
}

/**
 * Robust card name comparison preventing short-string false positives (like 'N' matching 'Underground Expedition').
 */
export function matchesCardName(a: string, b: string): boolean {
  const normA = normalizeCardName(a);
  const normB = normalizeCardName(b);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  // If one name is short (<= 3 chars, like 'N'), only allow exact match to prevent false positives
  if (normA.length <= 3 || normB.length <= 3) return false;
  if (normA.startsWith(normB) || normB.startsWith(normA)) return true;
  return normA.includes(normB) || normB.includes(normA);
}

/**
 * Checks if a rarity or card name indicates a secret/super/ultra/illustration rare (high tier).
 */
export function isHighRarityCard(rarity?: string, name?: string): boolean {
  const r = (rarity || '').toLowerCase();
  const n = (name || '').toLowerCase();
  return (
    r.includes('ultra') ||
    r.includes('super') ||
    r.includes('secret') ||
    r.includes('special') ||
    r.includes('sar') ||
    r.includes('sir') ||
    r.includes('illustration') ||
    r.includes('hyper') ||
    r.includes('shiny rare') ||
    n.includes('super rare') ||
    n.includes('sr') ||
    n.includes('sar') ||
    n.includes('full art') ||
    n.includes('special illustration')
  );
}

/**
 * Verified whitelist of true Japanese-exclusive cards that never had an English equivalent.
 * Only cards satisfying these specific checks may be marked as `isExclusive = true`.
 */
export const TRUE_JP_EXCLUSIVE_IDS = new Set<string>([
  // Extra Battle Day Promos
  'sm-p-395', // Extra Battle Day Acerola (395/SM-P)
  'sm-p-396', // Extra Battle Day Guzma (396/SM-P)
  'sm-p-397', // Extra Battle Day Lillie (397/SM-P)
  'sm-p-398', // Extra Battle Day N (398/SM-P)
  'sm-p-399', // Extra Battle Day Gladion (399/SM-P)
  // Masked Royal Promos
  'sm-p-064',
  'sm-p-100',
  // Alolan Friends Promo
  'sm-p-401',
  // Team Skull Grunt Promo
  'sm-p-013',
  // Tag All Stars Exclusive Full Arts (Misty & Lorelei 191, Sightseer 192)
  'sm12a-191',
  'sm12a-192',
  // Post Office / Stamp Box Promos
  's-p-226',
  's-p-227'
]);

export function isTrueJapaneseExclusive(card: { id?: string; name?: string; localId?: string; set?: { id?: string } }): boolean {
  if (!card) return false;
  const idNorm = (card.id || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const localId = (card.localId || '').trim();
  const nameLower = (card.name || '').toLowerCase();

  // 1. Direct ID match
  if (TRUE_JP_EXCLUSIVE_IDS.has(idNorm)) return true;

  // 2. Extra Battle Day or Masked Royal or Alolan Friends
  if (nameLower.includes('alolan friends') || nameLower.includes('アローラの仲間たち')) return true;
  if (nameLower.includes('masked royal') || nameLower.includes('ロイヤルマスク')) return true;

  // 3. Tag All Stars exclusive Full Arts (Misty & Lorelei 191, Sightseer 192)
  const setIdNorm = (card.set?.id || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (idNorm.includes('sm12a') || setIdNorm.includes('sm12a')) {
    if (localId === '191' || localId === '192') return true;
  }

  // 4. Extra Battle Day promo numbers
  if (idNorm.includes('sm-p') || idNorm.includes('smp')) {
    if (['395', '396', '397', '398', '399', '401', '064', '100'].includes(localId)) return true;
  }

  return false;
}

/**
 * Translates a Japanese card name to English using dictionary matches or partial matches.
 */
export function translateJapaneseCardName(rawJpName: string): { englishName: string; isTranslated: boolean } {
  if (!rawJpName) return { englishName: '', isTranslated: false };
  const clean = rawJpName.replace(/\s*\[(JA|JP)\]/gi, '').trim();

  // 1. Direct exact dictionary match
  if (JP_TRAINER_NAME_MAP[clean]) {
    return { englishName: JP_TRAINER_NAME_MAP[clean], isTranslated: true };
  }

  // 2. Partial prefix / substring match for Japanese text (longer phrases first)
  for (const jpKey of SORTED_JP_KEYS) {
    if (clean.includes(jpKey) || jpKey.includes(clean)) {
      return { englishName: JP_TRAINER_NAME_MAP[jpKey], isTranslated: true };
    }
  }

  // 3. Already in English / Romaji with suffixes (e.g., "Misty's Favor - 104/094 (Super Rare)")
  const normalized = normalizeCardName(clean);
  if (normalized && !/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(clean)) {
    return { englishName: normalized, isTranslated: false };
  }

  return { englishName: clean, isTranslated: false };
}

/**
 * Checks whether a Japanese card already has an English counterpart in the English card results list.
 * Uses smart normalized matching and rarity-tier alignment so Super Rare maps to Ultra Rare / Full Art.
 */
export function findEnglishCounterpart(
  jpCard: SearchCardResult,
  enCards: SearchCardResult[]
): SearchCardResult | null {
  const { englishName } = translateJapaneseCardName(jpCard.name);
  if (!englishName) return null;

  const jpIsHigh = isHighRarityCard(jpCard.rarity, jpCard.name);

  // Find all matching English cards by name
  const matches: SearchCardResult[] = [];
  for (const enCard of enCards) {
    if (matchesCardName(enCard.name, englishName)) {
      matches.push(enCard);
    }
  }

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  // If multiple versions exist (e.g. regular uncommon vs full art ultra rare), match matching rarity tier
  const tierMatch = matches.find((en) => isHighRarityCard(en.rarity, en.name) === jpIsHigh);
  return tierMatch || matches[0];
}
