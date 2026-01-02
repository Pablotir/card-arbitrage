'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('search'); 
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [myList, setMyList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hidden input ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOAD DATA ---
  useEffect(() => {
    const saved = localStorage.getItem('myCardList');
    if (saved) {
      setMyList(JSON.parse(saved));
    }
  }, []);

  // --- SAVE DATA ---
  useEffect(() => {
    localStorage.setItem('myCardList', JSON.stringify(myList));
  }, [myList]);

  // --- TOTAL CALCULATOR ---
  const totalValue = myList.reduce((acc, item) => {
    const price = parseFloat(item.livePrice);
    return acc + (isNaN(price) ? 0 : price);
  }, 0);

  // --- HELPER: AGGRESSIVE IMAGE FINDER ---
  const getImageUrl = (card: any) => {
    if (!card) return "";
    
    // Check every common variation in the TCG world
    if (card.image) return card.image;
    if (card.imageUrl) return card.imageUrl;
    if (card.img) return card.img;
    if (card.url) return card.url;
    if (card.thumbnail) return card.thumbnail;
    
    // Nested objects
    if (card.images) {
        if (typeof card.images === 'string') return card.images;
        if (card.images.small) return card.images.small;
        if (card.images.large) return card.images.large;
        if (card.images.url) return card.images.url;
    }
    
    if (card.media) {
        if (card.media.url) return card.media.url;
        if (card.media.image) return card.media.image;
    }

    return "";
  };

  // --- SEARCH ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/cards?q=${query}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.data || []);
    } catch (err) {
      setErrorMsg("Failed to fetch results");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ADD TO LIST ---
  const addCard = (card: any) => {
    const newCard = {
      id: card.id,
      name: card.name,
      set: card.setName || "Unknown Set",
      image: getImageUrl(card), // Uses the helper
      grade: "Raw (Ungraded)",
      isFirstEdition: false,
      livePrice: "N/A",
      bestLink: "",   
      bestSource: ""  
    };
    setMyList([...myList, newCard]);
  };

  // --- REMOVE ---
  const removeCard = (indexToRemove: number) => {
    setMyList(myList.filter((_, index) => index !== indexToRemove));
  };

  // --- UPDATE DETAILS ---
  const updateCardDetails = (index: number, field: string, value: any) => {
    const updatedList = [...myList];
    updatedList[index][field] = value;
    setMyList(updatedList);
  };

  // --- EXPORT ---
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(myList, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cfinder_list.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- IMPORT ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result;
        if (typeof json === 'string') {
          const importedList = JSON.parse(json);
          if (Array.isArray(importedList)) {
            setMyList(importedList);
            alert("List imported successfully!");
          } else {
            alert("Invalid file format: JSON must be an array.");
          }
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(fileObj);
    event.target.value = ''; 
  };

  // --- BATCH UPDATE ---
  const handleBatchRefresh = async () => {
    if (myList.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const batchCards = myList.slice(0, 20); 

      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: batchCards }), 
      });
      
      const responseJson = await res.json();
      if (!res.ok) throw new Error(responseJson.details || "Update failed");

      const newList = myList.map(item => {
        const result = responseJson.data?.find((r: any) => String(r.id) === String(item.id));
        if (result) {
          return { 
            ...item, 
            livePrice: result.livePrice,
            bestLink: result.bestLink,    
            bestSource: result.bestSource 
          };
        }
        return item;
      });
      
      setMyList(newList);
    } catch (error: any) {
      console.error("Batch update failed:", error);
      setErrorMsg("Failed to refresh prices. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* LEFT: LOGO */}
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
            CFinder
          </h1>

          {/* RIGHT: TABS (Pill Style) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'search' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'list' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Your List ({myList.length})
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-center">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: SEARCH CONTENT */}
        {activeTab === 'search' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a card..."
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((card) => {
                  const validImage = getImageUrl(card); 
                  
                  return (
                    <div key={card.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition">
                      {validImage ? (
                        <img src={validImage} alt={card.name} className="w-20 h-28 object-contain" />
                      ) : (
                         <div className="w-20 h-28 bg-gray-100 p-2 overflow-hidden text-[10px] text-gray-500 font-mono break-all border border-red-200 rounded">
                           {/* DEBUGGER: SHOW KEYS */}
                           KEYS: {Object.keys(card).filter(k => k !== 'variants').join(', ')}
                         </div>
                      )}
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-gray-800">{card.name}</h3>
                        {card.setName && card.setName !== "Unknown Set" && (
                           <p className="text-sm text-gray-500 mb-3">{card.setName}</p>
                        )}
                        <button 
                          onClick={() => addCard(card)}
                          className="bg-gray-900 text-white text-sm py-2 px-4 rounded-lg hover:bg-gray-800 transition self-start"
                        >
                          Add to List
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY LIST CONTENT */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            {/* TOOLBAR */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Tracked Cards</h2>
              
              <div className="flex gap-2">
                 <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <button onClick={handleImportClick} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                  Import
                </button>
                <button onClick={handleExport} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                  Export
                </button>
                <button 
                  onClick={handleBatchRefresh}
                  disabled={isLoading || myList.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? 'Updating...' : 'Update Prices'}
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Card</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Grade / Ed</th>
                    <th className="p-4">Best Price</th>
                    <th className="p-4">Action</th>
                    <th className="p-4 text-right">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                        Your list is empty. Go to the Search tab to add cards!
                      </td>
                    </tr>
                  ) : (
                    myList.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition group">
                        {/* IMAGE */}
                        <td className="p-4 w-20">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-12 h-16 object-contain rounded-sm border" />
                          ) : (
                            <div className="w-12 h-16 bg-gray-100 rounded-sm flex items-center justify-center text-gray-400 text-[10px] text-center p-1">
                                No Img
                            </div>
                          )}
                        </td>

                        {/* NAME & SET */}
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{item.name}</p>
                          {/* HIDE SET IF UNKNOWN */}
                          {item.set && item.set !== "Unknown Set" && (
                            <p className="text-xs text-gray-500">{item.set}</p>
                          )}
                        </td>

                        {/* CONFIGURATION */}
                        <td className="p-4 space-y-2">
                          <select 
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded p-1.5 w-full outline-none focus:border-blue-500 block"
                            value={item.grade}
                            onChange={(e) => updateCardDetails(index, 'grade', e.target.value)}
                          >
                            <option>Raw (Ungraded)</option>
                            <option>PSA 10</option>
                            <option>PSA 9</option>
                            <option>PSA 8</option>
                            <option>CGC 10</option>
                            <option>BGS 10</option>
                          </select>
                          <label className="flex items-center gap-2 text-xs text-gray-600">
                            <input 
                              type="checkbox" 
                              checked={item.isFirstEdition}
                              onChange={(e) => updateCardDetails(index, 'isFirstEdition', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            1st Edition
                          </label>
                        </td>

                        {/* PRICE */}
                        <td className="p-4">
                          <div className="font-bold text-blue-600 text-lg">
                            {item.livePrice && item.livePrice !== "N/A" ? `$${item.livePrice}` : <span className="text-gray-400 text-sm">$N/A</span>}
                          </div>
                          {item.bestSource && (
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.bestSource}</span>
                          )}
                        </td>

                        {/* BUY BUTTON */}
                        <td className="p-4">
                           {item.bestLink ? (
                            <a 
                              href={item.bestLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-block bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded shadow-sm font-medium transition"
                            >
                              Buy Now
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs select-none">--</span>
                          )}
                        </td>

                        {/* DELETE */}
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => removeCard(index)}
                            className="text-gray-400 hover:text-red-500 transition p-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER TOTAL */}
            {myList.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end items-center gap-4">
                  <span className="text-gray-500 font-medium">Total Estimated Value:</span>
                  <span className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}