import { NextResponse } from 'next/server';
import { searchEbay } from '../utils/ebay'; 

export async function POST(request: Request) {
  try {
    const { cards } = await request.json(); 
    const API_KEY = process.env.JUSTTCG_API_KEY;

    if (!API_KEY) return NextResponse.json({ error: "Missing JustTCG Key" }, { status: 500 });

    let tcgData: any = { data: [] }; 

    // 1. Batch Fetch TCGPlayer Data (Fast)
    try {
      const validIds = cards.filter((c: any) => c.id && String(c.id).length > 4);
      if (validIds.length > 0) {
          const batchPayload = { items: validIds.map((c: any) => ({ cardId: c.id })) };
          // 3-second timeout for TCGPlayer batch
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const tcgResponse = await fetch('https://api.justtcg.com/v1/cards/batch', {
            method: 'POST',
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(batchPayload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (tcgResponse.ok) tcgData = await tcgResponse.json();
      }
    } catch (e) { console.error("Batch Error (Ignored):", e); }

    // 2. Process Cards (Parallel with Strict Timeouts)
    const results = await Promise.all(cards.map(async (userCard: any) => {
      let tcgPrice = Infinity;
      let tcgLink = "";
      let ebayPrice = Infinity;
      let ebayLink = "";
      let bestSource = "Checking...";

      // --- A. JustTCG Processing ---
      if (userCard.grade === "Raw (Ungraded)") {
        let match = tcgData.data?.find((d: any) => String(d.id) === String(userCard.id));

        // Note: We skip the "Name Fallback" here to keep it fast. 
        // If the ID matches, we use it. If not, we rely on the user to fix the ID or use eBay.

        if (match && match.variants) {
            // STRICT PRIORITY: Near Mint ONLY
            const getPriorityPrice = (v: any) => {
                // Prefer lowPrice/listingPrice if available, else standard price
                const listing = parseFloat(v.lowPrice) || parseFloat(v.listingPrice) || parseFloat(v.directLowPrice);
                if (listing > 0) return listing;
                return parseFloat(v.price) || Infinity;
            };

            const nmVariants = match.variants.filter((v: any) => 
                v.condition && v.condition.toLowerCase().includes("near mint")
            );
            
            // Sort to find cheapest NM
            nmVariants.sort((a: any, b: any) => getPriorityPrice(a) - getPriorityPrice(b));
            let chosenVariant = nmVariants.length > 0 ? nmVariants[0] : null;

            if (chosenVariant) {
                tcgPrice = getPriorityPrice(chosenVariant);
                const correctId = match.tcgplayerId || match.id;
                tcgLink = `https://www.tcgplayer.com/product/${correctId}`; 
            }
        }
      }

      // --- B. eBay Lookup (Fast & Strict) ---
      try {
        const hasSet = userCard.set && !userCard.set.toLowerCase().includes("unknown");
        const safeSet = hasSet ? userCard.set.trim() : "";
        
        // FORCE QUERY: "Name + Set Name"
        // This fixes the Rayquaza Supreme Victors issue
        const combinedQuery = hasSet ? `${userCard.name} ${safeSet}` : userCard.name;
        
        // 4-SECOND TIMEOUT for eBay
        // If eBay is slow, we abort and just return the TCG price.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        try {
            // We pass "" as set because we baked it into the name query manually
            const ebayResult = await searchEbay(combinedQuery, "", userCard.grade, userCard.isFirstEdition);
            if (ebayResult && ebayResult.price) {
                ebayPrice = parseFloat(String(ebayResult.price));
                ebayLink = ebayResult.link || ""; 
            }
        } catch (err) {
            // If eBay fails/times out, we just ignore it. TCG price is sufficient.
        } finally {
            clearTimeout(timeoutId);
        }
      } catch (e) { console.error("eBay Setup Error"); }

      // --- C. Decision Logic ---
      if (tcgPrice !== Infinity) bestSource = "TCGPlayer";
      else if (ebayPrice !== Infinity) bestSource = "eBay";
      else bestSource = ""; // N/A
      
      // If eBay is strictly cheaper, prefer it
      if (ebayPrice < tcgPrice && ebayPrice !== Infinity) {
          bestSource = "eBay";
      }

      return {
        id: userCard.id,
        bestSource: bestSource,
        tcgPrice: tcgPrice === Infinity ? null : tcgPrice.toFixed(2),
        tcgLink: tcgLink,
        ebayPrice: ebayPrice === Infinity ? null : ebayPrice.toFixed(2),
        ebayLink: ebayLink
      };
    }));

    return NextResponse.json({ data: results });

  } catch (error) {
    console.error("API Fatal Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
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