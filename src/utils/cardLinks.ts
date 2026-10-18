import { CardItem, SearchCardResult } from '@/lib/types';

// Map human-readable grades/conditions to TCGPlayer Condition URL query parameter
export function getTcgplayerConditionParam(grade?: string): string {
  if (!grade) return 'Near+Mint';
  const g = grade.toLowerCase().trim();
  if (g.includes('lightly played') || g === 'lp') return 'Lightly+Played';
  if (g.includes('moderately played') || g === 'mp') return 'Moderately+Played';
  if (g.includes('heavily played') || g === 'hp') return 'Heavily+Played';
  if (g.includes('damaged') || g === 'dmg') return 'Damaged';
  if (g.includes('near mint') || g === 'nm' || g.includes('raw') || g.includes('ungraded')) return 'Near+Mint';
  // Graded slabs do not have raw condition filters on TCGPlayer, fallback to Near Mint
  return 'Near+Mint';
}

// Clean card name for search URLs (strips language brackets like [JA], [EN], [JP])
export function getCleanCardName(name: string): string {
  if (!name) return '';
  return name.replace(/\s*\[(JA|EN|KO|ZH|OP|JP)\]/gi, '').trim();
}

// Check if card is Japanese
export function isJapaneseCard(card: { game?: string; language?: string; name?: string }): boolean {
  return (
    card.game === 'pokemon-japan' ||
    card.language === 'ja' ||
    (card.name ? /\[(JA|JP)\]/i.test(card.name) : false)
  );
}

// Prominent Japanese cards mapped to direct TCGPlayer product IDs
const JAPANESE_TCGPLAYER_IDS: Record<string, string> = {
  'skyla': '602068', // XY-P Promo Skyla (164/XY-P)
};

// Formats a dynamic TCGPlayer URL ensuring correct Language and Condition parameters
export function formatTcgplayerLink(card: CardItem | SearchCardResult): string {
  const isJa = isJapaneseCard(card);
  const cleanName = getCleanCardName(card.name);
  const conditionParam = getTcgplayerConditionParam((card as CardItem).grade);

  // If Japanese card:
  if (isJa) {
    // 1. Direct Japanese ID match
    const directJaId = JAPANESE_TCGPLAYER_IDS[cleanName.toLowerCase()];
    if (directJaId) {
      return `https://www.tcgplayer.com/product/${directJaId}?page=1&Language=all&Condition=${conditionParam}`;
    }

    // 2. Check if card has an existing Japanese link with product ID
    const existingLink = (card as CardItem).best_link || '';
    if (existingLink.includes('pokemon-japan') && existingLink.includes('/product/')) {
      const match = existingLink.match(/\/product\/(\d+)/);
      if (match && match[1]) {
        return `https://www.tcgplayer.com/product/${match[1]}?page=1&Language=all&Condition=${conditionParam}`;
      }
    }

    // 3. Fallback: Search TCGPlayer Japanese catalog
    return `https://www.tcgplayer.com/search/pokemon-japan/product?productLineName=pokemon-japan&q=${encodeURIComponent(cleanName)}&view=grid&Condition=${conditionParam}`;
  }

  // If English card:
  const tcgId = (card as SearchCardResult).tcgplayerId || (card as CardItem).card_id;
  const numericId = tcgId && /^\d+$/.test(String(tcgId)) ? String(tcgId) : null;

  if (numericId) {
    return `https://www.tcgplayer.com/product/${numericId}?Language=English&Condition=${conditionParam}&page=1`;
  }

  // If existing link has /product/12345
  const existingLink = (card as CardItem).best_link || '';
  const match = existingLink.match(/\/product\/(\d+)/);
  if (match && match[1]) {
    return `https://www.tcgplayer.com/product/${match[1]}?Language=English&Condition=${conditionParam}&page=1`;
  }

  // Fallback search
  return `https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&q=${encodeURIComponent(cleanName)}&view=grid&Condition=${conditionParam}`;
}

// Formats a dynamic eBay sold comps search link including grade or condition
export function formatEbayLink(card: CardItem): string {
  const isJa = isJapaneseCard(card);
  const cleanName = getCleanCardName(card.name);
  const conditionOrGrade = card.grade || 'Near Mint';
  const queryParts = [cleanName, card.set_name || ''];
  if (isJa) queryParts.push('Japanese');
  queryParts.push(conditionOrGrade);

  const query = queryParts.filter(Boolean).join(' ');
  return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`;
}
