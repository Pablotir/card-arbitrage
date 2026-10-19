// Verified TCGPlayer product IDs and market prices for high-value cards
// where third-party metadata APIs (like TCGdex) occasionally report null pricing
export interface KnownPriceEntry {
  tcgplayerId?: string;
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
  'xy171-182': { tcgplayerId: '598717', price: 45.00, source: 'TCGPlayer' },
  'xy2-88a': { tcgplayerId: '148339', price: 45.00, source: 'TCGPlayer' },

  // Hex Maniac (Premium Trainer's XY Collection 75a/98 & The Best of XY 181/171)
  'xy7-75a': { tcgplayerId: '148342', price: 126.40, source: 'TCGPlayer' },
  '75a/98': { tcgplayerId: '148342', price: 126.40, source: 'TCGPlayer' },
  'sm2l-181': { tcgplayerId: '598818', price: 420.00, source: 'Cardmarket / Mercari' },
  'xy171-181': { tcgplayerId: '598818', price: 420.00, source: 'Cardmarket / Mercari' },

  // N (Premium Trainer's XY Collection 105a/124 & The Best of XY 180/171)
  'xy10-105a': { tcgplayerId: '148347', price: 68.50, source: 'TCGPlayer' },
  '105a/124': { tcgplayerId: '148347', price: 68.50, source: 'TCGPlayer' },
  'sm2l-180': { tcgplayerId: '598897', price: 160.00, source: 'Cardmarket / Mercari' },
  'xy171-180': { tcgplayerId: '598897', price: 160.00, source: 'Cardmarket / Mercari' },

  // Delinquent (Premium Trainer's XY Collection 98b/122 & The Best of XY 184/171)
  'xy9-98b': { tcgplayerId: '148341', price: 32.00, source: 'TCGPlayer' },
  '98b/122': { tcgplayerId: '148341', price: 32.00, source: 'TCGPlayer' },
  'sm2l-184': { tcgplayerId: '598755', price: 95.00, source: 'Cardmarket / Mercari' },
  'xy171-184': { tcgplayerId: '598755', price: 95.00, source: 'Cardmarket / Mercari' },

  // Shauna (Premium Trainer's XY Collection 111a/124 & The Best of XY 185/171)
  'xy10-111a': { tcgplayerId: '148349', price: 34.00, source: 'TCGPlayer' },
  '111a/124': { tcgplayerId: '148349', price: 34.00, source: 'TCGPlayer' },
  'sm2l-185': { tcgplayerId: '598955', price: 110.00, source: 'Cardmarket / Mercari' },
  'xy171-185': { tcgplayerId: '598955', price: 110.00, source: 'Cardmarket / Mercari' },

  // Team Flare Grunt (Premium Trainer's XY Collection 73a/83 & The Best of XY 186/171)
  'g1-73a': { tcgplayerId: '148351', price: 18.50, source: 'TCGPlayer' },
  '73a/83': { tcgplayerId: '148351', price: 18.50, source: 'TCGPlayer' },
  'sm2l-186': { tcgplayerId: '598983', price: 65.00, source: 'Cardmarket / Mercari' },
  'xy171-186': { tcgplayerId: '598983', price: 65.00, source: 'Cardmarket / Mercari' },

  // Team Skull Grunt (Special Box Japanese Promo 013/SM-P)
  'sm-p-013': { tcgplayerId: '598475', price: 180.00, source: 'Cardmarket / Mercari' },

  // Tournament Collection Promos
  'swsh121': { tcgplayerId: '246830', price: 42.00, source: 'TCGPlayer' },
  'swsh178': { tcgplayerId: '272583', price: 9.50, source: 'TCGPlayer' },
  'swsh251': { tcgplayerId: '488344', price: 18.00, source: 'TCGPlayer' },
  'swsh302': { tcgplayerId: '490197', price: 16.50, source: 'TCGPlayer' },
  'svp-124': { tcgplayerId: '544154', price: 22.00, source: 'TCGPlayer' },

  // Tag All Stars Alt Art Full Arts
  'sm12a-193': { tcgplayerId: '205392', price: 95.00, source: 'Cardmarket / Mercari' },
  'sm12a-196': { tcgplayerId: '205394', price: 210.00, source: 'Cardmarket / Mercari' },
  'sm12a-201': { tcgplayerId: '205396', price: 85.00, source: 'Cardmarket / Mercari' },

  // Professor Sycamore (Premium Trainer's XY Collection 114a/114 & The Best of XY 179/171)
  'xy9-114a': { tcgplayerId: '148348', price: 14.00, source: 'TCGPlayer' },
  '114a/114': { tcgplayerId: '148348', price: 14.00, source: 'TCGPlayer' },
  'sm2l-179': { tcgplayerId: '598971', price: 45.00, source: 'Cardmarket / Mercari' },
  'xy171-179': { tcgplayerId: '598971', price: 45.00, source: 'Cardmarket / Mercari' },

  // Lysandre (The Best of XY 178/171 Full Art)
  'sm2l-178': { tcgplayerId: '598851', price: 40.00, source: 'Cardmarket / Mercari' },
  'xy171-178': { tcgplayerId: '598851', price: 40.00, source: 'Cardmarket / Mercari' },

