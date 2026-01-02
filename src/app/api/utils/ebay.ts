// src/app/api/utils/ebay.ts

const EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

async function getEbayToken() {
  const auth = Buffer.from(`${process.env.EBAY_APP_ID}:${process.env.EBAY_CERT_ID}`).toString('base64');
  
  try {
    const res = await fetch(EBAY_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });

    const data = await res.json();
    if (data.error) {
        console.error("❌ eBay Token Error:", data);
        return null;
    }
    return data.access_token;
  } catch (error) {
    console.error("❌ eBay Auth Network Error:", error);
    return null;
  }
}

export async function searchEbay(cardName: string, set: string, grade: string, isFirstEd: boolean) {
  const token = await getEbayToken();
  if (!token) {
      console.log("⚠️ No eBay Token available. Check .env keys.");
      return { price: null, link: null };
  }

  // CLEANUP: Convert "crown-zenith-pokemon" -> "crown zenith"
  const cleanSet = set.replace(/-/g, ' ').replace('pokemon', '').trim();
  
  // Exclusions to ensure we don't get slabs when looking for raw
  const exclusions = "-PSA -CGC -BGS -graded -slab";

  // BUILD QUERY LIST: We will try these in order
  let queriesToTry: string[] = [];

  if (grade === "Raw (Ungraded)") {
    // --- ATTEMPT 1: Specific (Name + Set + "Near Mint") ---
    let q1 = `${cardName} ${cleanSet} Near Mint`;
    if (isFirstEd) q1 += " 1st edition";
    q1 += ` ${exclusions}`;
    queriesToTry.push(q1);

    // --- ATTEMPT 2: Broad Fallback (Name + "Near Mint" [+ "promo" if needed]) ---
    let q2 = `${cardName} Near Mint`;
    
    // Logic: If the set name implies it's a promo, force "promo" into the search
    // to avoid finding non-promo versions of the card.
    if (set.toLowerCase().includes("promo") || cleanSet.toLowerCase().includes("promo")) {
        q2 += " promo";
    }
    
    if (isFirstEd) q2 += " 1st edition";
    q2 += ` ${exclusions}`;
    queriesToTry.push(q2);

  } else {
    // Graded cards usually need the set name to be accurate
    let q = `${cardName} ${cleanSet} ${grade}`;
    if (isFirstEd) q += " 1st edition";
    queriesToTry.push(q);
  }

  // EXECUTE SEARCH LOOP
  for (const query of queriesToTry) {
    console.log(`🔎 eBay Searching: [${query}]`); 

    const url = `${EBAY_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=3&sort=price&filter=priceCurrency:USD,buyingOptions:{FIXED_PRICE}`; 

    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      });

      const data = await res.json();
      
      // If we found something, RETURN IT immediately (don't run Attempt 2)
      if (data.itemSummaries && data.itemSummaries.length > 0) {
        const cheapest = data.itemSummaries[0];
        console.log(`✅ Found: $${cheapest.price.value} (${cheapest.title})`); 
        return {
          price: cheapest.price.value,
          link: cheapest.itemWebUrl,
          title: cheapest.title
        };
      } else {
        console.log(`⚠️ No results for: ${query}`);
        // Loop continues to next attempt...
      }
    } catch (error) {
      console.error("❌ eBay Search Failed:", error);
    }
  }

  // If loop finishes with no results
  return { price: null, link: null };
}