import { NextResponse } from 'next/server';
import { searchEbay } from '../utils/ebay'; 
import { searchTcgdexCards } from '@/lib/tcgdex';

export async function POST(request: Request) {
  try {
    const { cards } = await request.json(); 
    const API_KEY = process.env.JUSTTCG_API_KEY;

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const isEbayOnly = cards[0].ebayOnly === true;
    const game: string = cards[0]?.game || 'pokemon';
    console.log(`?? Request mode: ${isEbayOnly ? 'eBay Only' : 'Full Update'} | Game: ${game}`);

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

      // 2. Batch fetch missing cards by name
      const missingCards = cards.filter((c: any) => {
        const found = tcgData.data?.find((d: any) => String(d.id) === String(c.id));
        return !found && c.grade === "Raw (Ungraded)";
      });

      if (missingCards.length > 0) {
        try {
          const uniqueNames: string[] = [...new Set(missingCards.map((c: any) => String(c.name)))] as string[];
          const searchPromises = uniqueNames.map(async (name: string) => {
            const cleanQuery = encodeURIComponent(name);
            const justTcgGame = game === 'onepiece' ? 'one-piece-card-game' : game;
            const searchRes = await fetch(`https://api.justtcg.com/v1/cards?q=${cleanQuery}&game=${justTcgGame}&limit=20`, { 
              headers: { 'x-api-key': API_KEY } 
            });
            if (searchRes.ok) {
              const searchData = await searchRes.json();
              return { name, results: searchData.data || [] };
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const game = searchParams.get('game') || 'pokemon';
    const API_KEY = process.env.JUSTTCG_API_KEY;

    if (!q.trim()) {
      return NextResponse.json({ data: [] });
    }

    // 1. For Pokemon, first try TCGdex (Free, no rate limits, includes 30th & Delta Reign sets)
    if (game === 'pokemon') {
      try {
        const tcgdexResults = await searchTcgdexCards(q, 24);
        if (tcgdexResults.length > 0) {
          return NextResponse.json({ data: tcgdexResults, source: 'tcgdex' });
        }
      } catch (tcgErr) {
        console.warn('TCGdex fallback triggered:', tcgErr);
      }
    }

    // 2. Fallback / One Piece: Query JustTCG
    if (API_KEY) {
      const justTcgGame = game === 'onepiece' ? 'one-piece-card-game' : game;
      const response = await fetch(
        `https://api.justtcg.com/v1/cards?game=${justTcgGame}&limit=24&q=${encodeURIComponent(q)}`,
        { headers: { 'x-api-key': API_KEY } }
      );
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ data: data.data || [], source: 'justtcg' });
      }
    }

    return NextResponse.json({ data: [] });
  } catch (error) { 
    return NextResponse.json({ error: 'Server Error', details: String(error) }, { status: 500 }); 
  }
}
