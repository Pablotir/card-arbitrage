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
  set?: {
    id: string;
    name: string;
    logo?: string;
  };
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

export async function searchTcgdexCards(query: string, limit: number = 24): Promise<SearchCardResult[]> {
  try {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    // Query card list by name
    const res = await fetch(`${TCGDEX_BASE}/cards?name=${encodeURIComponent(cleanQuery)}`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];
    const items: TcgdexCardSummary[] = await res.json();
    if (!Array.isArray(items)) return [];

    const topItems = items.slice(0, limit);

    // Fetch details for top items to extract set names and prices
    const detailed = await Promise.allSettled(
      topItems.map(async (item): Promise<SearchCardResult> => {
        try {
          const detailRes = await fetch(`${TCGDEX_BASE}/cards/${item.id}`, {
            next: { revalidate: 3600 }
          });
          if (!detailRes.ok) throw new Error('Failed to fetch detail');
          const d: TcgdexCardDetail = await detailRes.json();

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

          return {
            id: d.id,
            name: d.name,
            setName: d.set?.name || 'Pokémon TCG',
            set_name: d.set?.name || 'Pokémon TCG',
            image: imageUrl,
            imageUrl: imageUrl,
            price: bestPrice ? bestPrice.toFixed(2) : null,
            rarity: d.rarity,
            number: d.localId,
            game: 'pokemon' as const
          };
        } catch {
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
      .filter((r): r is PromiseFulfilledResult<SearchCardResult> => r.status === 'fulfilled')
      .map(r => r.value);
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
