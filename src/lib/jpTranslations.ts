import { SearchCardResult } from './types';

// Comprehensive dictionary mapping Japanese card & trainer names to their official English releases
export const JP_TRAINER_NAME_MAP: Record<string, string> = {
  // Sword & Shield / Scarlet & Violet Popular Trainers
  'メロン': 'Melony',
  'ヤロー': 'Milo',
  'ユウリ': 'Gloria',
  'ルリナ': 'Nessa',
  'エリカ': 'Erika',
  'エリカの招待': "Erika's Invitation",
  'ホミカ': 'Roxie',
  'ホミカの演奏': 'Roxie',
  'サカキ': 'Giovanni',
  'サカキのカリスマ': "Giovanni's Charisma",
  'サカキの追跡': "Giovanni's Scheme",
  'マツリカ': 'Mina',
  'ナナミ': 'Daisy',
  'ナナミの手助け': "Daisy's Help",
  'ヤーコン': 'Clay',
  'マサキ': 'Bill',
  'マサキの転送': "Bill's Transfer",
  '溶接工': 'Welder',
  'セイジ': 'Salvatore',
  'ビワ': 'Eri',
  'カシオペア': 'Penny',
  'ボタン': 'Penny',
  'マツバ': 'Morty',
  'マツバの確信': "Morty's Conviction",
  'カスミ': 'Misty',
  'カスミのおねがい': "Misty's Favor",
  'カスミのやる気': "Misty's Determination",
  'ナンジャモ': 'Iono',
  'リーリエ': 'Lillie',
  'リーリエの決心': "Lillie's Determination",
  'リーリエの全力': "Lillie's Full Force",
  'アセロラ': 'Acerola',
  'アセロラのいたずら': "Acerola's Premonition",
  'アセロラの予感': "Acerola's Premonition",
  'ミツル': 'Wally',
  'ミツルの思いやり': "Wally's Compassion",
  'マチス': 'Lt. Surge',
  'マチスの取引': "Lt. Surge's Deal",
  'マチスの戦略': "Lt. Surge's Strategy",
  'シロナ': 'Cynthia',
  'シロナの覇気': "Cynthia's Ambition",
  'フウロ': 'Skyla',
  'カトレア': 'Caitlin',
  'クララ': 'Klara',
  'サイトウ': 'Bea',
  'キバナ': 'Raihan',
  'ダンデ': 'Leon',
  'オニオン': 'Allister',
  'コルニ': 'Korrina',
  'コルニの気合い': "Korrina's Focus",
  'スイレン': 'Lana',
  'スイレンのお世話': "Lana's Aid",
  'マオ': 'Mallow',
  'マオ＆スイレン': 'Mallow & Lana',
  'セレナ': 'Serena',
  'カイ': 'Irida',
  'セキ': 'Adaman',
  'ウォロ': 'Volo',
  'ペパー': 'Arven',
  'ネモ': 'Nemona',
  'グルーシャ': 'Grusha',
  'リップ': 'Tulip',
  'チリ': 'Rika',
  'ポピー': 'Poppy',
  'アオキ': 'Larry',
  'ハッサク': 'Hassel',
  'オモダカ': 'Geeta',
  'フトゥー': 'Professor Turo',
  'フトゥー博士のシナリオ': "Professor Turo's Scenario",
  'オーリム': 'Professor Sada',
  'オーリム博士の気迫': "Professor Sada's Vitality",
  'ゼイユ': 'Carmine',
  'スグリ': 'Kieran',
  'ブライア': 'Briar',
  'タロ': 'Lacey',
  'カキツバタ': 'Drayton',
  'アカマツ': 'Crispin',
  'ネリネ': 'Amarys',
  'スズナ': 'Candice',
  'さぎょういん': 'Worker',
  'ふりそで': 'Furisode Girl',
  'おじょうさま': 'Lady',
  'ツツジ': 'Roxanne',
  'ナタネ': 'Gardenia',
  'ナタネの活気': "Gardenia's Vigor",
  'ハマナ': 'Roseanne',
  'ハマナのバックアップ': "Roseanne's Backup",
  'ドクター': 'Doctor',
  'アロマなおねえさん': 'Aroma Lady',
  'カレン': 'Karen',
  'カレンの信念': "Karen's Conviction",
  'シバ': 'Bruno',
  'フヨウ': 'Phoebe',
  'モミ': 'Cheryl',
  'ピクニックガール': 'Picnicker',
  'たんぱんこぞう': 'Youngster',
  'やまおとこ': 'Hiker',
  'ジャッジマン': 'Judge',
  'ボスの指令': "Boss's Orders",
  'アカギ': 'Cyrus',
  'ゲーチス': 'Ghetsis',
  'フラダリ': 'Lysandre',
  'グズマ': 'Guzma',
  'グズマ＆ハラ': 'Guzma & Hala',
  'シロナ＆カトレア': 'Cynthia & Caitlin',
  'イツキ': 'Will',
  'レッド': 'Red',
  'レッドの挑戦': "Red's Challenge",
  'ブルー': 'Blue',
  'ブルーの探索': "Blue's Tactics",
  'グリーン': 'Green',
  'グリーンの戦略': "Green's Exploration",
  'かんこうきゃく': 'Sightseer',
  'ルチア': 'Lisia',
  'ルチアのアピール': "Lisia's Appeal",
  'メイ': 'Rosa',
  'N': 'N',
  'センパイとコウハイ': 'Teammates',
  'プラターヌ博士': 'Professor Sycamore',
  'アララギ博士': 'Professor Juniper',
  'オオキド博士': 'Professor Oak',
  'ウツギ博士': 'Professor Elm',
  'ナナカマド博士': 'Professor Rowan',
  'ククイ博士': 'Professor Kukui',
  'マグノリア博士': 'Professor Magnolia',
  'ソニア': 'Sonia',
  'マリィ': 'Marnie',
  'マリィの練習': "Marnie's Practice",
  'マリィのプライド': "Marnie's Pride",
  'ナツメ': 'Sabrina',
  'ナツメの暗示': "Sabrina's Suggestion",
  'ナツメの超能力': "Sabrina's ESP",
  'エリカのおもてなし': "Erika's Hospitality",
  'カミツレ': 'Elesa',
  'カミツレのきらめき': "Elesa's Sparkle",
  'アクロマ': 'Colress',
  'アクロマの実験': "Colress's Experiment",
  'ミモザ': 'Miriam',
  'キハダ': 'Dendra',
  'クラベル': 'Clavell',
  'ヒナツ': 'Arezu',
  'シャクヤ': 'Peonia',
  'カブ': 'Kabu',
  'ポプラ': 'Opal',
  'ネズ': 'Piers',
  'ローズ': 'Rose',
  'ジニア': 'Jacq',
  'コルサ': 'Brassius',
  '博士の研究': "Professor's Research",
  'ビルのテレポーター': "Bill's Teleporter",
  'アクア団の幹部': 'Team Aqua Admin',
  'アクア団のしたっぱ': 'Team Aqua Grunt',
  'マグマ団の幹部': 'Team Magma Admin',
  'マグマ団のしたっぱ': 'Team Magma Grunt',
  'ロケット団のしたっぱ': 'Team Rocket Grunt',
  'ロケット団の幹部': 'Team Rocket Admin',
  'ロケットのスニーク攻撃': "Rocket's Sneak Attack",
  'ハイパーデボルブスプレー': 'Hyper Devolution Spray',
  'ポケモン再送信': 'Pokémon Trader',
  '新しいpokedex': 'New Pokédex',
  'とりつかい': 'Bird Keeper',
  'つりびと': 'Fisherman',
  'ミニスカート': 'Lass',
  'じゅくがえり': 'Schoolboy',
  'サーファー': 'Surfer',
  'ヒビキの冒険': "Ethan's Adventure",
  'ヒビキ': 'Ethan',
  'ドラセナ': 'Drasna',
  'カキ': 'Kiawe',
  'イリマ': 'Ilima',
  'ハラ': 'Hala',
  'グラジオ': 'Gladion',
  'ハウ': 'Hau',
  'プルメリ': 'Plumeria',
  'ライチ': 'Olivia',
  'ルザミーネ': 'Lusamine',
  'マーマネ': 'Sophocles',
  'ナヌウ': 'Nanu',
  'サザレ': 'Perrin',
  'オルティガ': 'Ortega',
  'ピーニャ': 'Giacomo',
  'シュウメイ': 'Atticus',
  'メロコ': 'Mela',
  'コトネ': 'Lyra',
  'シルバー': 'Silver',
  'クリス': 'Kris',
  'ダイゴ': 'Steven',
  'ワタル': 'Lance',
  'イブキ': 'Clair',
  'アンズの秘技': "Janine's Secret Art",
  'アンズ': 'Janine',
  'クセロシキのたくらみ': "Xerosic's Machinations",
  'クセロシキ': 'Xerosic',
  '探検家の先導': "Explorer's Guidance",
  '暗号マニアの解読': "Ciphermaniac's Codebreaking",
  'ベルのまごころ': "Bianca's Devotion",
  'ベル': 'Bianca',
  'カエデ': 'Katy',
  'ロケット団のアテナ': "Team Rocket's Ariana",
  'ロケット団のアポロ': "Team Rocket's Archer",
  'ロケット団のラムダ': "Team Rocket's Petrel",
  'ロケット団のランス': "Team Rocket's Proton"
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
    n.includes('super rare') ||
    n.includes('sr') ||
    n.includes('sar') ||
    n.includes('full art') ||
    n.includes('special illustration')
  );
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
  if (normalized) {
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

  const targetNorm = normalizeCardName(englishName);
  if (!targetNorm) return null;

  const jpIsHigh = isHighRarityCard(jpCard.rarity, jpCard.name);

  // Find all matching English cards by name
  const matches: SearchCardResult[] = [];
  for (const enCard of enCards) {
    const enNorm = normalizeCardName(enCard.name);
    if (!enNorm) continue;

    if (enNorm === targetNorm || enNorm.includes(targetNorm) || targetNorm.includes(enNorm)) {
      matches.push(enCard);
    }
  }

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  // If multiple versions exist (e.g. regular uncommon vs full art ultra rare), match matching rarity tier
  const tierMatch = matches.find((en) => isHighRarityCard(en.rarity, en.name) === jpIsHigh);
  return tierMatch || matches[0];
}

