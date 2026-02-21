// src/app/api/utils/ebay.ts

const EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

// ---- Module-level token cache ----
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

// ---- Module-level result cache (10 min TTL) ----
const RESULT_CACHE_TTL_MS = 10 * 60 * 1000;
const resultCache = new Map<string, { value: any; expiresAt: number }>();

// ---- In-flight deduplication ----
const inFlight = new Map<string, Promise<any>>();

async function getEbayToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

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
    cachedToken = data.access_token;
    // eBay tokens last 7200s; refresh 60s early to be safe
    tokenExpiresAt = Date.now() + ((data.expires_in ?? 7200) - 60) * 1000;
    return cachedToken;
  } catch (error) {
    console.error("❌ eBay Auth Network Error:", error);
    return null;
  }
}

async function _searchEbay(cardName: string, set: string, grade: string, isFirstEd: boolean, token: string) {

  // CLEANUP: Convert "crown-zenith-pokemon" -> "crown zenith"
  let cleanSet = set ? set.replace(/-/g, ' ').replace('pokemon', '').trim() : "";
  
  // If set name includes "promo", substitute with just "promo"
  if (cleanSet && cleanSet.toLowerCase().includes("promo")) {
    cleanSet = "promo";
  }
  
  // Exclusions to ensure we don't get slabs when looking for raw
  const exclusions = "-PSA -CGC -BGS -graded -slab -keychain";

  // BUILD QUERY LIST: We will try these in order
  let queriesToTry: { query: string, isLightlyPlayed: boolean }[] = [];

  if (grade === "Raw (Ungraded)") {
    // Build base query with card name
    const baseQuery = cleanSet ? `${cardName} ${cleanSet}` : cardName;

    // --- ATTEMPT 1: card name (+ set if available), "Near Mint", exclusions ---
    let q1 = `${baseQuery} Near Mint`;
    if (isFirstEd) q1 += " 1st edition";
    q1 += ` ${exclusions}`;
    queriesToTry.push({ query: q1, isLightlyPlayed: false });

    // --- ATTEMPT 2: card name (+ set if available), "NM", exclusions ---
    let q2 = `${baseQuery} NM`;
    if (isFirstEd) q2 += " 1st edition";
    q2 += ` ${exclusions}`;
    queriesToTry.push({ query: q2, isLightlyPlayed: false });

    // --- ATTEMPT 3: card name (+ set if available), "Lightly Played", exclusions ---
    let q3 = `${baseQuery} Lightly Played`;
    if (isFirstEd) q3 += " 1st edition";
    q3 += ` ${exclusions}`;
    queriesToTry.push({ query: q3, isLightlyPlayed: true });

    // --- ATTEMPT 4: card name (+ set if available), "LP", exclusions ---
    let q4 = `${baseQuery} LP`;
    if (isFirstEd) q4 += " 1st edition";
    q4 += ` ${exclusions}`;
    queriesToTry.push({ query: q4, isLightlyPlayed: true });

  } else {
    // Graded cards: Include set name if available
    let q = `${cardName}`;
    if (cleanSet) q += ` ${cleanSet}`;
    q += ` ${grade}`;
    if (isFirstEd) q += " 1st edition";
    queriesToTry.push({ query: q, isLightlyPlayed: false });
  }

  // EXECUTE SEARCH LOOP
  for (const attempt of queriesToTry) {
    console.log(`🔎 eBay Searching: [${attempt.query}]`); 

    const url = `${EBAY_SEARCH_URL}?q=${encodeURIComponent(attempt.query)}&limit=3&sort=price&filter=priceCurrency:USD,buyingOptions:{FIXED_PRICE}`; 

    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      });

      const data = await res.json();
      
      // If we found something, RETURN IT immediately
      if (data.itemSummaries && data.itemSummaries.length > 0) {
        const cheapest = data.itemSummaries[0];
        const warningPrefix = attempt.isLightlyPlayed ? "⚠️ LIGHTLY PLAYED - " : "";
        console.log(`✅ ${warningPrefix}Found: $${cheapest.price.value} (${cheapest.title})`); 
        return {
          price: cheapest.price.value,
          link: cheapest.itemWebUrl,
          title: cheapest.title,
          isLightlyPlayed: attempt.isLightlyPlayed
        };
      } else {
        console.log(`⚠️ No results for: ${attempt.query}`);
        // Loop continues to next attempt...
      }
    } catch (error) {
      console.error("❌ eBay Search Failed:", error);
    }
  }

  // If loop finishes with no results, fallback to TCGPlayer
  console.log("❌ No eBay results found - falling back to TCGPlayer");
  return { price: null, link: null };
}

export async function searchEbay(cardName: string, set: string, grade: string, isFirstEd: boolean) {
  const token = await getEbayToken();
  if (!token) {
    console.log("⚠️ No eBay Token available. Check .env keys.");
    return { price: null, link: null };
  }

  const cacheKey = `${cardName}|${set}|${grade}|${isFirstEd}`;

  // Return cached result if still fresh
  const cached = resultCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`📦 eBay cache hit: ${cacheKey}`);
    return cached.value;
  }

  // Deduplicate in-flight requests for the same key
  const existing = inFlight.get(cacheKey);
  if (existing) {
    console.log(`⏳ eBay in-flight dedup: ${cacheKey}`);
    return existing;
  }

  const promise = _searchEbay(cardName, set, grade, isFirstEd, token).then((result) => {
    resultCache.set(cacheKey, { value: result, expiresAt: Date.now() + RESULT_CACHE_TTL_MS });
    inFlight.delete(cacheKey);
    return result;
  }).catch((err) => {
    inFlight.delete(cacheKey);
    throw err;
  });

  inFlight.set(cacheKey, promise);
  return promise;
}