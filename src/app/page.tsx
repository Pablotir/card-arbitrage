'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { CardItem, SearchCardResult, TcgGame, DealItem, SearchFilterState } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';
import { useCards } from '@/hooks/useCards';
import { useSniper } from '@/hooks/useSniper';

// Components
import { Header, TabType } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchLoadingBanner } from '@/components/search/SearchLoadingBanner';
import { CardTable } from '@/components/cards/CardTable';
import { PortfolioStats } from '@/components/collection/PortfolioStats';
import { CollectionTable } from '@/components/collection/CollectionTable';
import { AuctionsTab } from '@/components/deals/AuctionsTab';
import { SniperDashboard } from '@/components/sniper/SniperDashboard';
import { PurchaseModal } from '@/components/cards/PurchaseModal';
import { SniperRuleModal } from '@/components/sniper/SniperRuleModal';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils/format';
import { getCachedCatalog, setCachedCatalog } from '@/lib/cardCatalogCache';

export default function Home() {
  const { theme, toggleTheme, mounted: themeMounted } = useTheme();

  // Navigation & Game State
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [tcg, setTcg] = useState<TcgGame>('pokemon');

  // Search & Multi-Select Filter State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchCardResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStatus, setSearchStatus] = useState('');
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
    toggleCardOwned,
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

  // Fetch Deals (when logged in & on game change & activeTab === 'auctions')
  const fetchDealsData = useCallback(async () => {
    if (!user) return;
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
  }, [user, tcg]);

  useEffect(() => {
    if (activeTab === 'auctions') {
      fetchDealsData();
      const interval = setInterval(fetchDealsData, 5 * 60 * 1000); // 5 min interval when on auctions tab
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchDealsData]);

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
  const lastQuerySignatureRef = useRef<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialFilterSkip = useRef(true);

  const handleSearch = async (e?: React.FormEvent, forceRefresh = false) => {
    if (e) e.preventDefault();

    // Cancel any pending debounced auto-search immediately to prevent double-firing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    const hasCategories = (filters.categories?.length || 0) > 0;
    const hasRarities = (filters.rarities?.length || 0) > 0;
    const hasLanguages = (filters.languages?.length || 0) > 0;
    const hasQuery = Boolean(query.trim());

    if (!hasQuery && !hasCategories && !hasRarities) {
      showToast('Please enter a search term or select filters (e.g. Full Art Trainers).', 'info');
      return;
    }

    // Base cache key: cache by game, category, rarities, and search text for 5-day local database
    const baseCacheKey = `${tcg}_${(filters.categories || []).slice().sort().join('_') || 'all'}_${(filters.rarities || []).slice().sort().join('_') || 'all'}_${query.trim().toLowerCase() || 'all'}`;

    if (!forceRefresh) {
      const cached = getCachedCatalog(baseCacheKey);
      if (cached && cached.length > 0) {
        setSearchResults(cached);
        setIsSearching(false);
        setHasSearched(true);
        return;
      }
    }

    const currentSig = `${query.trim()}_${tcg}_${(filters.categories || []).sort().join(',')}_${(filters.rarities || []).sort().join(',')}_${forceRefresh ? Date.now() : ''}`;
    lastQuerySignatureRef.current = currentSig;

    setIsSearching(true);
    setHasSearched(true);
    setSearchProgress(15);
    setSearchStatus('Querying Pokémon catalogs across selected languages...');

    const progressTimer = setInterval(() => {
      setSearchProgress((prev) => {
        if (prev >= 90) return prev;
        if (prev < 40) return prev + 15;
        if (prev < 75) return prev + 8;
        return prev + 3;
      });
    }, 180);

    const status1 = setTimeout(() => {
      setSearchStatus('Retrieving official scans & live TCGPlayer pricing...');
    }, 450);

    const status2 = setTimeout(() => {
      setSearchStatus('Compiling multi-language union & comparing live comps...');
    }, 1100);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());

      // Set limit to 1000 to return all 791+ matching cards
      params.set('limit', '1000');

      // Always pass the selected game and languages
      params.set('game', tcg === 'pokemon-japan' ? 'pokemon' : tcg);

      if (hasLanguages) {
        params.set('languages', filters.languages.join(','));
      }

      if (hasCategories) {
        const hasSupporter = filters.categories.includes('Supporter') || filters.categories.includes('Trainer - Supporter');
        const hasItem = filters.categories.includes('Item') || filters.categories.includes('Trainer - Item');
        const hasStadium = filters.categories.includes('Stadium') || filters.categories.includes('Trainer - Stadium');
        const hasTool = filters.categories.includes('Tool') || filters.categories.includes('Trainer - Tool');
        const hasTrainer = filters.categories.includes('Trainer');
        const hasPokemon = filters.categories.includes('Pokémon') || filters.categories.includes('Pokemon');
        const hasEnergy = filters.categories.includes('Energy');

        const trainerSubtypes: string[] = [];
        if (hasSupporter) trainerSubtypes.push('Supporter');
        if (hasItem) trainerSubtypes.push('Item');
        if (hasStadium) trainerSubtypes.push('Stadium');
        if (hasTool) trainerSubtypes.push('Tool');

        if (trainerSubtypes.length > 0) {
          params.set('category', 'Trainer');
          params.set('trainerType', trainerSubtypes.join(','));
        } else if (hasTrainer) {
          params.set('category', 'Trainer');
        } else if (hasPokemon) {
          params.set('category', 'Pokemon');
        } else if (hasEnergy) {
          params.set('category', 'Energy');
        }
      }

      if (hasRarities) {
        params.set('rarity', filters.rarities.join(','));
      }

      const res = await fetch(`/api/cards?${params.toString()}`);
      const json = await res.json();
      const results = json.data || [];
      setSearchResults(results);
      if (results.length > 0) {
        setCachedCatalog(baseCacheKey, results);
        if (forceRefresh) {
          showToast('Live market prices refreshed & saved for 5 days!', 'success');
        }
      } else {
        showToast('No cards found matching your criteria.', 'info');
      }
    } catch {
      showToast('Failed to fetch cards. Please try again.', 'error');
    } finally {
      clearInterval(progressTimer);
      clearTimeout(status1);
      clearTimeout(status2);
      setSearchProgress(100);
      setTimeout(() => {
        setIsSearching(false);
        setSearchProgress(0);
      }, 180);
    }
  };

  // Toggle Owned card handler
  const handleToggleOwned = async (card: SearchCardResult) => {
    const res = await toggleCardOwned(card, tcg);
    if (res.status === 'added') {
      showToast(`Marked "${card.name}" as Owned in your Collection!`, 'success');
    } else if (res.status === 'removed') {
      showToast(`Removed "${card.name}" from your Collection.`, 'info');
    } else {
      showToast('Failed to update Collection.', 'error');
    }
  };

  // Auto-fetch base catalog when primary query, game, category, or rarity changes.
  useEffect(() => {
    if (initialFilterSkip.current) {
      initialFilterSkip.current = false;
      return;
    }

    const currentBaseSig = `${query.trim()}_${tcg}_${(filters.categories || []).sort().join(',')}_${(filters.rarities || []).sort().join(',')}`;
    if (currentBaseSig === lastQuerySignatureRef.current && searchResults.length > 0) {
      return;
    }

    const hasIntent =
      Boolean(query.trim()) ||
      (filters.categories && filters.categories.length > 0) ||
      (filters.rarities && filters.rarities.length > 0);

    if (hasIntent) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
      }, 250);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, tcg, filters.categories, filters.rarities]);

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

  // Cross-language rarity equivalence matcher
  const matchRarity = (cardRarity?: string, filterRarities: string[] = []): boolean => {
    if (!filterRarities || filterRarities.length === 0) return true;
    if (!cardRarity) return true;

    const cr = cardRarity.toLowerCase().trim();
    const frs = filterRarities.map((f) => f.toLowerCase().trim());
    if (frs.some((f) => cr.includes(f) || f.includes(cr))) return true;

    const EQUIV: Record<string, string[]> = {
      'promo': ['promo', 'promos', 'black star promo', 'svp', 'swshp', 'smp'],
      'ultra rare': ['ur', 'sr', 'super rare'],
      'super rare': ['sr', 'ultra rare'],
      'special illustration rare': ['sar', 'special art rare', 'sir'],
      'illustration rare': ['ar', 'art rare', 'ir'],
      'art rare': ['ar', 'illustration rare', 'ir'],
      'full art trainer': ['ultra rare', 'special illustration rare', 'sr', 'sar', 'full art'],
      'character rare': ['chr', 'character rare'],
      'character super rare': ['csr', 'character super rare'],
      'hyper rare': ['hr', 'ur', 'secret rare'],
      'secret rare': ['sec', 'ur', 'hyper rare', 'rainbow rare'],
      'double rare': ['rr', 'double rare', 'ex'],
      'rare holo': ['r', 'holo', 'rare holo', 'holo rare'],
      'holo rare': ['r', 'holo', 'rare holo', 'holo rare'],
      'shiny holo rare': ['shiny', 'shiny holo rare', 's'],
      'prism rare': ['prism', 'prism rare'],
      'kagayaku': ['radiant', 'kagayaku', 'sparkling']
    };

    for (const f of frs) {
      const list = EQUIV[f] || [];
      if (list.some((eq) => cr.includes(eq) || eq.includes(cr))) return true;
    }
    return false;
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
          return (
            cLower === catLower ||
            tLower === catLower ||
            cLower.includes(catLower) ||
            tLower.includes(catLower) ||
            catLower.includes(cLower) ||
            catLower.includes(tLower)
          );
        });
      });
    }

    // Filter by Rarity multi-select with cross-language equivalence
    if (filters.rarities?.length > 0) {
      list = list.filter((card) => matchRarity(card.rarity, filters.rarities));
    }

    // Filter by Language multi-select (OR / UNION)
    if (filters.languages?.length > 0) {
      list = list.filter((card) => {
        const lang = card.language || 'en';
        if (filters.languages.includes(lang)) return true;
        if (card.languages) {
          return filters.languages.some((l) => Boolean(card.languages?.[l]));
        }
        return false;
      });
    }

    return list;
  }, [searchResults, filters.onlyUnowned, filters.categories, filters.rarities, filters.languages, myCollection, myList]);

  // Add Card to Wishlist (Tracked)
  const handleAddWishlist = async (card: SearchCardResult) => {
    const isJa = card.language === 'ja' || (card.name ? /\[(JA|JP)\]/i.test(card.name) : false);
    const isOp = card.game === 'onepiece' || card.language === 'onepiece';
    const targetGame: TcgGame = isJa ? 'pokemon-japan' : isOp ? 'onepiece' : (card.game || tcg);

    const success = await addToTracked(card, targetGame);
    if (success) {
      showToast(
        `Added ${card.name} to your ${targetGame === 'pokemon-japan' ? 'Pokémon Japan' : 'Wishlist'}!`,
        'success'
      );
    } else {
      showToast('Failed to add card to wishlist.', 'error');
    }
  };

  // Add single optimized lowest-cost version to Wishlist
  const handleAddOptimizedToList = async (card: SearchCardResult) => {
    const lang = card.cheapestLanguage || 'en';
    const langUpper = lang.toUpperCase();
    const isJa = lang === 'ja';
    const isOp = lang === 'onepiece';
    const targetGame: TcgGame = isJa ? 'pokemon-japan' : isOp ? 'onepiece' : 'pokemon';

    const optimizedCard: SearchCardResult = {
      ...card,
      name: `${card.name} [${langUpper}]`,
      price: card.cheapestPrice ?? card.price,
      language: lang,
      game: targetGame,
      tcgplayerId: isJa ? undefined : card.tcgplayerId
    };

    const success = await addToTracked(optimizedCard, targetGame);
    if (success) {
      showToast(
        `Wishlisted ${optimizedCard.name} (${formatCurrency(optimizedCard.price)}) in ${targetGame === 'pokemon-japan' ? 'Pokémon Japan' : 'Wishlist'}!`,
        'success'
      );
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
      const isJa = lang === 'ja';
      const isOp = lang === 'onepiece';
      const targetGame: TcgGame = isJa ? 'pokemon-japan' : isOp ? 'onepiece' : 'pokemon';

      const optimizedCard: SearchCardResult = {
        ...card,
        name: `${card.name} [${lang.toUpperCase()}]`,
        price: card.cheapestPrice ?? card.price,
        language: lang,
        game: targetGame,
        tcgplayerId: isJa ? undefined : card.tcgplayerId
      };
      const ok = await addToTracked(optimizedCard, targetGame);
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
  const filteredCollection = myCollection.filter((c) => {
    const isJa = c.game === 'pokemon-japan' || c.language === 'ja' || (c.name ? /\[(JA|JP)\]/i.test(c.name) : false);
    const isOp = c.game === 'onepiece' || c.language === 'onepiece';
    const cardGame: TcgGame = isJa ? 'pokemon-japan' : isOp ? 'onepiece' : (c.game || 'pokemon');
    return cardGame === tcg;
  });
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
        trackedCount={myList.filter((c) => {
          const isJa = c.game === 'pokemon-japan' || c.language === 'ja' || (c.name ? /\[(JA|JP)\]/i.test(c.name) : false);
          const isOp = c.game === 'onepiece' || c.language === 'onepiece';
          const cardGame: TcgGame = isJa ? 'pokemon-japan' : isOp ? 'onepiece' : (c.game || 'pokemon');
          return cardGame === tcg;
        }).length}
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
              onRefreshPrices={() => handleSearch(undefined, true)}
              isLoading={isSearching}
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              totalResults={displayedSearchResults.length}
            />

            {/* SEARCH RESULTS WITH MULTI-LANGUAGE PRICING */}
            {isSearching ? (
              <SearchLoadingBanner
                progress={searchProgress}
                statusMessage={searchStatus}
                targetCountText="791+ matching cards"
              />
            ) : displayedSearchResults.length > 0 ? (
              <SearchResults
                results={displayedSearchResults}
                onAddToList={handleAddWishlist}
                onAddOptimizedToList={handleAddOptimizedToList}
                onAddAllOptimized={handleAddAllOptimized}
                onOpenSniper={handleOpenSniperModal}
                onToggleOwned={handleToggleOwned}
                isOwned={(card) =>
                  myCollection.some((c) => {
                    if (card.id && c.card_id && String(c.card_id) === String(card.id)) return true;
                    return c.name.toLowerCase().trim() === card.name.toLowerCase().trim();
                  })
                }
                isTracked={(card) =>
                  myList.some((c) => {
                    if (card.id && c.card_id && String(c.card_id) === String(card.id)) return true;
                    return c.name.toLowerCase().trim() === card.name.toLowerCase().trim();
                  })
                }
              />
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
          </div>
        )}

        {/* TAB: LIVE AUCTIONS */}
        {activeTab === 'auctions' && (
          <AuctionsTab
            user={user}
            onLogin={handleLogin}
            deals={deals}
            isLoading={dealsLoading}
            tcg={tcg}
            setTcg={setTcg}
            onRefresh={fetchDealsData}
          />
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
