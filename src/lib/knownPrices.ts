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
  'swsh1-200': { tcgplayerId: '208428', price: 42.00, source: 'TCGPlayer' },

  // Hidden Fates Shiny Vault Full Art Supporters
  'sma-SV82': { tcgplayerId: '198083', price: 92.50, source: 'TCGPlayer' },
  'sma-SV84': { tcgplayerId: '198085', price: 16.50, source: 'TCGPlayer' },
  'sma-SV86': { tcgplayerId: '198087', price: 18.50, source: 'TCGPlayer' },
  'sma-SV83': { tcgplayerId: '198084', price: 11.20, source: 'TCGPlayer' },
  'sma-SV85': { tcgplayerId: '198086', price: 7.50, source: 'TCGPlayer' },
  'sma-SV81': { tcgplayerId: '198082', price: 8.50, source: 'TCGPlayer' },

  // Japanese Dream League Rosa SR (067/049) - Real Near Mint Comp
  'sm11b-067': { tcgplayerId: '201334', price: 280.00, source: 'Cardmarket / Mercari' },
  'sm11b-67': { tcgplayerId: '201334', price: 280.00, source: 'Cardmarket / Mercari' },

  // Cynthia Full Art (Ultra Prism 148/156)
  'sm5-148': { tcgplayerId: '160351', price: 95.00, source: 'TCGPlayer' },
  'sm5-119': { tcgplayerId: '160322', price: 1.50, source: 'TCGPlayer' },
  // Japanese Cynthia SR (Tag All Stars / GX Ultra Shiny / Ultra Prism)
  'sm8b-153': { tcgplayerId: '198083', price: 155.00, source: 'Cardmarket / Mercari' },
  'sm5m-070': { tcgplayerId: '160351', price: 180.00, source: 'Cardmarket / Mercari' },

  // Hilda (Special Illustration Rare - White Flare / Japanese sv10W-171)
  'sv-hilda-sar': { tcgplayerId: '596101', price: 54.75, source: 'TCGPlayer' },
  // Hilda (Ultra Rare / Full Art - White Flare / Japanese sv10W-164)
  'sv-hilda-fa': { tcgplayerId: '596100', price: 9.43, source: 'TCGPlayer' },
  // Hilda (Uncommon - White Flare)
  'sv-hilda-unc': { tcgplayerId: '596099', price: 1.85, source: 'TCGPlayer' },

  // Karen (Mega Powers Premium Collection Full Art - XY177a)
  'xyp-177a': { tcgplayerId: '148344', price: 96.00, source: 'TCGPlayer' },
  'xyp-xy177a': { tcgplayerId: '148344', price: 96.00, source: 'TCGPlayer' },
  'xy177a': { tcgplayerId: '148344', price: 96.00, source: 'TCGPlayer' },
  // Karen (XY Black Star Promos Regular - XY177)
  'xyp-177': { tcgplayerId: '123438', price: 11.00, source: 'TCGPlayer' },
  'xyp-xy177': { tcgplayerId: '123438', price: 11.00, source: 'TCGPlayer' },
  // Karen (Japanese The Best of XY Full Art 177/171)
  'sm2l-177': { tcgplayerId: '598716', price: 240.00, source: 'Cardmarket / Mercari' },

  // Blacksmith (Japanese The Best of XY Full Art 182/171)
  'sm2l-182': { tcgplayerId: '598717', price: 45.00, source: 'TCGPlayer' },
  'xy171-182': { tcgplayerId: '598717', price: 45.00, source: 'TCGPlayer' }
};

