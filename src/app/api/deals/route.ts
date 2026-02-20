import { NextResponse } from 'next/server';

const EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_BROWSE_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

// ---- In-memory token cache ----
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

// ---- In-memory result cache (shared across concurrent requests) ----
const resultCache: Record<string, { data: any[]; expiresAt: number }> = {};
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// ---- In-flight deduplication: if a fetch is already in progress for a key,
//      subsequent requests await the same promise instead of firing a new eBay call ----
const inFlight: Map<string, Promise<any[]>> = new Map();

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
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });
    const data = await res.json();
    if (data.error) {
      console.error('eBay Token Error:', data);
      return null;
    }
    cachedToken = data.access_token;
    // eBay tokens last 7200s; refresh 60s early to be safe
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return cachedToken;
  } catch (err) {
    console.error('eBay Auth Error:', err);
    return null;
  }
}

function formatTimeLeft(endDate: Date): string | null {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  // Filter out anything ending in less than 2 minutes
  if (diff < 2 * 60 * 1000) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days >= 1) return `${days}d ${hours}h`;
  if (hours >= 1) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || '10s';

  const game = searchParams.get('game') || 'pokemon';
  const isOnePiece = game === 'onepiece';

  // Build query per section
  let query = '';
  if (isOnePiece) {
    switch (type) {
      case '10s':
        query = 'graded 10 one piece card';
        break;
      case 'blacklabel':
        query = 'graded one piece card pristine';
        break;
      case '9s':
        query = 'graded 9 one piece card';
        break;
      default:
        query = 'graded 10 one piece card';
    }
  } else {
    switch (type) {
      case '10s':
        query = 'graded 10 pokemon cards';
        break;
      case 'blacklabel':
        query = 'graded pokemon cards pristine';
        break;
      case '9s':
        query = 'graded 9 pokemon cards';
        break;
      default:
        query = 'graded 10 pokemon cards';
    }
  }

  const token = await getEbayToken();
  if (!token) {
    return NextResponse.json({ error: 'eBay authentication failed' }, { status: 500 });
  }

  // 1. Serve fresh cache immediately
  const cacheKey = `${type}:${game}`;
  const cached = resultCache[cacheKey];
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json({ data: cached.data });
  }

  // 2. If another request is already fetching this key, wait for it instead of hitting eBay again
  if (inFlight.has(cacheKey)) {
    try {
      const data = await inFlight.get(cacheKey)!;
      return NextResponse.json({ data });
    } catch {
      return NextResponse.json({ data: cached?.data ?? [] });
    }
  }

  // 3. We are the first — build and register the fetch promise
  const fetchPromise = (async (): Promise<any[]> => {
  try {
    // Fetch 50 results sorted by ending soonest, auctions only
    const url = `${EBAY_BROWSE_URL}?q=${encodeURIComponent(query)}&limit=50&sort=endingSoonest&filter=buyingOptions:{AUCTION},itemLocationCountry:US`;

    // Retry once on 429 after a short delay
    let res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' },
      next: { revalidate: 0 },
    });

    if (res.status === 429) {
      console.log(`[deals] 429 for ${cacheKey}, retrying in 1.5s…`);
      await new Promise(r => setTimeout(r, 1500));
      // Re-fetch fresh token in case it expired
      const freshToken = await getEbayToken();
      if (freshToken) {
        res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${freshToken}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' },
          next: { revalidate: 0 },
        });
      }
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error('eBay Browse API error:', errText);
      // Return whatever stale data exists (check live cache, not the captured snapshot)
      return resultCache[cacheKey]?.data ?? [];
    }

    const data = await res.json();
    const items: any[] = data.itemSummaries || [];

    const goodItems: any[] = [];
    const zeroItems: any[] = []; // $0 price but valid time — need retry

    // Title-based post-filter (case-insensitive)
    const blacklistAll = ['sleeves', 'guards', 'mystery', 'topps'];
    const blacklistBlackLabel = ['psa 9', 'psa 8', 'cgc 9', 'cgc 8', 'topps'];
    const titleBanned = (title: string): boolean => {
      const t = title.toLowerCase();
      if (type === 'blacklabel') return blacklistBlackLabel.some(w => t.includes(w));
      return blacklistAll.some(w => t.includes(w));
    };

    for (const item of items) {
      if (!item.itemEndDate) continue;
      if (titleBanned(item.title || '')) continue; // post-filter junk listings
      const endDate = new Date(item.itemEndDate);
      const timeLeft = formatTimeLeft(endDate);
      if (!timeLeft) continue; // ending in <2 min

      const price = parseFloat(item.price?.value || '0');
      if (price > 0) {
        goodItems.push({
          id: item.itemId,
          title: item.title,
          price: price.toFixed(2),
          currency: item.price?.currency || 'USD',
          timeLeft,
          endDate: item.itemEndDate,
          link: item.itemWebUrl,
          image: item.image?.imageUrl || '',
        });
      } else if (zeroItems.length < 20) {
        // Queue for individual price retry
        zeroItems.push({ item, timeLeft });
      }
    }

    // Retry $0 listings in parallel (instead of sequentially)
    const retrySettled = await Promise.allSettled(
      zeroItems.map(async ({ item, timeLeft }) => {
        const itemRes = await fetch(
          `${EBAY_BROWSE_URL.replace('/item_summary/search', '')}/item/${item.itemId}`,
          { headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' } }
        );
        if (!itemRes.ok) return null;
        const itemData = await itemRes.json();
        const retryPrice = parseFloat(
          itemData.currentBidPrice?.value ||
          itemData.price?.value ||
          '0'
        );
        if (retryPrice <= 0) return null;
        return {
          id: item.itemId,
          title: item.title,
          price: retryPrice.toFixed(2),
          currency: itemData.currentBidPrice?.currency || 'USD',
          timeLeft,
          endDate: item.itemEndDate,
          link: item.itemWebUrl,
          image: item.image?.imageUrl || itemData.image?.imageUrl || '',
        };
      })
    );

    for (const result of retrySettled) {
      if (result.status === 'fulfilled' && result.value) {
        goodItems.push(result.value);
      }
    }

    const filtered = goodItems
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 20);

    // Populate cache so concurrent/repeat requests skip eBay
    resultCache[cacheKey] = { data: filtered, expiresAt: Date.now() + CACHE_TTL_MS };
    return filtered;
  } catch (err) {
    console.error('Deals API error:', err);
    // Return stale data on any error rather than an empty failure
    return resultCache[cacheKey]?.data ?? [];
  } finally {
    inFlight.delete(cacheKey);
  }
  })();

  inFlight.set(cacheKey, fetchPromise);

  try {
    const data = await fetchPromise;
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: resultCache[cacheKey]?.data ?? [] });
  }
}
