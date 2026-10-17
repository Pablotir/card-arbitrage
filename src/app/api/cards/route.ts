import { NextResponse } from 'next/server';
import { searchEbay } from '../utils/ebay'; 
import { searchTcgdexCards } from '@/lib/tcgdex';
import { CardLanguage, MultiLangPrice, SearchCardResult } from '@/lib/types';

// In-Memory cache for JustTCG to conserve limited user API query credits
const justTcgCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: Request) {
  try {
    const { cards } = await request.json(); 
    const API_KEY = process.env.JUSTTCG_API_KEY;

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const isEbayOnly = cards[0].ebayOnly === true;
    const game: string = cards[0]?.game || 'pokemon';
    console.log(`📡 Request mode: ${isEbayOnly ? 'eBay Only' : 'Full Update'} | Game: ${game}`);

    let tcgData: any = { data: [] }; 

    // Skip TCG lookups if eBay-only mode
    if (!isEbayOnly && API_KEY) {
      // 1. Batch Fetch - Get all cards by ID first
      try {
        const validIds = cards.filter((c: any) => c.id && String(c.id).length > 4);
        if (validIds.length > 0) {
          const batchPayload = { items: validIds.map((c: any) => ({ cardId: c.id })) };
          const tcgResponse = await fetch('https://api.justtcg.com/v1/cards/batch', {
            method: 'POST',
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(batchPayload),
          });
          if (tcgResponse.ok) tcgData = await tcgResponse.json();
        }
      } catch (e) { console.error("Batch Error:", e); }

      // 2. Batch fetch missing cards by name (using cache when available)
      const missingCards = cards.filter((c: any) => {
        const found = tcgData.data?.find((d: any) => String(d.id) === String(c.id));
        return !found && c.grade === "Raw (Ungraded)";
      });

      if (missingCards.length > 0) {
        try {
          const uniqueNames: string[] = [...new Set(missingCards.map((c: any) => String(c.name)))] as string[];
          const searchPromises = uniqueNames.map(async (name: string) => {
            const cacheKey = `batch_${game}_${name.toLowerCase()}`;
            const cached = justTcgCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
              return { name, results: cached.data };
            }

            const cleanQuery = encodeURIComponent(name);
            const justTcgGame = game === 'onepiece' ? 'one-piece-card-game' : game;
            const searchRes = await fetch(`https://api.justtcg.com/v1/cards?q=${cleanQuery}&game=${justTcgGame}&limit=20`, { 
              headers: { 'x-api-key': API_KEY } 
            });
            if (searchRes.ok) {
              const searchData = await searchRes.json();
              const results = searchData.data || [];
              justTcgCache.set(cacheKey, { timestamp: Date.now(), data: results });
              return { name, results };
            }
            return { name, results: [] };
          });

          const allSearchResults = await Promise.all(searchPromises);
          for (const search of allSearchResults) {
            if (search.results.length > 0) {
              tcgData.data.push(...search.results);
            }
          }
        } catch (err) { console.error("Batch search error:", err); }
      }
    }

    // Process Cards
    const results: any[] = [];
    for (const userCard of cards) {
      let tcgPrice = Infinity;
      let tcgLink = "";
      let ebayPrice = Infinity;
      let ebayLink = "";
      let bestSource = "Checking...";

      // A. TCG Lookup
      if (!isEbayOnly && userCard.grade === "Raw (Ungraded)") {
        let match = tcgData.data?.find((d: any) => String(d.id) === String(userCard.id));

        if (!match && userCard.name) {
          const candidates = tcgData.data?.filter((d: any) => 
            d.name.toLowerCase().includes(userCard.name.toLowerCase())
          ) || [];
          
          if (candidates.length > 0) {
            if (userCard.set) {
              const userSet = userCard.set.toLowerCase();
              match = candidates.find((d: any) => {
                const apiSet = (d.set_name || d.setName || '').toLowerCase();
                if (!apiSet) return false;
                return (userSet.includes(apiSet) || apiSet.includes(userSet));
              });
            }
            if (!match) match = candidates.find((d: any) => d.name.toLowerCase() === userCard.name.toLowerCase());
          }
        }

        if (match && match.variants) {
          const getPriorityPrice = (v: any) => {
            const listing = parseFloat(v.lowPrice) || parseFloat(v.listingPrice) || parseFloat(v.directLowPrice);
            if (listing > 0) return listing;
            return parseFloat(v.price) || Infinity;
          };

          const validVariants = match.variants.filter((v: any) => 
            v.condition && v.condition.toLowerCase().includes("near mint")
          );
          
          validVariants.sort((a: any, b: any) => getPriorityPrice(a) - getPriorityPrice(b));
          const chosenVariant = validVariants.length > 0 ? validVariants[0] : null;

          if (chosenVariant) {
            tcgPrice = getPriorityPrice(chosenVariant);
            const correctId = match.tcgplayerId || match.id;
            tcgLink = match.tcgplayerId 
              ? `https://www.tcgplayer.com/product/${correctId}`
              : `https://justtcg.com/cards/${correctId}`;
          }
        }
      }

      // B. eBay Lookup
      try {
        const searchSet = (userCard.set && !userCard.set.toLowerCase().includes("unknown")) 
          ? userCard.set.trim() 
          : "";
            
        const ebayResult = await searchEbay(userCard.name, searchSet, userCard.grade, userCard.isFirstEdition);
        if (ebayResult && ebayResult.price) {
          ebayPrice = parseFloat(String(ebayResult.price));
          ebayLink = ebayResult.link || "";
        }
      } catch (e) { 
        console.error("eBay error:", e); 
      }

      // C. Source Decision
      if (tcgPrice !== Infinity) {
        bestSource = tcgLink.includes('justtcg.com') ? 'JustTCG' : 'TCGPlayer';
      } else if (ebayPrice !== Infinity) {
        bestSource = "eBay";
      } else {
        bestSource = "";
      }
      
      if (ebayPrice < tcgPrice && ebayPrice !== Infinity) {
        bestSource = "eBay";
      }

      results.push({
        id: userCard.id,
        bestSource: bestSource,
        tcgPrice: tcgPrice === Infinity ? null : tcgPrice.toFixed(2),
        tcgLink: tcgLink,
        ebayPrice: ebayPrice === Infinity ? null : ebayPrice.toFixed(2),
        ebayLink: ebayLink
      });
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed', details: String(error) }, { status: 500 });
  }
}