export function getKnownCardPrice(
  cardId?: string,
  cardName?: string,
  rarity?: string,
  setName?: string
): KnownPriceEntry | null {
  if (cardId) {
    const idClean = cardId.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    for (const [k, v] of Object.entries(KNOWN_CARD_PRICING)) {
      if (idClean === k.toLowerCase()) return v;
    }
    // Also check if cardId contains sm11b-067 or sm11b-67 for JP Rosa
    if (idClean.includes('sm11b') && (idClean.includes('067') || idClean.includes('67'))) {
      return KNOWN_CARD_PRICING['sm11b-067'];
    }
  }

  const sLower = (setName || '').toLowerCase();

  if (cardName) {
    const lower = cardName.toLowerCase().replace(/[\u2018\u2019]/g, "'");
    const rLower = (rarity || '').toLowerCase();
    const isUltra = rLower.includes('ultra') || rLower.includes('special') || rLower.includes('secret') || rLower.includes('full art') || rLower.includes('shiny rare');

    if (lower.includes("misty's favor") || lower.includes("mistys favor")) {
      return isUltra || lower.includes('235') ? KNOWN_CARD_PRICING['sm11-235'] : KNOWN_CARD_PRICING['sm11-202'];
    }
    if (lower.includes('lillie') && (lower.includes('ultra prism') || lower.includes('151/156') || sLower.includes('ultra prism'))) {
      return KNOWN_CARD_PRICING['sm5-151'];
    }
    if (lower.includes('rosa')) {
      if (cardId?.toLowerCase().includes('sm11b') || lower.includes('dream league') || sLower.includes('dream league')) {
        return KNOWN_CARD_PRICING['sm11b-067'];
      }
      return KNOWN_CARD_PRICING['sm12-236'];
    }
    if (lower.includes("erika's hospitality")) {
      return KNOWN_CARD_PRICING['sm9-174'];
    }
    if (lower.includes('cynthia')) {
      if (cardId?.toLowerCase().includes('sm8b') || lower.includes('tag all stars') || sLower.includes('tag all stars')) {
        return KNOWN_CARD_PRICING['sm8b-153'];
      }
      if (lower.includes('hidden fates') || sLower.includes('hidden fates') || sLower.includes('shiny vault') || cardId?.toLowerCase().includes('sv82') || lower.includes('sv82')) {
        return KNOWN_CARD_PRICING['sma-SV82'];
      }
      if (isUltra || lower.includes('148') || sLower.includes('ultra prism')) {
        return KNOWN_CARD_PRICING['sm5-148'];
      }
    }
    if (lower.includes('hilda') || lower.includes('トウコ')) {
      if (rLower.includes('special') || rLower.includes('sar') || lower.includes('171')) {
        return KNOWN_CARD_PRICING['sv-hilda-sar'];
      }
      if (isUltra || rLower.includes('ultra') || lower.includes('164')) {
        return KNOWN_CARD_PRICING['sv-hilda-fa'];
      }
      return KNOWN_CARD_PRICING['sv-hilda-unc'];
    }
    if (lower.includes('guzma') && (lower.includes('hidden fates') || sLower.includes('hidden fates') || cardId?.toLowerCase().includes('sv84'))) {
      return KNOWN_CARD_PRICING['sma-SV84'];
    }
    if (lower.includes('lady') && (lower.includes('hidden fates') || sLower.includes('hidden fates') || cardId?.toLowerCase().includes('sv86'))) {
      return KNOWN_CARD_PRICING['sma-SV86'];
    }
    if (lower.includes('fisherman') && (lower.includes('hidden fates') || sLower.includes('hidden fates') || cardId?.toLowerCase().includes('sv83'))) {
      return KNOWN_CARD_PRICING['sma-SV83'];
    }
    if (lower.includes('hiker') && (lower.includes('hidden fates') || sLower.includes('hidden fates') || cardId?.toLowerCase().includes('sv85'))) {
      return KNOWN_CARD_PRICING['sma-SV85'];
    }
    if (lower.includes('aether foundation') && (lower.includes('hidden fates') || sLower.includes('hidden fates') || cardId?.toLowerCase().includes('sv81'))) {
      return KNOWN_CARD_PRICING['sma-SV81'];
    }
    if (lower.includes('karen') || lower.includes('カリン')) {
      if (cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('best of xy') || cardId?.toLowerCase().includes('171')) {
        return KNOWN_CARD_PRICING['sm2l-177'];
      }
      if (isUltra || lower.includes('177a') || lower.includes('full art') || rLower.includes('promo')) {
        return KNOWN_CARD_PRICING['xyp-177a'];
      }
      return KNOWN_CARD_PRICING['xyp-177'];
    }
    if (lower.includes('blacksmith') || lower.includes('鍛冶屋')) {
      if (isUltra || cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('182') || lower.includes('full art')) {
        return KNOWN_CARD_PRICING['sm2l-182'];
      }
    }
  }
  return null;
}
