import { SearchCardResult, SetInfo } from './types';

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
  set?: {
    id: string;
    name: string;
    logo?: string;
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

    if (rarities.length > 0) {
      // Parallel fetch across selected rarities
      const fetchPromises = rarities.map(async (r) => {
        try {
          const params = new URLSearchParams();
          params.set('rarity', r);
          if (category) params.set('category', category);
          if (query) params.set('name', query);

          const res = await fetch(`${baseUrl}/cards?${params.toString()}`, {
            next: { revalidate: 3600 }
          });
          if (!res.ok) return [];
          return (await res.json()) as TcgdexCardSummary[];
        } catch {
          return [];
        }
      });

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
        const params = new URLSearchParams();
        if (query) params.set('name', query);
        if (category) params.set('category', category);

        const res = await fetch(`${baseUrl}/cards?${params.toString()}`, {
          next: { revalidate: 3600 }
        });
        if (res.ok) {
          const list: TcgdexCardSummary[] = await res.json();
          if (Array.isArray(list)) {
            for (const item of list) itemMap.set(item.id, item);
          }
        }
      } catch (err) {
        console.error(`TCGdex [${lang}] search error:`, err);
      }
    }

    const items = Array.from(itemMap.values());
    if (items.length === 0) return [];

    // Allow fetching sufficient candidates to meet requested limit
    const fetchCount = trainerType ? Math.min(items.length, limit * 2) : Math.min(items.length, limit);
    const topItems = items.slice(0, fetchCount);

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
          if (trainerType && d.trainerType) {
            const types = trainerType.toLowerCase().split(',').map((t) => t.trim());
            if (!types.includes(d.trainerType.toLowerCase())) {
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
          // 2. pokemontcg.io official scan (EN)
          // 3. Limitless TCG CDN (JP)
          // 4. TCGplayer CDN
          let imageUrl = '';
          const imageBase = d.image || item.image;
          const cleanLocalId = parseInt(d.localId || '0', 10);

          if (imageBase) {
            imageUrl = `${imageBase}/high.webp`;
          } else if (lang === 'en' && d.set?.id && d.localId) {
            const setSlug = d.set.id.replace('.', '').toLowerCase();
            imageUrl = `https://images.pokemontcg.io/${setSlug}/${d.localId}.png`;
          } else if (lang === 'ja' && d.set?.id && cleanLocalId > 0) {
            imageUrl = `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpc/${d.set.id}/${d.set.id}_${cleanLocalId}_R_JP.png`;
          } else if (tcgId) {
            imageUrl = `https://product-images.tcgplayer.com/fit-in/438x438/${tcgId}.jpg`;
          }

          const cardLang = lang === 'zh-tw' || lang === 'zh-cn' ? 'zh' : (lang as any);

          return {
            id: d.id,
            tcgplayerId: tcgId,
            name: d.name,
            setName: d.set?.name || 'Pokémon TCG',
            set_name: d.set?.name || 'Pokémon TCG',
            image: imageUrl,
            imageUrl: imageUrl,
            price: bestPrice ? bestPrice.toFixed(2) : null,
            rarity: d.rarity,
            category: d.category,
            trainerType: d.trainerType,
            number: d.localId,
            game: 'pokemon' as const,
            language: cardLang,
            pricingSource: bestPrice ? pricingSource : undefined
          };
        } catch {
          if (trainerType) return null;
          const imageBase = item.image;
          const imageUrl = imageBase ? `${imageBase}/high.webp` : '';
          const cardLang = lang === 'zh-tw' || lang === 'zh-cn' ? 'zh' : (lang as any);
          return {
            id: item.id,
            name: item.name,
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
