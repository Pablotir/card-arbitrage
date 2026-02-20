'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ---- DEAL HELPERS (module-level so hooks are stable) ----

function getTimeColor(timeLeft: string): string {
  if (!timeLeft.includes('h') && !timeLeft.includes('d')) {
    const mins = parseInt(timeLeft);
    if (mins < 10) return 'bg-red-100 text-red-700';
    if (mins < 30) return 'bg-orange-100 text-orange-700';
  }
  return 'bg-gray-100 text-gray-600';
}

function DealRow({ items, isLoading }: { items: any[]; isLoading: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const interval = setInterval(() => {
      if (pausedRef.current || !wrapper) return;
      wrapper.scrollLeft += 1;
      if (wrapper.scrollLeft >= wrapper.scrollWidth / 2) wrapper.scrollLeft = 0;
    }, 30);
    return () => clearInterval(interval);
  }, [items]);

  const handleArrow = (dir: 'left' | 'right') => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    if (wrapperRef.current) {
      wrapperRef.current.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' });
    }
    // Resume auto-scroll after 5 seconds of inactivity
    resumeTimerRef.current = setTimeout(() => { pausedRef.current = false; }, 5000);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 text-center text-sm text-gray-400 h-20 flex items-center justify-center">
        {isLoading
          ? <span className="animate-pulse">Loading auctions...</span>
          : <span>No auctions ending soon right now.</span>}
      </div>
    );
  }

  const doubled = [...items, ...items];

  return (
    <div className="relative">
      <button
        onClick={() => handleArrow('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50 transition"
        aria-label="Scroll left"
      >&#8249;</button>
      <div
        ref={wrapperRef}
        className="overflow-x-auto flex gap-3 px-10 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {doubled.map((item: any, i: number) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none w-44 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition p-3 flex flex-col gap-2"
          >
            {item.image
              ? <img src={item.image} alt={item.title} className="w-full h-28 object-contain rounded-lg" />
              : <div className="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Image</div>
            }
            <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight">{item.title}</p>
            <div className="mt-auto flex items-center justify-between gap-1">
              <span className="text-sm font-bold text-blue-600">${item.price}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${getTimeColor(item.timeLeft)}`}>{item.timeLeft}</span>
            </div>
          </a>
        ))}
      </div>
      <button
        onClick={() => handleArrow('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50 transition"
        aria-label="Scroll right"
      >&#8250;</button>
    </div>
  );
}

export default function Home() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('search'); 
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [myList, setMyList] = useState<any[]>([]);       
  const [myCollection, setMyCollection] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // MODAL STATE
  const [purchaseModal, setPurchaseModal] = useState<{ isOpen: boolean, card: any | null, price: string }>({ isOpen: false, card: null, price: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // DEALS STATE
  const [deals, setDeals] = useState<{ tens: any[]; blackLabel: any[]; nines: any[] }>({ tens: [], blackLabel: [], nines: [] });
  const [dealsLoading, setDealsLoading] = useState<boolean>(false);

  // --- INIT & UTILS ---
  const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        fetchCards(session.user.id);
      } else {
        let storedUid = localStorage.getItem('cfinder_user_id');
        if (!storedUid) { storedUid = generateUUID(); localStorage.setItem('cfinder_user_id', storedUid); }
        setUserId(storedUid);
        fetchCards(storedUid);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setUserId(session.user.id);
          fetchCards(session.user.id);
        } else {
          setUser(null);
          const guestId = localStorage.getItem('cfinder_user_id') || generateUUID();
          setUserId(guestId);
          fetchCards(guestId);
        }
      });
      return () => subscription.unsubscribe();
    };

    checkUser();
  }, []);

  // Fetch deals when user logs in, refresh every 2 minutes, stop when logged out
  useEffect(() => {
    if (!user) return; // don't fetch until authenticated
    fetchDeals();
    const interval = setInterval(() => fetchDeals(), 2 * 60 * 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCards = async (uid: string) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('cards').select('*').eq('user_id', uid);
    if (data) {
      const sorted = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMyList(sorted.filter((c: any) => c.status === 'tracked'));
      setMyCollection(sorted.filter((c: any) => c.status === 'collection'));
    }
  };

  const getImageUrl = (card: any) => {
    if (!card) return "";
    if (card.tcgplayerId) return `https://product-images.tcgplayer.com/fit-in/438x438/${card.tcgplayerId}.jpg`;
    if (card.image) return card.image;
    if (card.imageUrl) return card.imageUrl;
    return ""; 
  };

  // --- ACTIONS ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cards?q=${query}`);
      const data = await res.json();
      setResults(data.data || []);
    } catch (err) { setErrorMsg("Failed to fetch results"); } finally { setIsLoading(false); }
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const addToTracked = async (card: any) => {
    const tcgId = card.tcgplayerId || card.id;
    const tcgLink = `https://www.tcgplayer.com/product/${tcgId}`;
    const newCard = {
      user_id: userId,
      card_id: String(tcgId),
      name: card.name,
      set_name: card.setName || card.set_name || "Unknown Set",
      image: getImageUrl(card),
      grade: "Raw (Ungraded)",
      is_first_edition: false,
      live_price: "N/A",  
      status: 'tracked',
      best_link: tcgLink, 
      best_source: "" 
    };
    const { error } = await supabase.from('cards').insert(newCard);
    if (!error) fetchCards(userId); 
  };

  // --- IMPORT / EXPORT HANDLERS (Restored) ---
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(myList, null, 2));
    const a = document.createElement('a');
    a.href = dataStr; a.download = "cfinder_list.json"; a.click(); a.remove();
  };
  
  const handleImportClick = () => fileInputRef.current?.click();
  
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev: any) => {
        try {
            const list = JSON.parse(ev.target.result);
            for (const item of list) await addToTracked(item);
            alert("Imported!");
        } catch (err) { alert("Invalid JSON"); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- PURCHASE MODAL HANDLERS ---
  const openPurchaseModal = (card: any) => {
      setPurchaseModal({ isOpen: true, card: card, price: '' });
  };

  const confirmPurchase = async () => {
    if (!purchaseModal.card || !purchaseModal.price) return;
    const price = parseFloat(purchaseModal.price);
    if (isNaN(price)) { alert("Invalid Price"); return; }

    const { error } = await supabase
      .from('cards')
      .update({ status: 'collection', purchase_price: price })
      .eq('id', purchaseModal.card.id); 

    if (error) alert("Move failed");
    else {
      fetchCards(userId);
      setActiveTab('collection');
      setPurchaseModal({ isOpen: false, card: null, price: '' });
    }
  };

  const deleteCard = async (cardDbId: number) => {
    if (!confirm("Delete card?")) return;
    await supabase.from('cards').delete().eq('id', cardDbId);
    fetchCards(userId);
  };

  const updateCardDetails = async (cardDbId: number, field: string, value: any) => {
    setMyList(prev => prev.map(c => c.id === cardDbId ? { ...c, [field]: value } : c));
    await supabase.from('cards').update({ [field]: value }).eq('id', cardDbId);
  };

  // --- BATCH REFRESH ---
  const handleBatchRefresh = async () => {
    if (myList.length === 0 && myCollection.length === 0) return;
    setIsLoading(true);
    
    const allCards = [...myList, ...myCollection];
    
    // Filter out cards that were updated within the last 24 hours
    const now = new Date().getTime();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    const cardsToUpdate = allCards.filter(c => {
      if (!c.last_price_update) return true; // Never updated, include it
      const lastUpdate = new Date(c.last_price_update).getTime();
      return (now - lastUpdate) > TWENTY_FOUR_HOURS; // Only update if older than 24 hours
    });
    
    if (cardsToUpdate.length === 0) {
      alert("All cards were updated within the last 24 hours. Please try again later.");
      setIsLoading(false);
      return;
    }
    
    console.log(`🔄 Updating ${cardsToUpdate.length} of ${allCards.length} cards (skipping recently updated cards)`);
    
    const batchPayload = cardsToUpdate.map(c => ({ 
      id: c.card_id, 
      name: c.name, 
      set: (c.set_name && !c.set_name.toLowerCase().includes("unknown")) ? c.set_name : "", 
      grade: c.grade, 
      isFirstEdition: c.is_first_edition 
    }));

    try {
      const res = await fetch(`/api/cards?t=${new Date().getTime()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: batchPayload }),
        cache: 'no-store' 
      });
      const responseJson = await res.json();
      
      if (!res.ok) throw new Error("Update failed");

      console.log("📦 API Response:", responseJson.data);

      for (const updated of responseJson.data) {
        console.log(`🔄 Processing card ID: ${updated.id}`, {
          bestSource: updated.bestSource,
          tcgPrice: updated.tcgPrice,
          ebayPrice: updated.ebayPrice
        });

        const currentCard = cardsToUpdate.find(c => c.card_id === updated.id);
        if (!currentCard) {
          console.log(`⚠️ Card ${updated.id} not found in cardsToUpdate list`);
          continue;
        }
        
        const isRaw = !currentCard.grade || currentCard.grade === "Raw (Ungraded)";

        const updatePayload: any = { 
            ebay_price: updated.ebayPrice,
            ebay_link: updated.ebayLink,
            last_price_update: new Date().toISOString()
        };

        // Determine which price to use based on bestSource
        if (updated.bestSource === 'TCGPlayer' && updated.tcgPrice) {
             updatePayload.live_price = updated.tcgPrice;
             updatePayload.best_link = updated.tcgLink || `https://www.tcgplayer.com/product/${updated.id}`;
             updatePayload.best_source = "TCGPlayer";
        } else if (updated.bestSource === 'eBay' && updated.ebayPrice) {
             updatePayload.live_price = updated.ebayPrice;
             updatePayload.best_link = updated.ebayLink;
             updatePayload.best_source = "eBay";
        } else {
             // No price available
             updatePayload.live_price = null;
             updatePayload.best_source = "";
        }

        console.log(`💾 Updating database with:`, updatePayload);

        const { error } = await supabase.from('cards').update(updatePayload).eq('card_id', updated.id).eq('user_id', userId);
        
        if (error) {
          console.error(`❌ Database update failed for card ${updated.id}:`, error);
        } else {
          console.log(`✅ Successfully updated card ${updated.id}`);
        }
      }
      fetchCards(userId);
    } catch (error: any) { console.error("Batch update failed:", error); } finally { setIsLoading(false); }
  };

  // --- EBAY ONLY REFRESH ---
  const handleEbayOnlyRefresh = async () => {
    if (myList.length === 0 && myCollection.length === 0) return;
    setIsLoading(true);
    
    const allCards = [...myList, ...myCollection];
    
    // Filter out cards that were eBay-checked within the last 1 hour
    const now = new Date().getTime();
    const ONE_HOUR = 60 * 60 * 1000;
    
    const cardsToCheck = allCards.filter(c => {
      if (!c.last_ebay_check) return true; // Never checked, include it
      const lastCheck = new Date(c.last_ebay_check).getTime();
      return (now - lastCheck) > ONE_HOUR; // Only check if older than 1 hour
    });
    
    if (cardsToCheck.length === 0) {
      alert("All cards were eBay-checked within the last hour. Please try again later.");
      setIsLoading(false);
      return;
    }
    
    console.log(`🔍 eBay-Only: Checking ${cardsToCheck.length} of ${allCards.length} cards`);
    
    const batchPayload = cardsToCheck.map(c => ({ 
      id: c.card_id, 
      name: c.name, 
      set: (c.set_name && !c.set_name.toLowerCase().includes("unknown")) ? c.set_name : "", 
      grade: c.grade, 
      isFirstEdition: c.is_first_edition,
      ebayOnly: true // Flag to tell backend to only check eBay
    }));

    try {
      const res = await fetch(`/api/cards?t=${new Date().getTime()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: batchPayload }),
        cache: 'no-store' 
      });
      const responseJson = await res.json();
      
      if (!res.ok) throw new Error("eBay check failed");

      console.log("📦 eBay-Only Response:", responseJson.data);

      for (const updated of responseJson.data) {
        console.log(`🔄 eBay check for card ID: ${updated.id}`, {
          ebayPrice: updated.ebayPrice
        });

        const currentCard = cardsToCheck.find(c => c.card_id === updated.id);
        if (!currentCard) {
          console.log(`⚠️ Card ${updated.id} not found in cardsToCheck list`);
          continue;
        }

        const updatePayload: any = { 
            ebay_price: updated.ebayPrice,
            ebay_link: updated.ebayLink,
            last_ebay_check: new Date().toISOString()
        };

        // Update best source if eBay is now cheaper than current live price
        if (updated.ebayPrice && currentCard.live_price) {
          const ebayPrice = parseFloat(updated.ebayPrice);
          const currentPrice = parseFloat(currentCard.live_price);
          
          if (ebayPrice < currentPrice) {
            updatePayload.live_price = updated.ebayPrice;
            updatePayload.best_link = updated.ebayLink;
            updatePayload.best_source = "eBay";
            console.log(`💰 eBay is now cheaper! ${ebayPrice} < ${currentPrice}`);
          }
        }

        console.log(`💾 Updating eBay data:`, updatePayload);

        const { error } = await supabase.from('cards').update(updatePayload).eq('card_id', updated.id).eq('user_id', userId);
        
        if (error) {
          console.error(`❌ Database update failed for card ${updated.id}:`, error);
        } else {
          console.log(`✅ Successfully updated eBay data for card ${updated.id}`);
        }
      }
      fetchCards(userId);
    } catch (error: any) { console.error("eBay check failed:", error); } finally { setIsLoading(false); }
  };

  // --- DEALS FETCH ---
  const fetchDeals = async () => {
    setDealsLoading(true);
    try {
      const [tensRes, blRes, ninesRes] = await Promise.all([
        fetch('/api/deals?type=10s'),
        fetch('/api/deals?type=blacklabel'),
        fetch('/api/deals?type=9s'),
      ]);
      const [tensData, blData, ninesData] = await Promise.all([
        tensRes.json(), blRes.json(), ninesRes.json(),
      ]);
      setDeals({
        tens:       tensData.data  || [],
        blackLabel: blData.data    || [],
        nines:      ninesData.data || [],
      });
    } catch (err) {
      console.error('Failed to fetch deals:', err);
    } finally {
      setDealsLoading(false);
    }
  };

  // --- MATH ---
  const totalWatchlistValue = myList.reduce((acc, c) => acc + (parseFloat(c.live_price) || 0), 0);
  const totalPortfolioCost = myCollection.reduce((acc, c) => acc + (c.purchase_price || 0), 0);
  const totalPortfolioValue = myCollection.reduce((acc, c) => acc + (parseFloat(c.live_price) || 0), 0);
  const totalProfit = totalPortfolioValue - totalPortfolioCost;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">CFinder</h1>
          
          <div className="flex items-center gap-4">
             {user ? (
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-500 hidden sm:inline">Signed in as {user.email}</span>
                    <button onClick={handleLogout} className="text-sm text-red-600 font-medium hover:text-red-700 transition">Sign Out</button>
                </div>
             ) : (
                <button onClick={handleLogin} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Sign in with Google
                </button>
             )}
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 pb-0 flex justify-center gap-6 overflow-x-auto border-t border-gray-100 mt-2 pt-2">
            <button onClick={() => setActiveTab('search')} className={`pb-3 text-sm font-medium transition border-b-2 ${activeTab === 'search' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Search Cards</button>
            <button onClick={() => setActiveTab('list')} className={`pb-3 text-sm font-medium transition border-b-2 ${activeTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>My List ({myList.length})</button>
            <button onClick={() => setActiveTab('collection')} className={`pb-3 text-sm font-medium transition border-b-2 ${activeTab === 'collection' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Collection ({myCollection.length})</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a card..." className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"/>
                <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 transition">{isLoading ? '...' : 'Search'}</button>
              </form>
            </div>

            {/* SEARCH RESULTS — shown directly below search bar */}
            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map((card, i) => (
                  <div key={card.id || i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition">
                    <img src={getImageUrl(card)} alt={card.name} className="w-20 h-28 object-contain" />
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-gray-800">{card.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{card.setName || card.set_name || "Unknown Set"}</p>
                      <button onClick={() => addToTracked(card)} className="bg-gray-900 text-white text-sm py-2 px-4 rounded-lg hover:bg-gray-800 transition self-start">Add to List</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BEST DEALS SECTION */}
            {user ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">🔥 Best Deals Right Now</h2>
                  {dealsLoading && <span className="text-xs text-gray-400 animate-pulse">Refreshing...</span>}
                </div>

                {/* Black Label / Pristine */}
                <div>
                  <p className="text-xs font-bold text-white bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 inline-block mb-2">⚫ CGC / BGS Black Label &amp; Pristine 10s</p>
                  <DealRow items={deals.blackLabel} isLoading={dealsLoading} />
                </div>

                {/* 10s */}
                <div>
                  <p className="text-xs font-bold text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 inline-block mb-2">🏆 PSA / CGC / BGS / TAG 10s</p>
                  <DealRow items={deals.tens} isLoading={dealsLoading} />
                </div>

                {/* 9s */}
                <div>
                  <p className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 inline-block mb-2">🥈 PSA / CGC / BGS / TAG 9s</p>
                  <DealRow items={deals.nines} isLoading={dealsLoading} />
                </div>
              </div>
            ) : (
              /* Static locked placeholder — nothing is rendered or fetched */
              <div className="min-h-[520px] rounded-xl bg-gray-100 flex flex-col items-center justify-center">
                {/* Sign-in card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-10 py-8 flex flex-col items-center gap-4 max-w-sm w-full text-center">
                  <div className="text-3xl">🔒</div>
                  <h3 className="text-lg font-bold text-gray-900">Sign in to view deals</h3>
                  <p className="text-sm text-gray-500">Create a free account to see live eBay auctions ending soon.</p>
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm w-full justify-center"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Sign in with Google
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Tracked Cards</h2>
              <div className="flex gap-2">
                 {/* HIDDEN INPUT FOR IMPORT */}
                 <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                 
                 {/* RESTORED BUTTONS */}
                <button onClick={handleImportClick} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition">Import</button>
                <button onClick={handleExport} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition">Export</button>
                
                <button onClick={handleEbayOnlyRefresh} disabled={isLoading} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition">
                  {isLoading ? 'Checking...' : 'Check Ebay Only'}
                </button>
                <button onClick={handleBatchRefresh} disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                   {isLoading ? 'Updating...' : 'Update Prices'}
                </button>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr><th className="p-4">Card</th><th className="p-4">Details</th><th className="p-4">Grade</th><th className="p-4">Market / Best Price</th><th className="p-4">Action</th><th className="p-4 text-right"></th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myList.map((item, i) => (
                  <tr key={item.id || i} className="hover:bg-gray-50 transition">
                    <td className="p-4 w-20"><img src={item.image} className="w-12 h-16 object-contain rounded-sm border" /></td>
                    <td className="p-4">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-1">{item.set_name || "Unknown Set"}</p>
                    </td>
                    <td className="p-4">
                       <select value={item.grade} onChange={(e) => updateCardDetails(item.id, 'grade', e.target.value)} className="text-sm border-gray-200 border rounded p-1.5 outline-none focus:border-blue-500 block w-full max-w-[120px]">
                           <option>Raw (Ungraded)</option><option>PSA 10</option><option>PSA 9</option><option>PSA 8</option><option>CGC 10</option><option>BGS 10</option>
                       </select>
                    </td>
                    <td className="p-4">
                        <div className="font-bold text-blue-600 text-lg flex items-center gap-2">
                            {item.live_price && item.live_price !== "N/A" ? `$${item.live_price}` : <span className="text-gray-400 text-sm">$N/A</span>}
                            {item.best_source && (
                                <a href={item.best_link} target="_blank" rel="noopener noreferrer" className={`text-[10px] text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider ${item.best_source === 'eBay' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                    {item.best_source === 'eBay' ? 'eBay' : 'TCG'}
                                </a>
                            )}
                        </div>
                        {/* OPPOSITE LISTING */}
                        {item.best_source === 'TCGPlayer' && item.ebay_price && (
                             <div className="mt-1 flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-medium">eBay: ${item.ebay_price}</span>
                                <a href={item.ebay_link} target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded border border-gray-300 transition">
                                    View
                                </a>
                             </div>
                        )}
                    </td>
                    <td className="p-4"><button onClick={() => openPurchaseModal(item)} className="bg-gray-800 hover:bg-gray-900 text-white text-xs px-3 py-1.5 rounded transition">I Bought This</button></td>
                    <td className="p-4 text-right"><button onClick={() => deleteCard(item.id)} className="text-gray-400 hover:text-red-500 p-2">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {myList.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end items-center gap-4">
                  <span className="text-gray-500 font-medium">Total Portfolio Value:</span>
                  <span className="text-2xl font-bold text-green-600">${totalWatchlistValue.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* COLLECTION TAB (Same implementation as before) */}
        {activeTab === 'collection' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><p className="text-gray-500 text-sm font-medium">Total Cost</p><p className="text-2xl font-bold text-gray-900">${totalPortfolioCost.toFixed(2)}</p></div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><p className="text-gray-500 text-sm font-medium">Current Value</p><p className="text-2xl font-bold text-blue-600">${totalPortfolioValue.toFixed(2)}</p></div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><p className="text-gray-500 text-sm font-medium">Total Profit</p><p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}</p></div>
             </div>
             
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-bold text-gray-800">My Collection</h2>
                  <div className="flex gap-2">
                    <button onClick={handleEbayOnlyRefresh} disabled={isLoading} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition">
                      {isLoading ? 'Checking...' : 'Check Ebay Only'}
                    </button>
                    <button onClick={handleBatchRefresh} disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                      {isLoading ? 'Updating...' : 'Update Values'}
                    </button>
                  </div>
               </div>
               <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                    <tr><th className="p-4">Card</th><th className="p-4">Name</th><th className="p-4">Paid</th><th className="p-4">Value</th><th className="p-4">P/L</th><th className="p-4 text-right">Del</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myCollection.map((item, i) => {
                       const profit = (parseFloat(item.live_price) || 0) - (item.purchase_price || 0);
                       return (
                        <tr key={item.id || i} className="hover:bg-gray-50 transition">
                          <td className="p-4"><img src={item.image} className="w-12 h-16 object-contain rounded-sm border" /></td>
                          <td className="p-4"><p className="font-bold text-gray-900">{item.name}</p><p className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-1">{item.set_name}</p></td>
                          <td className="p-4 font-medium text-gray-600">${item.purchase_price?.toFixed(2)}</td>
                          <td className="p-4 font-bold text-blue-600">{item.live_price !== "N/A" ? `$${item.live_price}` : "N/A"}</td>
                          <td className="p-4"><span className={`font-bold px-2 py-1 rounded text-xs ${profit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{profit >= 0 ? '+' : ''}${profit.toFixed(2)}</span></td>
                          <td className="p-4 text-right"><button onClick={() => deleteCard(item.id)} className="text-gray-400 hover:text-red-500 p-2">✕</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
             </div>
           </div>
        )}

      </main>

      {/* QUICK POPUP MODAL */}
      {purchaseModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Add to Collection</h3>
                <p className="text-sm text-gray-500 mb-4">How much did you pay for <span className="font-semibold text-blue-600">{purchaseModal.card?.name}</span>?</p>
                <div className="relative mb-6">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input 
                        type="number" 
                        autoFocus
                        value={purchaseModal.price}
                        onChange={(e) => setPurchaseModal({...purchaseModal, price: e.target.value})}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="0.00"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setPurchaseModal({ isOpen: false, card: null, price: '' })} className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
                    <button onClick={confirmPurchase} className="flex-1 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">Confirm</button>
                </div>
            </div>
        </div>
      )}

      <footer className="text-center text-xs text-gray-300 py-6">
        CFinder v17.0 - Fully Loaded
      </footer>
    </div>
  );
}