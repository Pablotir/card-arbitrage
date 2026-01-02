import { NextResponse } from 'next/server';
import { searchEbay } from '../utils/ebay'; 

export async function POST(request: Request) {
  try {
    const { cards } = await request.json(); 
    const API_KEY = process.env.JUSTTCG_API_KEY;

    if (!API_KEY) return NextResponse.json({ error: "Missing JustTCG Key" }, { status: 500 });

    let tcgData: any = { data: [] }; 

    // 1. Try Batch Fetch
    try {
      const batchPayload = { items: cards.map((c: any) => ({ cardId: c.id })) };
      const tcgResponse = await fetch('https://api.justtcg.com/v1/cards/batch', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(batchPayload),
      });
      if (tcgResponse.ok) tcgData = await tcgResponse.json();
    } catch (e) { console.error("Batch Error:", e); }

    // 2. Process Cards
    const results = await Promise.all(cards.map(async (userCard: any) => {
      let tcgPrice = Infinity;
      let tcgLink = "";  // <--- Changed: Separate variable

      let ebayPrice = Infinity;
      let ebayLink = ""; // <--- Changed: Separate variable

      let bestLink = "";
      let bestSource = "Checking...";

      // A. JustTCG Lookup (Fail-Safe)
      if (userCard.grade === "Raw (Ungraded)") {
        let match = tcgData.data?.find((d: any) => String(d.id) === String(userCard.id));

        if (!match) {
            try {
                // STRATEGY: Search by Name (Our working fail-safe)
                const cleanQuery = encodeURIComponent(userCard.name);
                const searchUrl = `https://api.justtcg.com/v1/cards?q=${cleanQuery}&game=pokemon&limit=5`;
                const searchRes = await fetch(searchUrl, { headers: { 'x-api-key': API_KEY } });
                
                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    const candidates = searchData.data || [];
                    if (candidates.length > 0) {
                        // Priority: ID Match -> Name Match -> First Result
                        match = candidates.find((d: any) => d.id === userCard.id);
                        if (!match) {
                             const targetName = userCard.name.toLowerCase();
                             match = candidates.find((d: any) => d.name.toLowerCase().includes(targetName));
                        }
                        if (!match && candidates[0].name.toLowerCase().includes(userCard.name.split(" ")[0].toLowerCase())) {
                             match = candidates[0];
                        }
                    }
                } 
            } catch (err) { console.error("Fail-Safe Network Error"); }
        }

        // Pricing Logic
        if (match && match.variants) {
            // Priority: NM -> LP -> MP -> Cheapest
            let variant = match.variants.find((v: any) => v.condition && v.condition.includes("Near Mint"));
            if (!variant) variant = match.variants.find((v: any) => v.condition && v.condition.includes("Lightly Played"));
            if (!variant) variant = match.variants.find((v: any) => v.condition && v.condition.includes("Moderately Played"));
            
            if (!variant && match.variants.length > 0) {
                 const playable = match.variants.filter((v:any) => !v.condition.includes("Damaged"));
                 const pool = playable.length > 0 ? playable : match.variants;
                 variant = pool.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))[0];
            }

            if (variant && variant.price) {
                tcgPrice = parseFloat(variant.price);
                tcgLink = `https://www.tcgplayer.com/product/${match.tcgplayerId || ""}`; // Store specifically in tcgLink
            }
        }
      }

      // B. eBay Lookup
      try {
        const ebayResult = await searchEbay(userCard.name, userCard.set, userCard.grade, userCard.isFirstEdition);
        if (ebayResult && ebayResult.price) {
            ebayPrice = parseFloat(String(ebayResult.price));
            ebayLink = ebayResult.link || ""; // <--- Store specifically in ebayLink
        }
      } catch (e) { console.error("eBay error"); }

      // C. Compare (The Fix)
      let finalPrice = "N/A";

      if (ebayPrice < tcgPrice && ebayPrice !== Infinity) {
        finalPrice = ebayPrice.toFixed(2);
        bestSource = "eBay";
        bestLink = ebayLink; // <--- Correctly assign eBay Link
      } else if (tcgPrice !== Infinity) {
        finalPrice = tcgPrice.toFixed(2);
        bestSource = "TCGPlayer";
        bestLink = tcgLink; // <--- Correctly assign TCG Link
      } else {
        bestSource = "Not Found";
      }

      return {
        id: userCard.id,
        livePrice: finalPrice,
        bestSource: bestSource,
        bestLink: bestLink
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
    if (!API_KEY) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    const response = await fetch(`https://api.justtcg.com/v1/cards?game=pokemon&limit=20&q=${q}`, { headers: { 'x-api-key': API_KEY } });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}