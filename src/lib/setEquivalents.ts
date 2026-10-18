// Comprehensive mapping between Japanese/Asian sets and their English equivalent sets.
// Allows cross-language deduplication, counterpart linking, and English-only set naming.

export interface SetEquivalent {
  jpCode: string;
  jpNameEn: string;
  jpNameKana?: string;
  enSetName: string;
  era: 'me' | 'sv' | 'swsh' | 'sm' | 'xy' | 'bw' | 'classic';
}

export const SET_EQUIVALENTS: SetEquivalent[] = [
  // --- Scarlet & Violet Era ---
  { jpCode: 'sv1S', jpNameEn: 'Scarlet ex', jpNameKana: 'スカーレットex', enSetName: 'Scarlet & Violet', era: 'sv' },
  { jpCode: 'sv1V', jpNameEn: 'Violet ex', jpNameKana: 'バイオレットex', enSetName: 'Scarlet & Violet', era: 'sv' },
  { jpCode: 'sv1a', jpNameEn: 'Triplet Beat', jpNameKana: 'トリプレットビート', enSetName: 'Paldea Evolved', era: 'sv' },
  { jpCode: 'sv2D', jpNameEn: 'Clay Burst', jpNameKana: 'クレイバースト', enSetName: 'Paldea Evolved', era: 'sv' },
  { jpCode: 'sv2P', jpNameEn: 'Snow Hazard', jpNameKana: 'スノーハザード', enSetName: 'Paldea Evolved', era: 'sv' },
  { jpCode: 'sv2a', jpNameEn: 'Pokemon Card 151', jpNameKana: 'ポケモンカード151', enSetName: '151', era: 'sv' },
  { jpCode: 'sv3', jpNameEn: 'Ruler of the Black Flame', jpNameKana: '黒炎の支配者', enSetName: 'Obsidian Flames', era: 'sv' },
  { jpCode: 'sv3a', jpNameEn: 'Raging Surf', jpNameKana: 'レイジングサーフ', enSetName: 'Paradox Rift', era: 'sv' },
  { jpCode: 'sv4K', jpNameEn: 'Ancient Roar', jpNameKana: '古代の咆哮', enSetName: 'Paradox Rift', era: 'sv' },
  { jpCode: 'sv4M', jpNameEn: 'Future Flash', jpNameKana: '未来の一閃', enSetName: 'Paradox Rift', era: 'sv' },
  { jpCode: 'sv4a', jpNameEn: 'Shiny Treasure ex', jpNameKana: 'シャイニートレジャーex', enSetName: 'Paldean Fates', era: 'sv' },
  { jpCode: 'sv5K', jpNameEn: 'Wild Force', jpNameKana: 'ワイルドフォース', enSetName: 'Temporal Forces', era: 'sv' },
  { jpCode: 'sv5M', jpNameEn: 'Cyber Judge', jpNameKana: 'サイバージャッジ', enSetName: 'Temporal Forces', era: 'sv' },
  { jpCode: 'sv5a', jpNameEn: 'Crimson Haze', jpNameKana: 'クリムゾンヘイズ', enSetName: 'Twilight Masquerade', era: 'sv' },
  { jpCode: 'sv6', jpNameEn: 'Mask of Change', jpNameKana: '変幻の仮面', enSetName: 'Twilight Masquerade', era: 'sv' },
  { jpCode: 'sv6a', jpNameEn: 'Night Wanderer', jpNameKana: 'ナイトワンダラー', enSetName: 'Shrouded Fable', era: 'sv' },
  { jpCode: 'sv7', jpNameEn: 'Stellar Miracle', jpNameKana: 'ステラミラクル', enSetName: 'Stellar Crown', era: 'sv' },
  { jpCode: 'sv7a', jpNameEn: 'Paradise Dragona', jpNameKana: '楽園ドラゴーナ', enSetName: 'Surging Sparks', era: 'sv' },
  { jpCode: 'sv8', jpNameEn: 'Supercharged Breaker', jpNameKana: '超電ブレイカー', enSetName: 'Surging Sparks', era: 'sv' },
  { jpCode: 'sv8a', jpNameEn: 'Terastal Fest ex', jpNameKana: 'テラスタルフェスex', enSetName: 'Prismatic Evolutions', era: 'sv' },
  { jpCode: 'sv9', jpNameEn: 'Battle Partners', jpNameKana: 'バトルパートナーズ', enSetName: 'Journey Together', era: 'sv' },
  { jpCode: 'sv9a', jpNameEn: 'Heat Wave Arena', jpNameKana: '熱風のアリーナ', enSetName: 'Journey Together', era: 'sv' },
  { jpCode: 'sv-p', jpNameEn: 'SV-P Promotional Cards', jpNameKana: 'プロモカードパック', enSetName: 'Scarlet & Violet Promos', era: 'sv' },

  // --- Sword & Shield Era ---
  { jpCode: 's1W', jpNameEn: 'Sword', jpNameKana: 'ソード', enSetName: 'Sword & Shield', era: 'swsh' },
  { jpCode: 's1H', jpNameEn: 'Shield', jpNameKana: 'シールド', enSetName: 'Sword & Shield', era: 'swsh' },
  { jpCode: 's1a', jpNameEn: 'VMAX Rising', jpNameKana: 'VMAXライジング', enSetName: 'Rebel Clash', era: 'swsh' },
  { jpCode: 's2', jpNameEn: 'Rebellion Crash', jpNameKana: '反逆クラッシュ', enSetName: 'Rebel Clash', era: 'swsh' },
  { jpCode: 's2a', jpNameEn: 'Explosive Walker', jpNameKana: '爆炎ウォーカー', enSetName: 'Darkness Ablaze', era: 'swsh' },
  { jpCode: 's3', jpNameEn: 'Infinity Zone', jpNameKana: 'ムゲンゾーン', enSetName: 'Darkness Ablaze', era: 'swsh' },
  { jpCode: 's3a', jpNameEn: 'Legendary Heartbeat', jpNameKana: '伝説の鼓動', enSetName: 'Vivid Voltage', era: 'swsh' },
  { jpCode: 's4', jpNameEn: 'Amazing Volt Tackle', jpNameKana: '仰天のボルテッカー', enSetName: 'Vivid Voltage', era: 'swsh' },
  { jpCode: 's4a', jpNameEn: 'Shiny Star V', jpNameKana: 'シャイニースターV', enSetName: 'Shining Fates', era: 'swsh' },
  { jpCode: 's5I', jpNameEn: 'Single Strike Master', jpNameKana: '一撃マスター', enSetName: 'Battle Styles', era: 'swsh' },
  { jpCode: 's5R', jpNameEn: 'Rapid Strike Master', jpNameKana: '連撃マスター', enSetName: 'Battle Styles', era: 'swsh' },
  { jpCode: 's5a', jpNameEn: 'Peerless Fighters', jpNameKana: '双璧のファイター', enSetName: 'Chilling Reign', era: 'swsh' },
  { jpCode: 's6H', jpNameEn: 'Silver Lance', jpNameKana: '白銀のランス', enSetName: 'Chilling Reign', era: 'swsh' },
  { jpCode: 's6K', jpNameEn: 'Jet-Black Spirit', jpNameKana: '漆黒のガイスト', enSetName: 'Chilling Reign', era: 'swsh' },
  { jpCode: 's7D', jpNameEn: 'Skystream', jpNameKana: '蒼空ストリーム', enSetName: 'Evolving Skies', era: 'swsh' },
  { jpCode: 's7R', jpNameEn: 'Towering Perfection', jpNameKana: '摩天パーフェクト', enSetName: 'Evolving Skies', era: 'swsh' },
  { jpCode: 's6a', jpNameEn: 'Eevee Heroes', jpNameKana: 'イーブイヒーローズ', enSetName: 'Evolving Skies', era: 'swsh' },
  { jpCode: 's8', jpNameEn: 'Fusion Arts', jpNameKana: 'フュージョンアーツ', enSetName: 'Fusion Strike', era: 'swsh' },
  { jpCode: 's8a', jpNameEn: '25th Anniversary Collection', jpNameKana: '25th アニバーサリー', enSetName: 'Celebrations', era: 'swsh' },
  { jpCode: 's8b', jpNameEn: 'VMAX Climax', jpNameKana: 'VMAXクライマックス', enSetName: 'Brilliant Stars (Trainer Gallery)', era: 'swsh' },
  { jpCode: 's9', jpNameEn: 'Star Birth', jpNameKana: 'スターバース', enSetName: 'Brilliant Stars', era: 'swsh' },
  { jpCode: 's9a', jpNameEn: 'Battle Region', jpNameKana: 'バトルリージョン', enSetName: 'Astral Radiance', era: 'swsh' },
  { jpCode: 's10D', jpNameEn: 'Time Gazer', jpNameKana: 'タイムゲイザー', enSetName: 'Astral Radiance', era: 'swsh' },
  { jpCode: 's10P', jpNameEn: 'Space Juggler', jpNameKana: 'スペースジャグラー', enSetName: 'Astral Radiance', era: 'swsh' },
  { jpCode: 's10a', jpNameEn: 'Dark Phantasma', jpNameKana: 'ダークファンタズマ', enSetName: 'Lost Origin', era: 'swsh' },
  { jpCode: 's10b', jpNameEn: 'Pokemon GO', jpNameKana: 'Pokémon GO', enSetName: 'Pokemon GO', era: 'swsh' },
  { jpCode: 's11', jpNameEn: 'Lost Abyss', jpNameKana: 'ロストアビス', enSetName: 'Lost Origin', era: 'swsh' },
  { jpCode: 's11a', jpNameEn: 'Incandescent Arcana', jpNameKana: '白熱のアルカナ', enSetName: 'Silver Tempest', era: 'swsh' },
  { jpCode: 's12', jpNameEn: 'Paradigm Trigger', jpNameKana: 'パラダイムトリガー', enSetName: 'Silver Tempest', era: 'swsh' },
  { jpCode: 's12a', jpNameEn: 'VSTAR Universe', jpNameKana: 'VSTARユニバース', enSetName: 'Crown Zenith', era: 'swsh' },
  { jpCode: 's-p', jpNameEn: 'S-P Promotional Cards', jpNameKana: 'S-P プロモ', enSetName: 'Sword & Shield Promos', era: 'swsh' },

  // --- Sun & Moon Era ---
  { jpCode: 'sm1S', jpNameEn: 'Collection Sun', jpNameKana: 'コレクション サン', enSetName: 'Sun & Moon', era: 'sm' },
  { jpCode: 'sm1M', jpNameEn: 'Collection Moon', jpNameKana: 'コレクション ムーン', enSetName: 'Sun & Moon', era: 'sm' },
  { jpCode: 'sm1+', jpNameEn: 'Strengthening Expansion Sun & Moon', jpNameKana: 'サン＆ムーン', enSetName: 'Guardians Rising', era: 'sm' },
  { jpCode: 'sm2K', jpNameEn: 'Islands Awaiting You', jpNameKana: 'キミを待つ島々', enSetName: 'Guardians Rising', era: 'sm' },
  { jpCode: 'sm2L', jpNameEn: 'Alolan Moonlight', jpNameKana: 'アローラの月光', enSetName: 'Guardians Rising', era: 'sm' },
  { jpCode: 'sm3H', jpNameEn: 'Fighting Rainbow', jpNameKana: '闘う虹を見たか', enSetName: 'Burning Shadows', era: 'sm' },
  { jpCode: 'sm3N', jpNameEn: 'Darkness Consumes Light', jpNameKana: '光を喰らう闇', enSetName: 'Burning Shadows', era: 'sm' },
  { jpCode: 'sm3+', jpNameEn: 'Shining Legends', jpNameKana: 'ひかる伝説', enSetName: 'Shining Legends', era: 'sm' },
  { jpCode: 'sm4S', jpNameEn: 'Awakened Heroes', jpNameKana: '覚醒の勇者', enSetName: 'Crimson Invasion', era: 'sm' },
  { jpCode: 'sm4A', jpNameEn: 'Ultradimensional Beasts', jpNameKana: '超次元の暴獣', enSetName: 'Crimson Invasion', era: 'sm' },
  { jpCode: 'sm4+', jpNameEn: 'GX Battle Boost', jpNameKana: 'GXバトルブースト', enSetName: 'Ultra Prism', era: 'sm' },
  { jpCode: 'sm5S', jpNameEn: 'Ultra Sun', jpNameKana: 'ウルトラサン', enSetName: 'Ultra Prism', era: 'sm' },
  { jpCode: 'sm5M', jpNameEn: 'Ultra Moon', jpNameKana: 'ウルトラムーン', enSetName: 'Ultra Prism', era: 'sm' },
  { jpCode: 'sm5+', jpNameEn: 'Ultra Force', jpNameKana: 'ウルトラフォース', enSetName: 'Forbidden Light', era: 'sm' },
  { jpCode: 'sm6', jpNameEn: 'Forbidden Light', jpNameKana: '禁断の光', enSetName: 'Forbidden Light', era: 'sm' },
  { jpCode: 'sm6a', jpNameEn: 'Dragon Storm', jpNameKana: 'ドラゴンストーム', enSetName: 'Dragon Majesty', era: 'sm' },
  { jpCode: 'sm6b', jpNameEn: 'Champion Road', jpNameKana: 'チャンピオンロード', enSetName: 'Celestial Storm', era: 'sm' },
  { jpCode: 'sm7', jpNameEn: 'Charisma of the Wrecked Sky', jpNameKana: '裂空のカリスマ', enSetName: 'Celestial Storm', era: 'sm' },
  { jpCode: 'sm7a', jpNameEn: 'Thunderclap Spark', jpNameKana: '迅雷スパーク', enSetName: 'Lost Thunder', era: 'sm' },
  { jpCode: 'sm7b', jpNameEn: 'Fairy Rise', jpNameKana: 'フェアリーライズ', enSetName: 'Lost Thunder', era: 'sm' },
  { jpCode: 'sm8', jpNameEn: 'Super-Burst Impact', jpNameKana: '超爆インパクト', enSetName: 'Lost Thunder', era: 'sm' },
  { jpCode: 'sm8a', jpNameEn: 'Dark Order', jpNameKana: 'ダークオーダー', enSetName: 'Team Up', era: 'sm' },
  { jpCode: 'sm8b', jpNameEn: 'GX Ultra Shiny', jpNameKana: 'GXウルトラシャイニー', enSetName: 'Hidden Fates', era: 'sm' },
  { jpCode: 'sm9', jpNameEn: 'Tag Bolt', jpNameKana: 'タッグボルト', enSetName: 'Team Up', era: 'sm' },
  { jpCode: 'sm9a', jpNameEn: 'Night Unison', jpNameKana: 'ナイトユニゾン', enSetName: 'Unbroken Bonds', era: 'sm' },
  { jpCode: 'sm9b', jpNameEn: 'Full Metal Wall', jpNameKana: 'フルメタルウォール', enSetName: 'Unbroken Bonds', era: 'sm' },
  { jpCode: 'sm10', jpNameEn: 'Double Blaze', jpNameKana: 'ダブルブレイズ', enSetName: 'Unbroken Bonds', era: 'sm' },
  { jpCode: 'sm10a', jpNameEn: 'GG End', jpNameKana: 'ジージーエンド', enSetName: 'Unified Minds', era: 'sm' },
  { jpCode: 'sm10b', jpNameEn: 'Sky Legend', jpNameKana: 'スカイレジェンド', enSetName: 'Unified Minds', era: 'sm' },
  { jpCode: 'sm11', jpNameEn: 'Miracle Twin', jpNameKana: 'ミラクルツイン', enSetName: 'Unified Minds', era: 'sm' },
  { jpCode: 'sm11a', jpNameEn: 'Remix Bout', jpNameKana: 'リミックスバウト', enSetName: 'Cosmic Eclipse', era: 'sm' },
  { jpCode: 'sm11b', jpNameEn: 'Dream League', jpNameKana: 'ドリームリーグ', enSetName: 'Cosmic Eclipse', era: 'sm' },
  { jpCode: 'sm12', jpNameEn: 'Alter Genesis', jpNameKana: 'オルタージェネシス', enSetName: 'Cosmic Eclipse', era: 'sm' },
  { jpCode: 'sm12a', jpNameEn: 'Tag All Stars', jpNameKana: 'タッグオールスターズ', enSetName: 'Tag All Stars (SM12a)', era: 'sm' },
  { jpCode: 'sm-p', jpNameEn: 'SM-P Promotional Cards', jpNameKana: 'SM-P プロモ', enSetName: 'Sun & Moon Promos', era: 'sm' }
];

