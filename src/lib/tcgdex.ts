import { SearchCardResult, SetInfo } from './types';
import { getKnownCardPrice } from './knownPrices';
import { translateAsianCardName } from './asianTranslations';

const TCGDEX_ROOT = 'https://api.tcgdex.net/v2';

interface TcgdexCardSummary {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

interface TcgdexCardDetail {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  category?: string;
  trainerType?: string;
  hp?: number | string;
  types?: string[];
  stage?: string;
  attacks?: any[];
  set?: {
    id: string;
    name: string;
    logo?: string;
    cardCount?: {
      official?: number;
      total?: number;
    };
  };
  variants_detailed?: Array<{
    type?: string;
    thirdParty?: {
      tcgplayer?: number;
      cardmarket?: number;
    };
  }>;
  pricing?: {
    tcgplayer?: {
      normal?: { productId?: number; marketPrice?: number; lowPrice?: number; midPrice?: number; directLowPrice?: number };
      holofoil?: { productId?: number; marketPrice?: number; lowPrice?: number; midPrice?: number; directLowPrice?: number };
      reverseHolofoil?: { productId?: number; marketPrice?: number; lowPrice?: number; midPrice?: number; directLowPrice?: number };
      firstEditionHolofoil?: { productId?: number; marketPrice?: number; lowPrice?: number };
      firstEditionNormal?: { productId?: number; marketPrice?: number; lowPrice?: number };
    };
    cardmarket?: {
      avg?: number;
      low?: number;
      trend?: number;
      unit?: string;
    };
  };
}

export interface TcgdexSearchOptions {
  query?: string;
  category?: string;
  trainerType?: string;
  rarities?: string[];
  limit?: number;
  lang?: 'en' | 'ja' | 'ko' | 'zh-tw' | 'zh-cn';
}

const cardDetailCache = new Map<string, TcgdexCardDetail>();

export function getEraPriority(id?: string): number {
  const lower = (id || '').toLowerCase();
  if (lower.startsWith('sv')) return 100;
  if (lower.startsWith('swsh') || lower.startsWith('s8') || lower.startsWith('s9') || lower.startsWith('s10') || lower.startsWith('s11') || lower.startsWith('s12') || lower.startsWith('s-p')) return 90;
  if (lower.startsWith('sm')) return 80;
  if (lower.startsWith('xy')) return 70;
  if (lower.startsWith('bw')) return 60;
  return 10;
}

export function inferCardRarity(d: TcgdexCardDetail): string {
  if (d.rarity && d.rarity.toLowerCase() !== 'none') {
    return d.rarity;
  }

  const cleanLocalId = parseInt(d.localId || '0', 10);
  const officialCount = d.set?.cardCount?.official || 0;

  // If localId is greater than official set count, it is a Secret Rare / Full Art / SAR!
  if (officialCount > 0 && cleanLocalId > officialCount) {
    const diff = cleanLocalId - officialCount;
    // For Japanese sets (like SV7a 64 official, 83 is SR, 90 is SAR):
    if (diff >= 24 || (d.category === 'Trainer' && diff >= 24)) {
      return 'Special Illustration Rare';
    }
    return 'Ultra Rare';
  }

  // High-class reprint sets (SM4+, SM8b, S8b, SV8a, MC, etc.) where trainers have no rarity marked:
  if (d.category === 'Trainer' || d.trainerType) {
    return 'Uncommon';
  }

  return 'Rare';
}

export async function searchTcgdexCards(
  queryOrOptions: string | TcgdexSearchOptions,
  limitParam: number = 1000
): Promise<SearchCardResult[]> {
  try {
    const options: TcgdexSearchOptions =
      typeof queryOrOptions === 'string'
        ? { query: queryOrOptions, limit: limitParam }
        : { limit: limitParam, ...queryOrOptions };

    const lang = options.lang || 'en';
    const query = options.query?.trim() || '';
    const category = options.category?.trim() || '';
    const trainerType = options.trainerType?.trim() || '';
    const rarities = options.rarities || [];
    const limit = options.limit || 1000;
    const baseUrl = `${TCGDEX_ROOT}/${lang}`;

    if (!query && !category && rarities.length === 0) return [];

    const itemMap = new Map<string, TcgdexCardSummary>();

    const queryVariants = query ? [query] : [''];
    if (query.includes("'")) {
      queryVariants.push(query.replace(/'/g, '’'));
    } else if (query.includes("’")) {
      queryVariants.push(query.replace(/’/g, "'"));
    }

    if (rarities.length > 0) {
      // Parallel fetch across selected rarities and query variants
      const fetchPromises: Promise<TcgdexCardSummary[]>[] = [];
      for (const r of rarities) {
        for (const qv of queryVariants) {
          fetchPromises.push(
            (async () => {
              try {
                const params = new URLSearchParams();
                params.set('rarity', r);
                if (category) params.set('category', category);
                if (trainerType) params.set('trainerType', trainerType);
                if (qv) params.set('name', qv);

                const res = await fetch(`${baseUrl}/cards?${params.toString()}`, {
                  next: { revalidate: 3600 }
                });
                if (!res.ok) return [];
                return (await res.json()) as TcgdexCardSummary[];
              } catch {
                return [];
              }
            })()
          );
        }
      }

      const results = await Promise.all(fetchPromises);
      for (const list of results) {
        if (Array.isArray(list)) {
          for (const item of list) {
            if (!itemMap.has(item.id)) {
              itemMap.set(item.id, item);
            }
          }
        }
      }
    } else {
      try {
        for (const qv of queryVariants) {
          const params = new URLSearchParams();
          if (qv) params.set('name', qv);
          if (category) params.set('category', category);
          if (trainerType) params.set('trainerType', trainerType);

          const res = await fetch(`${baseUrl}/cards?${params.toString()}`, {
            next: { revalidate: 3600 }
          });
          if (res.ok) {
            const list: TcgdexCardSummary[] = await res.json();
            if (Array.isArray(list)) {
              for (const item of list) itemMap.set(item.id, item);
            }
          }
        }
      } catch (err) {
        console.error(`TCGdex [${lang}] search error:`, err);
      }
    }

    const items = Array.from(itemMap.values());
    if (items.length === 0) return [];

    // Prioritize modern Scarlet & Violet and Sword & Shield sets first before vintage
    const sortedItems = items.slice().sort((a, b) => getEraPriority(b.id) - getEraPriority(a.id));

    // When specific rarities are selected, the list is already filtered to high rarities (~400 cards).
    // Fetch all candidates up to 1000 so earlier eras (like Sun & Moon full arts) are not truncated.
    const fetchCount = rarities.length > 0
      ? Math.min(sortedItems.length, Math.max(limit, 1000))
      : (trainerType ? Math.min(sortedItems.length, limit * 2) : Math.min(sortedItems.length, limit));
    const topItems = sortedItems.slice(0, fetchCount);

    // Fetch details in concurrent chunks of 60 with in-memory caching
    const detailedResults: (SearchCardResult | null)[] = [];
    const chunkSize = 60;

    for (let i = 0; i < topItems.length; i += chunkSize) {
      const chunk = topItems.slice(i, i + chunkSize);
      const chunkPromises = chunk.map(async (item): Promise<SearchCardResult | null> => {
        try {
          const cacheKey = `${lang}_${item.id}`;
          let d = cardDetailCache.get(cacheKey);

          if (!d) {
            const detailRes = await fetch(`${baseUrl}/cards/${item.id}`, {
              next: { revalidate: 3600 }
            });
            if (!detailRes.ok) throw new Error('Failed to fetch detail');
            d = (await detailRes.json()) as TcgdexCardDetail;
            cardDetailCache.set(cacheKey, d);
          }

          // Subtype check (e.g. Supporter, Item, Stadium, Tool)
          if (trainerType) {
            if (!d.trainerType) return null;
            const types = trainerType.toLowerCase().split(',').map((t) => t.trim());
            if (!types.includes(d.trainerType.toLowerCase())) {
              return null;
            }
          }

          // Category check
          if (category) {
            const catLower = category.toLowerCase().trim();
            const dCatLower = (d.category || '').toLowerCase().trim();
            if (catLower === 'trainer' && dCatLower === 'pokemon') return null;
            if (catLower === 'pokemon' && dCatLower === 'trainer') return null;
          }

          // Strict validation: If looking for Supporters/Trainers, strictly reject Pokemon cards
          if (trainerType?.toLowerCase().includes('supporter') || category?.toLowerCase() === 'trainer') {
            if (d.hp || (d.types && d.types.length > 0) || d.stage || (d.attacks && d.attacks.length > 0)) {
              return null;
            }
            const rawLower = (d.name || '').toLowerCase();
            if (/\b(ex|vmax|vstar|gx|lv\.x)\b/i.test(rawLower) || /ex$/i.test(rawLower)) {
              return null;
            }
            if (['sv-p-012', 'sv-p-020', 'sv-p-021'].includes((d.id || '').toLowerCase())) {
              return null;
            }
          }

          // Extract best available TCGPlayer price and Product ID
          const tp = d.pricing?.tcgplayer;
          let bestPrice: number | null = null;
          let tcgId: string | undefined = undefined;
          let pricingSource = 'TCGPlayer';

          if (tp) {
            const holo = tp.holofoil;
            const norm = tp.normal;
            const rev = tp.reverseHolofoil;

            const possibleIds = [
              holo?.productId,
              norm?.productId,
              rev?.productId,
              d.variants_detailed?.[0]?.thirdParty?.tcgplayer
            ].filter((id): id is number => typeof id === 'number' && id > 0);
            if (possibleIds.length > 0) {
              tcgId = String(possibleIds[0]);
            }

            const candidates = [
              holo?.marketPrice,
              holo?.directLowPrice,
              holo?.lowPrice,
              holo?.midPrice,
              norm?.marketPrice,
              norm?.directLowPrice,
              norm?.lowPrice,
              rev?.marketPrice,
              rev?.lowPrice
            ].filter((p): p is number => typeof p === 'number' && p > 0);

            if (candidates.length > 0) {
              bestPrice = candidates[0]; // prioritize marketPrice
            }
          }

          // Known high-value card pricing fallback (e.g. Misty's Favor, Lillie, Rosa)
          if (!bestPrice || bestPrice === 0) {
            const known = getKnownCardPrice(d.id, d.name, d.rarity);
            if (known) {
              bestPrice = known.price;
              tcgId = tcgId || known.tcgplayerId;
              pricingSource = known.source;
            }
          }

          // Cardmarket fallback for non-English (EUR -> USD ~1.08)
          if (!bestPrice && d.pricing?.cardmarket) {
            const cm = d.pricing.cardmarket;
            const eurPrice = cm.avg || cm.trend || cm.low;
            if (eurPrice && eurPrice > 0) {
              bestPrice = parseFloat((eurPrice * 1.08).toFixed(2));
              pricingSource = 'Cardmarket';
            }
          }

          // Robust multi-tier image resolution across languages:
          // 1. TCGdex high.webp
          // 2. Canonical Asian set scan (assets.tcgdex.net/ja/...)
          // 3. pokemontcg.io official scan (EN)
          // 4. TCGplayer CDN (EN only)
          let imageUrl = '';
          const imageBase = d.image || item.image;
          const cleanLocalId = d.localId || item.localId || '';
          const rawSetId = d.set?.id || item.id?.split('-')[0] || '';

          if (imageBase) {
            imageUrl = `${imageBase}/high.webp`;
          } else if (lang === 'zh-tw' || lang === 'zh-cn' || lang === 'ko' || lang === 'ja') {
            // Asian sets (JP, KR, ZH) share identical set IDs and local card numbers
            const series = rawSetId.toUpperCase().startsWith('SV')
              ? 'SV'
              : rawSetId.toUpperCase().startsWith('SM')
              ? 'SM'
              : rawSetId.toUpperCase().startsWith('SWSH') || rawSetId.toUpperCase().startsWith('S')
              ? 'SWSH'
              : rawSetId.toUpperCase().startsWith('XY')
              ? 'XY'
              : rawSetId.toUpperCase().startsWith('BW')
              ? 'BW'
              : 'SV';

            if (rawSetId && cleanLocalId) {
              imageUrl = `https://assets.tcgdex.net/ja/${series}/${rawSetId}/${cleanLocalId}/high.webp`;
            }
          } else if (lang === 'en' && d.set?.id && d.localId) {
            const setSlug = d.set.id.replace('.', '').toLowerCase();
            imageUrl = `https://images.pokemontcg.io/${setSlug}/${d.localId}.png`;
          } else if (tcgId && lang === 'en') {
            imageUrl = `https://product-images.tcgplayer.com/fit-in/438x438/${tcgId}.jpg`;
          }

          const cardLang = lang === 'zh-tw' || lang === 'zh-cn' ? 'zh' : (lang as any);
          const rawCardName = d.name || item.name || '';
          const { englishName, isTranslated } = translateAsianCardName(rawCardName);
          const finalName = isTranslated ? englishName : rawCardName;

          return {
            id: d.id,
            tcgplayerId: tcgId,
            name: finalName,
            setName: d.set?.name || 'Pokémon TCG',
            set_name: d.set?.name || 'Pokémon TCG',
            image: imageUrl,
            imageUrl: imageUrl,
            price: bestPrice ? bestPrice.toFixed(2) : null,
            rarity: inferCardRarity(d),
            category: d.category,
            trainerType: d.trainerType,
            number: d.localId,
            game: 'pokemon' as const,
            language: cardLang,
            pricingSource: bestPrice ? pricingSource : undefined
          };
        } catch {
          if (trainerType || category) return null;
          const imageBase = item.image;
          const rawSetId = item.id?.split('-')[0] || '';
          const rawLocalId = item.localId || item.id?.split('-')[1] || '';
          const series = rawSetId.toUpperCase().startsWith('SV')
            ? 'SV'
            : rawSetId.toUpperCase().startsWith('SM')
            ? 'SM'
            : rawSetId.toUpperCase().startsWith('SWSH') || rawSetId.toUpperCase().startsWith('S')
            ? 'SWSH'
            : 'SV';

          let imageUrl = imageBase ? `${imageBase}/high.webp` : '';
          if (!imageUrl && rawSetId && rawLocalId) {
            imageUrl = `https://assets.tcgdex.net/ja/${series}/${rawSetId}/${rawLocalId}/high.webp`;
          }

          const cardLang = lang === 'zh-tw' || lang === 'zh-cn' ? 'zh' : (lang as any);
          const { englishName, isTranslated } = translateAsianCardName(item.name || '');

          return {
            id: item.id,
            name: isTranslated ? englishName : item.name,
            setName: 'Pokémon TCG',
            set_name: 'Pokémon TCG',
            image: imageUrl,
            imageUrl: imageUrl,
            price: null,
            number: item.localId,
            game: 'pokemon' as const,
            language: cardLang
          };
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      detailedResults.push(...chunkResults);
    }

    return detailedResults
      .filter((card): card is SearchCardResult => card !== null)
      .slice(0, limit);
  } catch (error) {
    console.error('TCGdex search error:', error);
    return [];
  }
}

export async function getTcgdexSets(): Promise<SetInfo[]> {
  try {
    const res = await fetch(`${TCGDEX_ROOT}/en/sets`, {
      next: { revalidate: 86400 } // Cache sets for 24h
    });
    if (!res.ok) return [];
    const sets = await res.json();
    if (!Array.isArray(sets)) return [];

    return sets.map((s: any) => ({
      id: s.id,
      name: s.name,
      cardCount: s.cardCount,
      logo: s.logo ? `${s.logo}.webp` : undefined,
      symbol: s.symbol ? `${s.symbol}.webp` : undefined
    }));
  } catch (err) {
    console.error('TCGdex sets error:', err);
    return [];
  }
}
