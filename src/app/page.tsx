'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { CardItem, SearchCardResult, TcgGame, DealItem, SearchFilterState } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';
import { useCards } from '@/hooks/useCards';
import { useSniper } from '@/hooks/useSniper';

// Components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { CardTable } from '@/components/cards/CardTable';
import { PortfolioStats } from '@/components/collection/PortfolioStats';
import { CollectionTable } from '@/components/collection/CollectionTable';
import { DealSection } from '@/components/deals/DealSection';
import { SniperDashboard } from '@/components/sniper/SniperDashboard';
import { PurchaseModal } from '@/components/cards/PurchaseModal';
import { SniperRuleModal } from '@/components/sniper/SniperRuleModal';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils/format';

export default function Home() {
  const { theme, toggleTheme, mounted: themeMounted } = useTheme();

  // Navigation & Game State
  const [activeTab, setActiveTab] = useState<'search' | 'list' | 'collection' | 'sniper'>('search');
  const [tcg, setTcg] = useState<TcgGame>('pokemon');

  // Search & Multi-Select Filter State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchCardResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<SearchFilterState>({
    languages: ['en', 'ja'], // Default to comparing English & Japanese
    categories: [],
    rarities: [],
    conditions: [],
    printings: [],
    setName: '',
    onlyUnowned: false
  });

  // User & Auth State
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // Cards Hook (supports zero-server-quota local storage mode)
  const {
    myList,
    myCollection,
    isLoading: isCardsLoading,
    serverError,
    storageMode,
    isMigrating,
    handleMigrateFromServer,
    setServerError,
    fetchCards,
    addToTracked,
    updateCardDetails,
    deleteCard,
    moveToCollection,
    handleBatchRefresh,
    handleEbayOnlyRefresh
  } = useCards(userId);

  const {
    rules: sniperRules,
    fetchRules: fetchSniperRules,
    addRule: addSniperRule,
    deleteRule: deleteSniperRule
  } = useSniper(userId);

  // Deals State
  const [deals, setDeals] = useState<{ tens: DealItem[]; blackLabel: DealItem[]; nines: DealItem[] }>({
    tens: [],
    blackLabel: [],
    nines: []
  });
  const [dealsLoading, setDealsLoading] = useState(false);

  // Modals
  const [purchaseModalCard, setPurchaseModalCard] = useState<CardItem | null>(null);
  const [snipeModalCard, setSnipeModalCard] = useState<any | null>(null);
  const [isSnipeModalOpen, setIsSnipeModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // User Authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        fetchCards(session.user.id);
        fetchSniperRules(session.user.id);
      } else {
        let storedUid = localStorage.getItem('cfinder_user_id');
        if (!storedUid) {
          storedUid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
          });
          localStorage.setItem('cfinder_user_id', storedUid);
        }
        setUserId(storedUid);
        fetchCards(storedUid);
        fetchSniperRules(storedUid);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setUserId(session.user.id);
          fetchCards(session.user.id);
          fetchSniperRules(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          const guestId = localStorage.getItem('cfinder_user_id') || 'guest';
          setUserId(guestId);
          fetchCards(guestId);
          fetchSniperRules(guestId);
        }
      });

      return () => subscription.unsubscribe();
    };

    checkUser();
  }, [fetchCards, fetchSniperRules]);

  // Fetch Deals (when logged in & on game change)
  useEffect(() => {
    if (!user) return;
    const fetchDealsData = async () => {
      setDealsLoading(true);
      try {
        const dealGame = tcg === 'pokemon-japan' ? 'pokemon' : tcg;
        const [tensRes, blRes, ninesRes] = await Promise.allSettled([
          fetch(`/api/deals?type=10s&game=${dealGame}`).then((r) => r.json()),
          fetch(`/api/deals?type=blacklabel&game=${dealGame}`).then((r) => r.json()),
          fetch(`/api/deals?type=9s&game=${dealGame}`).then((r) => r.json())
        ]);

        setDeals({
          tens: tensRes.status === 'fulfilled' ? tensRes.value.data || [] : [],
          blackLabel: blRes.status === 'fulfilled' ? blRes.value.data || [] : [],
          nines: ninesRes.status === 'fulfilled' ? ninesRes.value.data || [] : []
        });
      } catch {
        // Keep existing deals if request fails
      } finally {
        setDealsLoading(false);
      }
    };

    fetchDealsData();
    const interval = setInterval(fetchDealsData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, tcg]);

  // Auth Handlers
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Search Handler with Multi-Language Routing
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const hasCategories = (filters.categories?.length || 0) > 0;
    const hasRarities = (filters.rarities?.length || 0) > 0;
    const hasLanguages = (filters.languages?.length || 0) > 0;
    const hasQuery = Boolean(query.trim());

    if (!hasQuery && !hasCategories && !hasRarities) {
      showToast('Please enter a search term or select filters (e.g. Full Art Trainers).', 'info');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());

      // If only pokemon-japan is selected, query pokemon-japan
      if (filters.languages?.includes('ja') && !filters.languages?.includes('en')) {
        params.set('game', 'pokemon-japan');
      } else if (filters.languages?.includes('onepiece')) {
        params.set('game', 'onepiece');
      } else {
        params.set('game', tcg === 'pokemon-japan' ? 'pokemon' : tcg);
      }

      if (hasLanguages) {
        params.set('languages', filters.languages.join(','));
      }

      if (hasCategories) {
        const hasSupporter = filters.categories.includes('Trainer - Supporter');
        const hasItem = filters.categories.includes('Trainer - Item');
        const hasStadium = filters.categories.includes('Trainer - Stadium');
        const hasTrainer = filters.categories.some((c) => c.startsWith('Trainer'));

        if (hasSupporter && !hasItem && !hasStadium) {
          params.set('category', 'Trainer');
          params.set('trainerType', 'Supporter');
        } else if (hasTrainer) {
          params.set('category', 'Trainer');
        } else if (filters.categories.includes('Pokémon')) {
          params.set('category', 'Pokemon');
        } else if (filters.categories.includes('Energy')) {
          params.set('category', 'Energy');
        }
      }

      if (hasRarities) {
        params.set('rarity', filters.rarities.join(','));
      }

      const res = await fetch(`/api/cards?${params.toString()}`);
      const json = await res.json();
      setSearchResults(json.data || []);
      if (!json.data || json.data.length === 0) {
        showToast('No cards found matching your criteria.', 'info');
      }
    } catch {
      showToast('Failed to fetch cards. Please try again.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      languages: ['en', 'ja'],
      categories: [],
      rarities: [],
      conditions: [],
      printings: [],
      setName: '',
      onlyUnowned: false
    });
  };

  // Computed displayed results with "Cards I Don't Have" (onlyUnowned) exclusion
  const displayedSearchResults = useMemo(() => {
    let list = searchResults;

    // Filter by "Missing from Wishlist/Collection" (Cards I don't have)
    if (filters.onlyUnowned) {
      list = list.filter((card) => {
        const isOwned = myCollection.some((owned) => {
          if (card.id && owned.card_id && String(owned.card_id) === String(card.id)) {
            return true;
          }
          const cardName = card.name.toLowerCase().trim();
          const ownedName = owned.name.toLowerCase().trim();
          return cardName === ownedName;
        });
        const isWishlisted = myList.some((w) => {
          if (card.id && w.card_id && String(w.card_id) === String(card.id)) {
            return true;
          }
          const cardName = card.name.toLowerCase().trim();
          const wishName = w.name.toLowerCase().trim();
          return cardName === wishName;
        });
        return !isOwned && !isWishlisted;
      });
    }

    // Filter by Category multi-select
    if (filters.categories?.length > 0) {
      list = list.filter((card) => {
        if (!card.category && !card.trainerType) return true;
        const cLower = (card.category || '').toLowerCase();
        const tLower = (card.trainerType || '').toLowerCase();
        return filters.categories.some((cat) => {
          const catLower = cat.toLowerCase();
          return cLower.includes(catLower) || tLower.includes(catLower) || catLower.includes(cLower);
        });
      });
    }

    // Filter by Rarity multi-select
    if (filters.rarities?.length > 0) {
      const lowerRarities = filters.rarities.map((r) => r.toLowerCase());
      list = list.filter((card) => {
        if (!card.rarity) return true;
        const cardRarity = card.rarity.toLowerCase();
        return lowerRarities.some((r) => cardRarity.includes(r) || r.includes(cardRarity));
      });
    }

    return list;
  }, [searchResults, filters.onlyUnowned, filters.categories, filters.rarities, myCollection, myList]);

  // Add Card to Wishlist (Tracked)
  const handleAddWishlist = async (card: SearchCardResult) => {
    const success = await addToTracked(card, tcg);
    if (success) {
      showToast(`Added ${card.name} to your wishlist!`, 'success');
    } else {
      showToast('Failed to add card to wishlist.', 'error');
    }
  };

  // Add single optimized lowest-cost version to Wishlist
  const handleAddOptimizedToList = async (card: SearchCardResult) => {
    const lang = card.cheapestLanguage || 'en';
    const langUpper = lang.toUpperCase();
    const optimizedCard: SearchCardResult = {
      ...card,
      name: `${card.name} [${langUpper}]`,
      price: card.cheapestPrice ?? card.price,
      language: lang
    };

    const success = await addToTracked(optimizedCard, tcg);
    if (success) {
      showToast(`Wishlisted cheapest version: ${optimizedCard.name} (${formatCurrency(optimizedCard.price)})!`, 'success');
    } else {
      showToast('Failed to add card to wishlist.', 'error');
    }
  };

  // Quick Select ALL Optimized Cost Versions to Wishlist
  const handleAddAllOptimized = async (cards: SearchCardResult[]) => {
    let addedCount = 0;
    for (const card of cards) {
      const alreadyWishlisted = myList.some((w) => w.name.toLowerCase().includes(card.name.toLowerCase()));
      if (alreadyWishlisted) continue;

      const lang = card.cheapestLanguage || 'en';
      const optimizedCard: SearchCardResult = {
        ...card,
        name: `${card.name} [${lang.toUpperCase()}]`,
        price: card.cheapestPrice ?? card.price,
        language: lang
      };
      const ok = await addToTracked(optimizedCard, tcg);
      if (ok) addedCount++;
    }

    if (addedCount > 0) {
      showToast(`Added ${addedCount} optimized lowest-cost cards to your Wishlist!`, 'success');
    } else {
      showToast('All matching cards are already in your Wishlist!', 'info');
    }
  };

  // Cloud to Local Migration Handler
  const handleMigrateCloudStorage = async () => {
    const res = await handleMigrateFromServer();
    if (res.success) {
      showToast(
        `Successfully migrated ${res.count} cards to local storage! Zero server quota used.`,
        'success'
      );
    } else {
      showToast('No cards found on server or migration up to date.', 'info');
    }
  };

  // Quick Snipe Modal Trigger
  const handleOpenSniperModal = (card: any) => {
    setSnipeModalCard(card);
    setIsSnipeModalOpen(true);
  };

  // Move to Collection
  const handleConfirmPurchase = async (card: CardItem, price: number) => {
    const success = await moveToCollection(card, price);
    if (success) {
      showToast(`Moved ${card.name} to your collection at $${price.toFixed(2)}!`, 'success');
      setActiveTab('collection');
    } else {
      showToast('Failed to move card to collection.', 'error');
    }
  };

  // Batch Refresh
  const onTriggerBatchRefresh = async () => {
    showToast('Refreshing live market prices...', 'info');
    try {
      await handleBatchRefresh();
      showToast('Live market prices refreshed!', 'success');
    } catch {
      showToast('Failed to refresh market prices.', 'error');
    }
  };

  const onTriggerEbayRefresh = async () => {
    showToast('Refreshing eBay sold comps...', 'info');
    try {
      await handleEbayOnlyRefresh();
      showToast('eBay sold comps refreshed!', 'success');
    } catch {
      showToast('Failed to refresh eBay comps.', 'error');
    }
  };

  // Export / Import
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(myList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cfinder_wishlist_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Wishlist exported successfully!', 'success');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          showToast(`Importing ${imported.length} cards...`, 'info');
          for (const item of imported) {
            await addToTracked({
              id: item.card_id || String(item.id),
              name: item.name,
              setName: item.set_name,
              image: item.image,
              price: item.live_price
            }, item.game || tcg);
          }
          fetchCards(userId);
          showToast('Import completed successfully!', 'success');
        }
      } catch {
        showToast('Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered lists for stats
  const filteredCollection = myCollection.filter((c) => (c.game || 'pokemon') === tcg);
  const totalCost = filteredCollection.reduce((acc, c) => acc + (c.purchase_price || 0), 0);
  const totalValue = filteredCollection.reduce((acc, c) => acc + (parseFloat(c.live_price || '0') || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 font-sans flex flex-col transition-colors duration-200">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Hidden File Input for Import */}
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        trackedCount={myList.filter((c) => (c.game || 'pokemon') === tcg).length}
        collectionCount={filteredCollection.length}
        sniperCount={sniperRules.length}
        storageMode={storageMode}
        onMigrateCloud={handleMigrateCloudStorage}
        isMigrating={isMigrating}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
        themeMounted={themeMounted}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 flex-1 w-full space-y-6">
        {serverError && (
          <div className="flex items-center justify-between gap-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl px-5 py-3 text-xs font-semibold">
            <span>⚠️ {serverError}</span>
            <button
              onClick={() => setServerError(null)}
              className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: SEARCH CARDS & MULTI-LANGUAGE ARBITRAGE */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchBar
              query={query}
              setQuery={setQuery}
              game={tcg}
              setGame={(newGame) => {
                setTcg(newGame);
                const langCode = newGame === 'pokemon-japan' ? 'ja' : newGame === 'onepiece' ? 'onepiece' : 'en';
                setFilters((prev) => ({
                  ...prev,
                  languages: prev.languages.includes(langCode) ? prev.languages : [langCode, ...prev.languages]
                }));
              }}
              onSearch={handleSearch}
              isLoading={isSearching}
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              totalResults={displayedSearchResults.length}
            />

            {/* SEARCH RESULTS WITH MULTI-LANGUAGE PRICING */}
            {displayedSearchResults.length > 0 ? (
              <SearchResults
                results={displayedSearchResults}
                onAddToList={handleAddWishlist}
                onAddOptimizedToList={handleAddOptimizedToList}
                onAddAllOptimized={handleAddAllOptimized}
                onOpenSniper={handleOpenSniperModal}
                isOwned={(card) =>
                  myCollection.some((c) => c.name.toLowerCase().trim() === card.name.toLowerCase().trim())
                }
                isTracked={(card) =>
                  myList.some((c) => c.name.toLowerCase().trim() === card.name.toLowerCase().trim())
                }
              />
            ) : isSearching ? (
              <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-8 text-center text-gray-500 border border-gray-100 dark:border-gray-700/80">
                <p className="animate-pulse font-medium text-sm">Searching cards &amp; comparing multi-language prices...</p>
              </div>
            ) : hasSearched ? (
              <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-8 text-center text-gray-500 border border-gray-100 dark:border-gray-700/80">
                {filters.onlyUnowned ? (
                  <div className="space-y-1">
                    <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                      🎉 You already have all matching cards in your Wishlist or Collection!
                    </p>
                    <p className="text-xs text-gray-400">
                      Toggle &quot;Cards I Don&apos;t Have&quot; off to view your collection.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No cards matched your search and filter criteria.</p>
                )}
              </div>
            ) : null}

            {/* LIVE DEALS CAROUSELS */}
            <DealSection
              user={user}
              onLogin={handleLogin}
              deals={deals}
              isLoading={dealsLoading}
            />
          </div>
        )}

        {/* TAB 2: WISHLIST (FORMERLY TRACKED) */}
        {activeTab === 'list' && (
          <CardTable
            cards={myList}
            tcg={tcg}
            setTcg={setTcg}
            onGradeChange={(id, grade) => updateCardDetails(id, 'grade', grade)}
            onBuyClick={(card) => setPurchaseModalCard(card)}
            onSnipeClick={handleOpenSniperModal}
            onDeleteClick={deleteCard}
            onBatchRefresh={onTriggerBatchRefresh}
            onEbayOnlyRefresh={onTriggerEbayRefresh}
            onImportClick={handleImportClick}
            onExportClick={handleExport}
            isLoading={isCardsLoading}
          />
        )}

        {/* TAB 3: MY COLLECTION & PORTFOLIO */}
        {activeTab === 'collection' && (
          <div className="space-y-6">
            <PortfolioStats
              totalCost={totalCost}
              totalValue={totalValue}
              itemCount={filteredCollection.length}
            />

            <CollectionTable
              collection={myCollection}
              tcg={tcg}
              setTcg={setTcg}
              onDeleteClick={deleteCard}
              onBatchRefresh={onTriggerBatchRefresh}
              onEbayOnlyRefresh={onTriggerEbayRefresh}
              isLoading={isCardsLoading}
            />
          </div>
        )}

        {/* TAB 4: DISCORD BOT SNIPER */}
        {activeTab === 'sniper' && (
          <SniperDashboard
            rules={sniperRules}
            onOpenCreateModal={() => {
              setSnipeModalCard(null);
              setIsSnipeModalOpen(true);
            }}
            onDeleteRule={deleteSniperRule}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer />

      {/* MODAL 1: PURCHASE / MOVE TO COLLECTION */}
      <PurchaseModal
        isOpen={!!purchaseModalCard}
        card={purchaseModalCard}
        onClose={() => setPurchaseModalCard(null)}
        onConfirm={handleConfirmPurchase}
      />

      {/* MODAL 2: CONFIGURE SNIPER */}
      <SniperRuleModal
        isOpen={isSnipeModalOpen}
        onClose={() => setIsSnipeModalOpen(false)}
        card={snipeModalCard}
        userId={userId}
        onRuleCreated={addSniperRule}
        onShowToast={showToast}
      />
    </div>
  );
}