// Lookup dictionaries for O(1) performance
const CODE_MAP = new Map<string, SetEquivalent>();
const NAME_MAP = new Map<string, SetEquivalent>();

for (const eq of SET_EQUIVALENTS) {
  CODE_MAP.set(eq.jpCode.toLowerCase(), eq);
  NAME_MAP.set(eq.jpNameEn.toLowerCase(), eq);
  if (eq.jpNameKana) {
    NAME_MAP.set(eq.jpNameKana.toLowerCase(), eq);
  }
}

/**
 * Given a Japanese/Asian set code or raw set name, returns an English-only, cleaned set name.
 * NEVER returns raw Japanese, Chinese, or Korean text.
 */
export function getEnglishSetName(setIdOrName?: string): string {
  if (!setIdOrName) return 'Expansion';
  const clean = setIdOrName.trim();
  const lower = clean.toLowerCase();

  // 1. Direct code lookup (e.g. 'sv6a' or 'sm12a')
  const byCode = CODE_MAP.get(lower);
  if (byCode) {
    return `${byCode.enSetName} (${byCode.jpNameEn})`;
  }

  // 2. Direct name lookup
  const byName = NAME_MAP.get(lower);
  if (byName) {
    return `${byName.enSetName} (${byName.jpNameEn})`;
  }

  // 3. Partial check across definitions
  for (const eq of SET_EQUIVALENTS) {
    if (lower.includes(eq.jpCode.toLowerCase()) || lower.includes(eq.jpNameEn.toLowerCase())) {
      return `${eq.enSetName} (${eq.jpNameEn})`;
    }
    if (eq.jpNameKana && lower.includes(eq.jpNameKana.toLowerCase())) {
      return `${eq.enSetName} (${eq.jpNameEn})`;
    }
  }

  // 4. Clean Chinese set names
  if (lower.includes('九彩') || lower.includes('gem pack')) return 'Gem Pack (Simplified Chinese)';
  if (lower.includes('勇猛') || lower.includes('brave')) return 'Brave Heroes (Simplified Chinese)';
  if (lower.includes('横空') || lower.includes('crossing')) return 'Crossing the Sky (Simplified Chinese)';
  if (lower.includes('极巨') || lower.includes('vmax battle')) return 'VMAX Battle (Simplified Chinese)';
  if (lower.includes('台北') || lower.includes('taipei')) return 'Pokemon Center Taipei';

  // 5. If it still contains non-ASCII characters (Japanese/Chinese/Korean), strip them safely
  if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\uac00-\ud7af]/.test(clean)) {
    // Return a clean fallback name based on code prefix
    if (lower.startsWith('sv')) return 'Scarlet & Violet Series';
    if (lower.startsWith('swsh') || lower.startsWith('s')) return 'Sword & Shield Series';
    if (lower.startsWith('sm')) return 'Sun & Moon Series';
    if (lower.startsWith('xy')) return 'XY Series';
    if (lower.startsWith('bw')) return 'Black & White Series';
    return 'Pokémon TCG Expansion';
  }

  return clean;
}