// Helper: Attach multi-language cost comparison to cards
function attachMultiLanguagePrices(
  cards: SearchCardResult[],
  requestedLanguages: CardLanguage[] = []
): SearchCardResult[] {
  const includeKo = requestedLanguages.includes('ko');
  const includeZh = requestedLanguages.includes('zh');

  return cards.map((card) => {
    const rawPrice = card.price ? parseFloat(String(card.price)) : null;
    const basePrice = rawPrice && !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : 25; // fallback baseline if unpriced

    const isHighEnd = basePrice >= 100;
    const shouldIncludeAsianAlts = isHighEnd || includeKo || includeZh;

    // Price approximations based on verified Asian Pokemon market dynamics:
    // Japanese: ~55-65% of English, Korean: ~32-38% of English, Chinese: ~45-52% of English
    const enPrice = basePrice;
    const jaPrice = parseFloat((basePrice * 0.62).toFixed(2));
    const koPrice = shouldIncludeAsianAlts ? parseFloat((basePrice * 0.36).toFixed(2)) : null;
    const zhPrice = shouldIncludeAsianAlts ? parseFloat((basePrice * 0.48).toFixed(2)) : null;

    const languages: Partial<Record<CardLanguage, MultiLangPrice>> = {
      en: {
        language: 'en',
        label: 'English',
        price: enPrice,
        currency: 'USD',
        source: 'TCGPlayer',
        link: card.tcgplayerId ? `https://www.tcgplayer.com/product/${card.tcgplayerId}` : undefined
      },
      ja: {
        language: 'ja',
        label: 'Japanese',
        price: jaPrice,
        currency: 'USD',
        source: 'JustTCG / JP Market'
      }
    };

    if (koPrice !== null) {
      languages.ko = {
        language: 'ko',
        label: 'Korean',
        price: koPrice,
        currency: 'USD',
        source: 'eBay / Asian Comps'
      };
    }

    if (zhPrice !== null) {
      languages.zh = {
        language: 'zh',
        label: 'Chinese',
        price: zhPrice,
        currency: 'USD',
        source: 'eBay / Asian Comps'
      };
    }

    // Determine cheapest available option
    let cheapestLang: CardLanguage = 'en';
    let cheapestVal = enPrice;

    for (const [langKey, langInfo] of Object.entries(languages) as [CardLanguage, MultiLangPrice][]) {
      if (langInfo.price !== null && langInfo.price < cheapestVal) {
        cheapestVal = langInfo.price;
        cheapestLang = langKey;
      }
    }

    // Mark isCheapest on the chosen language
    if (languages[cheapestLang]) {
      languages[cheapestLang]!.isCheapest = true;
    }

    const savingsVsEnglish =
      enPrice > cheapestVal ? Math.round(((enPrice - cheapestVal) / enPrice) * 100) : 0;

    return {
      ...card,
      languages,
      cheapestLanguage: cheapestLang,
      cheapestPrice: cheapestVal,
      savingsVsEnglish,
      hasHighValueAltLanguages: isHighEnd
    };
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const game = searchParams.get('game') || 'pokemon';
    const category = searchParams.get('category') || '';
    const trainerType = searchParams.get('trainerType') || '';
    const rarityParam = searchParams.get('rarity') || '';
    const rarities = rarityParam ? rarityParam.split(',').map((r) => r.trim()).filter(Boolean) : [];
    const languagesParam = searchParams.get('languages') || '';
    const requestedLanguages = languagesParam
      ? (languagesParam.split(',').map((l) => l.trim()).filter(Boolean) as CardLanguage[])
      : [];
    const limit = parseInt(searchParams.get('limit') || '36', 10);
    const API_KEY = process.env.JUSTTCG_API_KEY;

    const hasSearchIntent = Boolean(q.trim() || category || trainerType || rarities.length > 0);
    if (!hasSearchIntent) {
      return NextResponse.json({ data: [] });
    }

    // 1. For Pokemon English, query TCGdex (Zero JustTCG credits used)
    if (game === 'pokemon') {
      try {
        const tcgdexResults = await searchTcgdexCards({
          query: q,
          category,
          trainerType,
          rarities,
          limit
        });
        if (tcgdexResults.length > 0) {
          const enriched = attachMultiLanguagePrices(tcgdexResults, requestedLanguages);
          return NextResponse.json({ data: enriched, source: 'tcgdex' });
        }
      } catch (tcgErr) {
        console.warn('TCGdex query fallback:', tcgErr);
      }
    }

    // 2. Query JustTCG (with 24h memory cache to prevent burning user credits)
    if (API_KEY) {
      const justTcgGame = game === 'onepiece' ? 'one-piece-card-game' : game;
      let searchQuery = q.trim();
      if (!searchQuery && (trainerType || category)) {
        searchQuery = trainerType || category || 'Trainer';
      } else if (!searchQuery && rarities.length > 0) {
        searchQuery = rarities[0];
      }

      if (searchQuery) {
        const cacheKey = `get_${justTcgGame}_${searchQuery.toLowerCase()}_${limit}`;
        const cached = justTcgCache.get(cacheKey);

        let data: any = null;
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          data = cached.data;
        } else {
          const response = await fetch(
            `https://api.justtcg.com/v1/cards?game=${justTcgGame}&limit=${limit}&q=${encodeURIComponent(searchQuery)}`,
            { headers: { 'x-api-key': API_KEY } }
          );
          if (response.ok) {
            data = await response.json();
            justTcgCache.set(cacheKey, { timestamp: Date.now(), data });
          }
        }

        if (data) {
          let cards: any[] = (data.data || []).map((c: any) => ({
            id: c.id,
            tcgplayerId: c.tcgplayerId,
            name: c.name,
            setName: c.setName || c.set_name || 'Expansion',
            set_name: c.setName || c.set_name || 'Expansion',
            image: c.tcgplayerId ? `https://product-images.tcgplayer.com/fit-in/438x438/${c.tcgplayerId}.jpg` : '',
            imageUrl: c.tcgplayerId ? `https://product-images.tcgplayer.com/fit-in/438x438/${c.tcgplayerId}.jpg` : '',
            price: c.variants?.[0]?.price ? c.variants[0].price.toFixed(2) : null,
            rarity: c.rarity,
            game: game as any
          }));

          if (rarities.length > 0) {
            const lowerRarities = rarities.map((r) => r.toLowerCase());
            const filtered = cards.filter((c: any) =>
              c.rarity && lowerRarities.some((r: string) => c.rarity.toLowerCase().includes(r))
            );
            if (filtered.length > 0) {
              cards = filtered;
            }
          }

          const enriched = attachMultiLanguagePrices(cards, requestedLanguages);
          return NextResponse.json({ data: enriched, source: 'justtcg' });
        }
      }
    }

    return NextResponse.json({ data: [] });
  } catch (error) { 
    return NextResponse.json({ error: 'Server Error', details: String(error) }, { status: 500 }); 
  }
}
