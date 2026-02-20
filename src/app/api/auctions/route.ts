import { NextResponse } from 'next/server';

const EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_BROWSE_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

async function getEbayToken() {
  const auth = Buffer.from(`${process.env.EBAY_APP_ID}:${process.env.EBAY_CERT_ID}`).toString('base64');
  try {
    const res = await fetch(EBAY_OAUTH_URL, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });
    const data = await res.json();
    return data.access_token;
  } catch (error) { return null; }
}

export async function POST(request: Request) {
  try {
    const { cards, category, customGrade } = await request.json();
    const token = await getEbayToken();
    if (!token) return NextResponse.json({ error: "eBay Auth Failed" }, { status: 500 });

    const auctions: any[] = [];

    // Process sequentially to protect API limits
    for (const card of cards) {
      const cleanSet = card.set_name ? card.set_name.replace(/-/g, ' ').replace('pokemon', '').trim() : "";
      const baseQuery = cleanSet ? `${card.name} ${cleanSet}` : card.name;
      
      let gradeQuery = "";
      if (category === "NM") gradeQuery = "Near Mint -PSA -CGC -BGS -TAG -graded -slab";
      else if (category === "10s") gradeQuery = "(PSA 10, CGC 10, BGS 10, TAG 10)";
      else if (category === "BlackLabel") gradeQuery = "(BGS 10 Black Label, CGC 10 Pristine)";
      else if (category === "9s") gradeQuery = "(PSA 9, CGC 9, BGS 9, TAG 9)";
      else if (category === "Custom") gradeQuery = `(PSA ${customGrade}, CGC ${customGrade}, BGS ${customGrade})`;

      const finalQuery = `${baseQuery} ${gradeQuery}`;

      try {
        // Fetch up to 10 active auctions for this specific card
        const activeRes = await fetch(`${EBAY_BROWSE_URL}?q=${encodeURIComponent(finalQuery)}&limit=10&filter=buyingOptions:{AUCTION}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' }
        });

        if (activeRes.ok) {
            const activeData = await activeRes.json();
            if (activeData.itemSummaries && activeData.itemSummaries.length > 0) {
                
                // eBay Browse API doesn't natively sort by "Ending Soonest", so we do it manually in Javascript
                const sortedAuctions = activeData.itemSummaries
                    .filter((item: any) => item.itemEndDate)
                    .sort((a: any, b: any) => new Date(a.itemEndDate).getTime() - new Date(b.itemEndDate).getTime());

                if (sortedAuctions.length > 0) {
                    const endingSoonest = sortedAuctions[0];
                    const currentBid = parseFloat(endingSoonest.price.value);
                    const endDate = new Date(endingSoonest.itemEndDate);
                    const now = new Date();
                    const timeDiff = endDate.getTime() - now.getTime();
                    
                    // Format the countdown timer
                    let timeLeft = "Ending very soon";
                    if (timeDiff > 0) {
                        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                        if (hours >= 24) {
                            timeLeft = `${Math.floor(hours / 24)}d ${hours % 24}h left`;
                        } else if (hours > 0) {
                            timeLeft = `${hours}h ${minutes}m left`;
                        } else {
                            timeLeft = `${minutes}m left`;
                        }
                    }

                    auctions.push({
                        cardName: card.name,
                        title: endingSoonest.title,
                        price: currentBid.toFixed(2),
                        timeLeft: timeLeft,
                        link: endingSoonest.itemWebUrl,
                        image: endingSoonest.image?.imageUrl || card.image
                    });
                }
            }
        }
      } catch (err) { console.error(`Auction scan failed for ${card.name}`); }
      
      // Delay to respect eBay rate limits
      await new Promise(r => setTimeout(r, 500)); 
    }

    return NextResponse.json({ data: auctions });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}