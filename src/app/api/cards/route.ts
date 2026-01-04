import { NextResponse } from 'next/server';
import { searchEbay } from '../utils/ebay'; 

export async function POST(request: Request) {
  try {
    const { cards } = await request.json(); 
    const API_KEY = process.env.JUSTTCG_API_KEY;

    if (!API_KEY) return NextResponse.json({ error: "Missing JustTCG Key" }, { status: 500 });

    let tcgData: any = { data: [] }; 

    // 1. Batch Fetch
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

    // 2. Process Cards
    const results = await Promise.all(cards.map(async (userCard: any) => {
      let tcgPrice = Infinity;
      let tcgLink = "";
      let ebayPrice = Infinity;
      let ebayLink = "";
      let bestLink = "";
      let bestSource = "Checking...";

      // --- A. JustTCG Lookup ---
      if (userCard.grade === "Raw (Ungraded)") {
        let match = tcgData.data?.find((d: any) => String(d.id) === String(userCard.id));

        if (!match) {
            try {
                if (userCard.id && String(userCard.id).length > 4) {
                    const directRes = await fetch(`https://api.justtcg.com/v1/cards/${userCard.id}`, { 
                        headers: { 'x-api-key': API_KEY } 
                    });
                    if (directRes.ok) {
                        const directData = await directRes.json();
                        match = directData.data || directData; 
                    }
                }
                if (!match) {
                    const cleanQuery = encodeURIComponent(userCard.name);
                    const searchRes = await fetch(`https://api.justtcg.com/v1/cards?q=${cleanQuery}&game=pokemon&limit=20`, { headers: { 'x-api-key': API_KEY } });
                    if (searchRes.ok) {
                        const searchData = await searchRes.json();
                        const candidates = searchData.data || [];
                        if (candidates.length > 0) {
                            if (userCard.set) {
                                const userSet = userCard.set.toLowerCase();
                                match = candidates.find((d: any) => {
                                    if (!d.setName) return false;
                                    const apiSet = d.setName.toLowerCase();
                                    return d.name.toLowerCase().includes(userCard.name.toLowerCase()) &&
                                           (userSet.includes(apiSet) || apiSet.includes(userSet));
                                });
                            }
                            if (!match) match = candidates.find((d: any) => d.name.toLowerCase() === userCard.name.toLowerCase());
                        }
                    } 
                }
            } catch (err) { console.error(`Fail-Safe Error`); }
        }

        if (match && match.variants) {
            const getPriorityPrice = (v: any) => {
                const listing = parseFloat(v.lowPrice) || parseFloat(v.listingPrice) || parseFloat(v.directLowPrice);
                if (listing > 0) return listing;
                return parseFloat(v.price) || Infinity;
            };

            // STRICT FIX: Only filter for "Near Mint"
            // We removed "Lightly Played" to prevent the $38.68 LP price from appearing
            const validVariants = match.variants.filter((v: any) => 
                v.condition && v.condition.toLowerCase().includes("near mint")
            );
            
            validVariants.sort((a: any, b: any) => getPriorityPrice(a) - getPriorityPrice(b));
            
            // If we have a NM variant, pick the cheapest one.
            let chosenVariant = validVariants.length > 0 ? validVariants[0] : null;

            // Note: We REMOVED the fallback that grabs "any non-damaged card".
            // If TCGPlayer has no Near Mint copies, it will return Infinity,
            // which correctly forces the app to look at eBay instead.

            if (chosenVariant) {
                tcgPrice = getPriorityPrice(chosenVariant);
                const correctId = match.tcgplayerId || match.id;
                tcgLink = `https://www.tcgplayer.com/product/${correctId}`; 
            }
        }
      }

      // --- B. eBay Lookup ---
      try {
        // STRICT FIX: Ensure Set Name is strictly passed
        // We trim the string to avoid any whitespace issues that might confuse the search
        const searchSet = (userCard.set && !userCard.set.toLowerCase().includes("unknown")) 
            ? userCard.set.trim() 
            : "";
        
        console.log(`🔍 Card: ${userCard.name} | Set from payload: "${userCard.set}" | Clean Set: "${searchSet}"`);
            
        const ebayResult = await searchEbay(userCard.name, searchSet, userCard.grade, userCard.isFirstEdition);
        
        if (ebayResult && ebayResult.price) {
            ebayPrice = parseFloat(String(ebayResult.price));
            ebayLink = ebayResult.link || "";
            console.log(`✅ eBay Result: $${ebayPrice} | Link: ${ebayLink}`);
        }
      } catch (e) { console.error("eBay error"); }

      // --- C. Source Decision ---
      // Decide Best Source (TCGPlayer vs eBay)
      if (tcgPrice !== Infinity) {
        bestSource = "TCGPlayer";
      } else if (ebayPrice !== Infinity) {
        bestSource = "eBay";
      } else {
        bestSource = "";
      }
      
      // Override: If eBay is cheaper than TCGPlayer, use eBay
      if (ebayPrice < tcgPrice && ebayPrice !== Infinity) {
          bestSource = "eBay";
      }

      return {
        id: userCard.id,
        bestSource: bestSource,
        // Send BOTH prices back
        tcgPrice: tcgPrice === Infinity ? null : tcgPrice.toFixed(2),
        tcgLink: tcgLink,
        ebayPrice: ebayPrice === Infinity ? null : ebayPrice.toFixed(2),
        ebayLink: ebayLink
      };
    }));

    return NextResponse.json({ data: results });

  } catch (error) {
    return NextResponse.json({ error: 'Update failed', details: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');
        const API_KEY = process.env.JUSTTCG_API_KEY;
        const response = await fetch(`https://api.justtcg.com/v1/cards?game=pokemon&limit=20&q=${q}`, { headers: { 'x-api-key': API_KEY || "" } });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) { return NextResponse.json({ error: 'Server Error' }, { status: 500 }); }
}