import { SearchCardResult, SetInfo } from './types';

const TCGDEX_BASE = 'https://api.tcgdex.net/v2/en';

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
      normal?: { marketPrice?: number; lowPrice?: number; midPrice?: number };
      holofoil?: { marketPrice?: number; lowPrice?: number; midPrice?: number };
      reverseHolofoil?: { marketPrice?: number; lowPrice?: number; midPrice?: number };
      firstEditionHolofoil?: { marketPrice?: number; lowPrice?: number };
      firstEditionNormal?: { marketPrice?: number; lowPrice?: number };
    };
  };
}

export interface TcgdexSearchOptions {
  query?: string;
  category?: string;
  trainerType?: string;
  rarities?: string[];
  limit?: number;
}

export async function searchTcgdexCards(
  queryOrOptions: string | TcgdexSearchOptions,
  limitParam: number = 36
): Promise<SearchCardResult[]> {
  try {
    const options: TcgdexSearchOptions =
      typeof queryOrOptions === 'string'
        ? { query: queryOrOptions, limit: limitParam }
        : { limit: limitParam, ...queryOrOptions };

    const query = options.query?.trim() || '';
    const category = options.category?.trim() || '';
    const trainerType = options.trainerType?.trim() || '';
    const rarities = options.rarities || [];
    const limit = options.limit || 36;

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

          const res = await fetch(`${TCGDEX_BASE}/cards?${params.toString()}`, {
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

        const res = await fetch(`${TCGDEX_BASE}/cards?${params.toString()}`, {
          next: { revalidate: 3600 }
        });
        if (res.ok) {
          const list: TcgdexCardSummary[] = await res.json();
          if (Array.isArray(list)) {
            for (const item of list) itemMap.set(item.id, item);
          }
        }
      } catch (err) {
        console.error('TCGdex search error:', err);
      }
    }

    const items = Array.from(itemMap.values());
    if (items.length === 0) return [];

    // Fetch details for items (take more if trainerType filter needs checking)
    const fetchCount = trainerType ? Math.min(items.length, limit * 2) : Math.min(items.length, limit);
    const topItems = items.slice(0, fetchCount);

    const detailed = await Promise.allSettled(
      topItems.map(async (item): Promise<SearchCardResult | null> => {
        try {
          const detailRes = await fetch(`${TCGDEX_BASE}/cards/${item.id}`, {
            next: { revalidate: 3600 }
          });
          if (!detailRes.ok) throw new Error('Failed to fetch detail');
          const d: TcgdexCardDetail = await detailRes.json();

          // Subtype check (e.g. Supporter)
          if (trainerType && d.trainerType && d.trainerType.toLowerCase() !== trainerType.toLowerCase()) {
            return null;
          }

          // Extract best available TCGPlayer price
          const tp = d.pricing?.tcgplayer;
          let bestPrice: number | null = null;
          if (tp) {
            const candidates = [
              tp.normal?.marketPrice || tp.normal?.lowPrice,
              tp.holofoil?.marketPrice || tp.holofoil?.lowPrice,
              tp.reverseHolofoil?.marketPrice || tp.reverseHolofoil?.lowPrice
            ].filter((p): p is number => typeof p === 'number' && p > 0);
            if (candidates.length > 0) {
              bestPrice = Math.min(...candidates);
            }
          }

          const imageBase = d.image || item.image;
          const imageUrl = imageBase ? `${imageBase}/high.webp` : '';
          const tcgId = d.variants_detailed?.[0]?.thirdParty?.tcgplayer
            ? String(d.variants_detailed[0].thirdParty.tcgplayer)
            : undefined;

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
            game: 'pokemon' as const
          };
        } catch {
          if (trainerType) return null;
          const imageBase = item.image;
          const imageUrl = imageBase ? `${imageBase}/high.webp` : '';
          return {
            id: item.id,
            name: item.name,
            setName: 'Pokémon TCG',
            set_name: 'Pokémon TCG',
            image: imageUrl,
            imageUrl: imageUrl,
            price: null,
            number: item.localId,
            game: 'pokemon' as const
          };
        }
      })
    );

    return detailed
      .filter((r): r is PromiseFulfilledResult<SearchCardResult | null> => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((card): card is SearchCardResult => card !== null)
      .slice(0, limit);
  } catch (error) {
    console.error('TCGdex search error:', error);
    return [];
  }
}

export async function getTcgdexSets(): Promise<SetInfo[]> {
  try {
    const res = await fetch(`${TCGDEX_BASE}/sets`, {
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
