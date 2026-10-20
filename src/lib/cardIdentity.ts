import { SearchCardResult, CardItem } from './types';
import { normalizeCardName } from './jpTranslations';

/**
 * Robustly checks if two cards represent the exact same card printing.
 * Never conflates different rarities (e.g. SIR vs IR) or different sets (e.g. Cosmic Eclipse vs Mega Evolution)
 * just because they share the same character name!
 */
export function isSameCard(
  a: SearchCardResult | CardItem | { id?: string; card_id?: string; tcgplayerId?: string; name: string; setName?: string; set_name?: string; rarity?: string; number?: string; language?: string },
  b: SearchCardResult | CardItem | { id?: string; card_id?: string; tcgplayerId?: string; name: string; setName?: string; set_name?: string; rarity?: string; number?: string; language?: string }
): boolean {
  if (!a || !b) return false;

  const aId = String((a as any).card_id || a.id || (a as any).tcgplayerId || '').trim();
  const bId = String((b as any).card_id || b.id || (b as any).tcgplayerId || '').trim();

  // 1. Direct ID match
  if (aId && bId) {
    if (aId === bId) return true;
    const cleanA = aId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const cleanB = bId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (cleanA === cleanB && cleanA.length > 2) return true;
  }

  // 2. Name check
  const nameA = normalizeCardName(a.name || '');
  const nameB = normalizeCardName(b.name || '');
  if (!nameA || !nameB || nameA !== nameB) return false;

  // If names match, check set name
  const setA = ((a as any).setName || (a as any).set_name || '').toLowerCase().trim();
  const setB = ((b as any).setName || (b as any).set_name || '').toLowerCase().trim();

  // If set is known on both and they differ, they are from different expansions!
  if (setA && setB && setA !== setB) {
    return false;
  }

  // If rarity is known on both and they differ (e.g. SIR vs IR, Ultra Rare vs Secret Rare), they are distinct printings!
  const rarityA = ((a as any).rarity || '').toLowerCase().trim();
  const rarityB = ((b as any).rarity || '').toLowerCase().trim();
  if (rarityA && rarityB && rarityA !== rarityB) {
    // Check if one is SIR and other is IR/Ultra
    const isSpecialA = rarityA.includes('special') || rarityA.includes('sar') || rarityA.includes('sir');
    const isSpecialB = rarityB.includes('special') || rarityB.includes('sar') || rarityB.includes('sir');
    if (isSpecialA !== isSpecialB) return false;

    const isIrA = rarityA.includes('illustration rare') || rarityA.includes('art rare') || rarityA === 'ir';
    const isIrB = rarityB.includes('illustration rare') || rarityB.includes('art rare') || rarityB === 'ir';
    if (isIrA !== isIrB) return false;
  }

  // If card number is known on both and they differ
  const numA = ((a as any).number || (aId.includes('-') ? aId.split('-')[1] : '')).replace(/\D/g, '');
  const numB = ((b as any).number || (bId.includes('-') ? bId.split('-')[1] : '')).replace(/\D/g, '');
  if (numA && numB && numA !== numB) {
    return false;
  }

  // If both have different explicit IDs, they are different printings
  if (aId && bId && aId !== bId) {
    return false;
  }

  return true;
}