/**
 * Checks whether an Asian card set corresponds to an English card set.
 * E.g., 'sv6a' (Night Wanderer) corresponds to 'Shrouded Fable'.
 * E.g., 'sv5M' (Cyber Judge) corresponds to 'Temporal Forces'.
 * E.g., 'sv7a' (Paradise Dragona) / 'sv8' (Supercharged Breaker) correspond to 'Surging Sparks'.
 */
export function areSetsEquivalent(asianSetIdOrName?: string, enSetName?: string): boolean {
  if (!asianSetIdOrName || !enSetName) return false;
  const aLower = asianSetIdOrName.toLowerCase();
  const eLower = enSetName.toLowerCase();

  // If already identical
  if (aLower === eLower || aLower.includes(eLower) || eLower.includes(aLower)) {
    return true;
  }

  // Find equivalent mapping for the Asian set
  for (const eq of SET_EQUIVALENTS) {
    const matchesAsian =
      aLower.includes(eq.jpCode.toLowerCase()) ||
      aLower.includes(eq.jpNameEn.toLowerCase()) ||
      (eq.jpNameKana && aLower.includes(eq.jpNameKana.toLowerCase()));

    if (matchesAsian) {
      const enTarget = eq.enSetName.toLowerCase();
      if (eLower.includes(enTarget) || enTarget.includes(eLower)) {
        return true;
      }
    }
  }

  return false;
}
