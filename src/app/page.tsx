'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { CardItem, SearchCardResult, TcgGame, DealItem } from '@/lib/types';
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

export default function Home() {
  const { theme, toggleTheme, mounted: themeMounted } = useTheme();

  // Navigation & Game State
  const [activeTab, setActiveTab] = useState<'search' | 'list' | 'collection' | 'sniper'>('search');
  const [tcg, setTcg] = useState<TcgGame>('pokemon');

  // Search State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchCardResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // User & Auth State
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // Hooks
  const {
    myList,
    myCollection,
    isLoading: isCardsLoading,
    serverError,
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
        const [tensRes, blRes, ninesRes] = await Promise.allSettled([
          fetch(`/api/deals?type=10s&game=${tcg}`).then((r) => r.json()),
          fetch(`/api/deals?type=blacklabel&game=${tcg}`).then((r) => r.json()),
          fetch(`/api/deals?type=9s&game=${tcg}`).then((r) => r.json())
        ]);

        setDeals({
          tens: tensRes.status === 'fulfilled' ? tensRes.value.data || [] : [],
          blackLabel: blRes.status === 'fulfilled' ? blRes.value.data || [] : [],
          nines: ninesRes.status === 'fulfilled' ? ninesRes.value.data || [] : []
        });
      } catch {
        // Stale deals are kept if request fails
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

  // Search Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/cards?q=${encodeURIComponent(query)}&game=${tcg}`);
      const json = await res.json();
      setSearchResults(json.data || []);
      if (!json.data || json.data.length === 0) {
        showToast('No cards found for this search.', 'info');
      }
    } catch {
      showToast('Failed to fetch cards. Please try again.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Add Card to Tracked
  const handleAddTracked = async (card: SearchCardResult) => {
    const success = await addToTracked(card, tcg);
    if (success) {
      showToast(`Added ${card.name} to tracked cards!`, 'success');
    } else {
      showToast('Failed to add card to tracked list.', 'error');
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
    try {
      const res = await handleBatchRefresh();
      if (res?.skipped) {
        showToast('All cards were updated recently (within 24h).', 'info');
      } else {
        showToast(`Updated market prices for ${res?.count || 0} cards!`, 'success');
      }
    } catch {
      showToast('Batch refresh failed. Please try again later.', 'error');
    }
  };

  // eBay Only Refresh
  const onTriggerEbayRefresh = async () => {
    try {
      const res = await handleEbayOnlyRefresh();
      if (res?.skipped) {
        showToast('All cards were eBay-checked within the last hour.', 'info');
      } else {
        showToast(`Checked live eBay prices for ${res?.count || 0} cards!`, 'success');
      }
    } catch {
      showToast('eBay price check failed. Check your connection.', 'error');
    }
  };

  // Import / Export
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(myList, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'cfinder_tracked_cards.json';
    a.click();
    a.remove();
    showToast('Exported tracked cards JSON!', 'success');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev: any) => {
      try {
        const list = JSON.parse(ev.target.result);
        if (Array.isArray(list)) {
          for (const item of list) {
            await addToTracked(item, tcg);
          }
          showToast(`Imported ${list.length} cards!`, 'success');
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
            <span>?? {serverError}</span>
            <button
              onClick={() => setServerError(null)}
              className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
            >
              ?
            </button>
          </div>
        )}

        {/* TAB 1: SEARCH CARDS & BEST DEALS */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchBar
              query={query}
              setQuery={setQuery}
              game={tcg}
              setGame={setTcg}
              onSearch={handleSearch}
              isLoading={isSearching}
            />

            {/* SEARCH RESULTS */}
            {searchResults.length > 0 && (
              <SearchResults
                results={searchResults}
                onAddToList={handleAddTracked}
                onOpenSniper={handleOpenSniperModal}
              />
            )}

            {/* BEST DEALS CAROUSELS */}
            <DealSection
              user={user}
              onLogin={handleLogin}
              deals={deals}
              isLoading={dealsLoading}
            />
          </div>
        )}

        {/* TAB 2: TRACKED CARDS TABLE */}
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
