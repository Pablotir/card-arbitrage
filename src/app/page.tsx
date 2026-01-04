'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; 

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

  // MODAL STATE
  const [purchaseModal, setPurchaseModal] = useState<{ isOpen: boolean, card: any | null, price: string }>({ isOpen: false, card: null, price: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- INIT & UTILS ---
  const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });

  useEffect(() => {
    let storedUid = localStorage.getItem('cfinder_user_id');
    if (!storedUid) { storedUid = generateUUID(); localStorage.setItem('cfinder_user_id', storedUid); }
    setUserId(storedUid);
    if (storedUid) fetchCards(storedUid);
  }, []);

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
    const batchPayload = allCards.map(c => ({ 
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

      for (const updated of responseJson.data) {
        const currentCard = allCards.find(c => c.card_id === updated.id);
        const isRaw = !currentCard?.grade || currentCard.grade === "Raw (Ungraded)";

        const updatePayload: any = { 
            ebay_price: updated.ebayPrice,
            ebay_link: updated.ebayLink
        };

        if (updated.bestSource === 'TCGPlayer' && isRaw) {
             updatePayload.live_price = updated.tcgPrice;
             updatePayload.best_link = updated.tcgLink || `https://www.tcgplayer.com/product/${updated.id}`;
             updatePayload.best_source = "TCGPlayer";
        } else {
             updatePayload.live_price = updated.ebayPrice;
             updatePayload.best_link = updated.ebayLink;
             updatePayload.best_source = "eBay";
        }

        if (isRaw && updated.tcgLink && updated.tcgLink.includes("tcgplayer.com")) {
            const match = updated.tcgLink.match(/product\/(\d+)/);
            if (match && match[1] !== updated.id) {
                updatePayload.card_id = match[1]; 
            }
        }

        await supabase.from('cards').update(updatePayload).eq('card_id', updated.id).eq('user_id', userId);
      }
      fetchCards(userId);
    } catch (error: any) { console.error("Batch update failed:", error); } finally { setIsLoading(false); }
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
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('search')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'search' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>Search</button>
            <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>Your List ({myList.length})</button>
            <button onClick={() => setActiveTab('collection')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'collection' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}>Collection ({myCollection.length})</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'search' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a card..." className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"/>
                <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 transition">{isLoading ? '...' : 'Search'}</button>
              </form>
            </div>
            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <button onClick={handleBatchRefresh} disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                    {isLoading ? 'Updating...' : 'Update Values'}
                  </button>
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