  // Shaymin-EX (Premium Trainer's XY Collection 77a/108 & The Best of XY 176/171)
  'xy6-77a': { tcgplayerId: '148350', price: 28.00, source: 'TCGPlayer' },
  '77a/108': { tcgplayerId: '148350', price: 28.00, source: 'TCGPlayer' },
  'sm2l-176': { price: 35.00, source: 'Cardmarket / Mercari' },

  // Red's Pikachu & Lillie's Clefairy Promos
  'sm-p-279': { tcgplayerId: '598471', price: 85.00, source: 'Cardmarket / Mercari' },
  'sm-p-381': { tcgplayerId: '598476', price: 220.00, source: 'Cardmarket / Mercari' },

  // N (BW Black Star Promo BW100)
  'bw100': { tcgplayerId: '87771', price: 130.00, source: 'TCGPlayer' },
  'bw-p-100': { tcgplayerId: '87771', price: 130.00, source: 'TCGPlayer' },

  // Professor's Research [Professor Oak] (Celebrations 023/025)
  'cel25-23': { tcgplayerId: '250320', price: 0.92, source: 'TCGPlayer' },
  'swsh-cel-23': { tcgplayerId: '250320', price: 0.92, source: 'TCGPlayer' },

  // 30th Anniversary / 30th Celebration Classic Collection
  'me-30th-n': { price: 48.00, source: 'TCGPlayer' },
  'me-30th-misty': { price: 35.00, source: 'TCGPlayer' },
  'm6a-n': { price: 55.00, source: 'Cardmarket / Mercari' },
  'm6a-misty': { price: 38.00, source: 'Cardmarket / Mercari' }
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
      if (isUltra || cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('182') || lower.includes('full art') || cardId?.toLowerCase().includes('88a')) {
        return cardId?.toLowerCase().includes('sm2l') ? KNOWN_CARD_PRICING['sm2l-182'] : KNOWN_CARD_PRICING['xy2-88a'];
      }
    }
    if (lower.includes('hex maniac') || lower.includes('オカルトマニア')) {
      if (cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('181')) {
        return KNOWN_CARD_PRICING['sm2l-181'];
      }
      if (isUltra || lower.includes('75a') || lower.includes('full art') || rLower.includes('promo')) {
        return KNOWN_CARD_PRICING['xy7-75a'];
      }
    }
    if (lower.includes('delinquent') || lower.includes('こわいおねえさん')) {
      if (cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('184')) {
        return KNOWN_CARD_PRICING['sm2l-184'];
      }
      if (isUltra || lower.includes('98b') || lower.includes('full art') || rLower.includes('promo')) {
        return KNOWN_CARD_PRICING['xy9-98b'];
      }
    }
    if (lower.includes('shauna') || lower.includes('サナ')) {
      if (cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('185')) {
        return KNOWN_CARD_PRICING['sm2l-185'];
      }
      if (isUltra || lower.includes('111a') || (lower.includes('full art') && !lower.includes('fusion'))) {
        return KNOWN_CARD_PRICING['xy10-111a'];
      }
    }
    if (lower.includes('team flare grunt') || lower.includes('フレア団したっぱ')) {
      if (cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('186')) {
        return KNOWN_CARD_PRICING['sm2l-186'];
      }
      if (isUltra || lower.includes('73a') || lower.includes('full art')) {
        return KNOWN_CARD_PRICING['g1-73a'];
      }
    }
    if (lower.includes('team skull grunt') || lower.includes('スカル団したっぱ')) {
      return KNOWN_CARD_PRICING['sm-p-013'];
    }
    if (lower === 'n' || lower.includes(' n ') || lower.startsWith('n ') || lower.includes("n's")) {
      if (cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('180')) {
        return KNOWN_CARD_PRICING['sm2l-180'];
      }
      if (isUltra || lower.includes('105a') || lower.includes('full art')) {
        return KNOWN_CARD_PRICING['xy10-105a'];
      }
    }
    if (lower.includes('marnie') && (lower.includes('swsh121') || sLower.includes('tournament collection') || lower.includes('tournament'))) {
      return KNOWN_CARD_PRICING['swsh121'];
    }
    if (lower.includes('klara') && (lower.includes('swsh302') || sLower.includes('tournament collection') || lower.includes('tournament'))) {
      return KNOWN_CARD_PRICING['swsh302'];
    }
    if (lower.includes('juniper') && (lower.includes('swsh178') || sLower.includes('tournament collection') || lower.includes('tournament'))) {
      return KNOWN_CARD_PRICING['swsh178'];
    }
    if (lower.includes('sycamore') || lower.includes('プラターヌ')) {
      if (cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('179')) {
        return KNOWN_CARD_PRICING['sm2l-179'];
      }
      if (isUltra || lower.includes('114a') || lower.includes('full art')) {
        return KNOWN_CARD_PRICING['xy9-114a'];
      }
    }
    if (lower.includes('lysandre') || lower.includes('フラダリ')) {
      if (cardId?.toLowerCase().includes('sm2l') || sLower.includes('best of xy') || lower.includes('178')) {
        return KNOWN_CARD_PRICING['sm2l-178'];
      }
    }
  }
  return null;
}
