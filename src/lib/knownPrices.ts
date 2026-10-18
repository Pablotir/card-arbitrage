// Verified TCGPlayer product IDs and market prices for high-value cards
// where third-party metadata APIs (like TCGdex) occasionally report null pricing
export interface KnownPriceEntry {
  tcgplayerId: string;
  price: number;
  source: string;
}

export const KNOWN_CARD_PRICING: Record<string, KnownPriceEntry> = {
  // Misty's Favor (Uncommon - Unified Minds 202/236)
  'sm11-202': { tcgplayerId: '195257', price: 2.50, source: 'TCGPlayer' },
  // Misty's Favor (Full Art - Unified Minds 235/236)
  'sm11-235': { tcgplayerId: '195296', price: 372.92, source: 'TCGPlayer' },
  // Lillie (Full Art - Ultra Prism 151/156)
  'sm5-151': { tcgplayerId: '160350', price: 480.00, source: 'TCGPlayer' },
  // Rosa (Full Art - Cosmic Eclipse 236/236)
  'sm12-236': { tcgplayerId: '201334', price: 235.00, source: 'TCGPlayer' },
  // Erika's Hospitality (Full Art - Team Up 174/181)
  'sm9-174': { tcgplayerId: '183921', price: 185.00, source: 'TCGPlayer' },
  // Sightseer (Tag All Stars 192/173)
  'sm12a-192': { tcgplayerId: '205391', price: 450.00, source: 'TCGPlayer' },
  // Skyla (Full Art - BREAKpoint 122/122)
  'xy9-122': { tcgplayerId: '111641', price: 52.83, source: 'TCGPlayer' },
  // Welder (Full Art - Unbroken Bonds 214/214)
  'sm10-214': { tcgplayerId: '189370', price: 48.00, source: 'TCGPlayer' },
  // Marnie (Full Art - Sword & Shield 200/202)
  'swsh1-200': { tcgplayerId: '208428', price: 42.00, source: 'TCGPlayer' }
};

export function getKnownCardPrice(cardId?: string, cardName?: string, rarity?: string): KnownPriceEntry | null {
  if (cardId && KNOWN_CARD_PRICING[cardId]) {
    return KNOWN_CARD_PRICING[cardId];
  }
  if (cardName) {
    const lower = cardName.toLowerCase().replace(/[\u2018\u2019]/g, "'");
    const rLower = (rarity || '').toLowerCase();
    const isUltra = rLower.includes('ultra') || rLower.includes('special') || rLower.includes('secret') || rLower.includes('full art');

    if (lower.includes("misty's favor") || lower.includes("mistys favor")) {
      return isUltra || lower.includes('235') ? KNOWN_CARD_PRICING['sm11-235'] : KNOWN_CARD_PRICING['sm11-202'];
    }
    if (lower.includes('lillie') && (lower.includes('ultra prism') || lower.includes('151/156'))) {
      return KNOWN_CARD_PRICING['sm5-151'];
    }
    if (lower.includes('rosa')) {
      return KNOWN_CARD_PRICING['sm12-236'];
    }
    if (lower.includes("erika's hospitality")) {
      return KNOWN_CARD_PRICING['sm9-174'];
    }
  }
  return null;
}
