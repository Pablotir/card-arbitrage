'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CardItem, SearchCardResult, TcgGame, StorageMode, CardLanguage } from '@/lib/types';
import {
  getLocalCards,
  saveLocalCard,
  updateLocalCard,
  updateLocalCardFields,
  deleteLocalCard,
  moveLocalCardToCollection,
  getStorageMode,
  setStorageMode,
  migrateCloudToLocal,
  clearCloudCards
} from '@/lib/storage';
import { formatTcgplayerLink } from '@/utils/cardLinks';

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
    return fn();
  }
}

export function useCards(userId: string) {
  const [myList, setMyList] = useState<CardItem[]>([]);
  const [myCollection, setMyCollection] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [storageMode, setStorageModeState] = useState<StorageMode>('local');
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    setStorageModeState(getStorageMode());
  }, []);

  const fetchCards = useCallback(async (uid: string) => {
    const currentMode = getStorageMode();

    if (currentMode === 'local') {
      const localTracked = getLocalCards('tracked');
      const localCollection = getLocalCards('collection');

      // If local storage is completely empty but uid is present, check cloud for initial seed
      if (localTracked.length === 0 && localCollection.length === 0 && uid && supabase) {
        try {
          const { data } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', uid);
          if (data && data.length > 0) {
            await migrateCloudToLocal(uid);
            setMyList(getLocalCards('tracked'));
            setMyCollection(getLocalCards('collection'));
            return;
          }
        } catch {
          // Fall through to empty local lists
        }
      }

      setMyList(localTracked);
      setMyCollection(localCollection);
      return;
    }

    // Cloud Mode
    if (!supabase || !uid) return;
    try {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', uid);

      if (data) {
        const sorted = data.sort(
          (a: any, b: any) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setMyList(sorted.filter((c: any) => c.status === 'tracked'));
        setMyCollection(sorted.filter((c: any) => c.status === 'collection'));
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
    }
  }, []);

  const switchStorageMode = (mode: StorageMode) => {
    setStorageMode(mode);
    setStorageModeState(mode);
    fetchCards(userId);
  };

  const handleMigrateFromServer = async () => {
    if (!userId) return { success: false, count: 0 };
    setIsMigrating(true);
    try {
      const result = await migrateCloudToLocal(userId);
      setStorageMode('local');
      setStorageModeState('local');
      fetchCards(userId);
      setIsMigrating(false);
      return {
        success: true,
        count: result.wishlistCount + result.collectionCount,
        wishlistCount: result.wishlistCount,
        collectionCount: result.collectionCount
      };
    } catch (err) {
      setIsMigrating(false);
      return { success: false, count: 0 };
    }
  };

  const handleClearServerCards = async () => {
    if (!userId) return false;
    return await clearCloudCards(userId);
  };

  const addToTracked = async (card: SearchCardResult, game: TcgGame) => {
    const isJa = card.language === 'ja' || (card.name ? /\[(JA|JP)\]/i.test(card.name) : false) || game === 'pokemon-japan';
    const isOp = card.game === 'onepiece' || card.language === 'onepiece' || game === 'onepiece';
    const resolvedGame: TcgGame = isJa ? 'pokemon-japan' : isOp ? 'onepiece' : (game || 'pokemon');

    const cleanCard: SearchCardResult = {
      ...card,
      game: resolvedGame,
      language: card.language || (isJa ? 'ja' : isOp ? 'onepiece' : 'en')
    };

    const tcgId = cleanCard.tcgplayerId || cleanCard.id;
    const tcgLink = formatTcgplayerLink({
      ...cleanCard,
      grade: 'Near Mint'
    });

    const newCard = {
      user_id: userId,
      card_id: String(tcgId),
      name: cleanCard.name,
      set_name: cleanCard.setName || cleanCard.set_name || 'Expansion',
      image: cleanCard.image || cleanCard.imageUrl || '',
      grade: 'Near Mint',
      is_first_edition: false,
      live_price: cleanCard.price ? String(cleanCard.price) : 'N/A',
      status: 'tracked' as const,
      best_link: tcgLink,
      best_source: cleanCard.price ? 'TCGPlayer' : '',
      game: resolvedGame,
      language: cleanCard.language
    };

    if (storageMode === 'local') {
      const created = saveLocalCard(newCard, 'tracked');
      setMyList((prev) => [created, ...prev]);
      return true;
    }

    // Cloud insert
    const { error } = await supabase.from('cards').insert(newCard);
    if (!error) {
      fetchCards(userId);
      return true;
    }
    return false;
  };

  const updateCardDetails = async (cardDbId: number, field: string, value: any) => {
    if (storageMode === 'local') {
      updateLocalCard(cardDbId, field, value);
      setMyList((prev) =>
        prev.map((c) => (c.id === cardDbId ? { ...c, [field]: value } : c))
      );
      return;
    }

    setMyList((prev) =>
      prev.map((c) => (c.id === cardDbId ? { ...c, [field]: value } : c))
    );
    await supabase.from('cards').update({ [field]: value }).eq('id', cardDbId);
  };

  const deleteCard = async (cardDbId: number) => {
    if (storageMode === 'local') {
      deleteLocalCard(cardDbId);
      setMyList((prev) => prev.filter((c) => c.id !== cardDbId));
      setMyCollection((prev) => prev.filter((c) => c.id !== cardDbId));
      return;
    }

    await supabase.from('cards').delete().eq('id', cardDbId);
    fetchCards(userId);
  };

  const moveToCollection = async (card: CardItem, purchasePrice: number) => {
    if (storageMode === 'local') {
      const ok = moveLocalCardToCollection(card.id, purchasePrice);
      if (ok) {
        setMyList((prev) => prev.filter((c) => c.id !== card.id));
        setMyCollection((prev) => [
          { ...card, status: 'collection', purchase_price: purchasePrice },
          ...prev
        ]);
        return true;
      }
      return false;
    }

    const { error } = await supabase
      .from('cards')
      .update({ status: 'collection', purchase_price: purchasePrice })
      .eq('id', card.id);

    if (!error) {
      fetchCards(userId);
      return true;
    }
    return false;
  };

  const toggleCardOwned = async (card: SearchCardResult, game: TcgGame) => {
    const tcgId = card.tcgplayerId || card.id;
    const cardName = card.name.toLowerCase().trim();

    // Check if card is currently in collection
    const existing = myCollection.find((c) => {
      if (c.card_id && String(c.card_id) === String(tcgId)) return true;
      return c.name.toLowerCase().trim() === cardName;
    });

    if (existing) {
      // Un-own: delete from collection
      await deleteCard(existing.id);
      return { status: 'removed' as const, card: existing };
    }

    // Add to collection
    const numPrice = typeof card.price === 'string' ? parseFloat(card.price) : typeof card.price === 'number' ? card.price : 0;
    const resolvedPurchasePrice = !isNaN(numPrice) && numPrice > 0 ? numPrice : 0;

    const isJa = card.language === 'ja' || (card.name ? /\[(JA|JP)\]/i.test(card.name) : false) || game === 'pokemon-japan';
    const isOp = card.game === 'onepiece' || card.language === 'onepiece' || game === 'onepiece';
    const resolvedGame: TcgGame = isJa ? 'pokemon-japan' : isOp ? 'onepiece' : (game || 'pokemon');

    const cleanCard: SearchCardResult = {
      ...card,
      game: resolvedGame,
      language: card.language || (isJa ? 'ja' : isOp ? 'onepiece' : 'en')
    };

    const tcgLink = formatTcgplayerLink({
      ...cleanCard,
      grade: 'Near Mint'
    });

    const newCard = {
      user_id: userId,
      card_id: String(cleanCard.tcgplayerId || cleanCard.id),
      name: cleanCard.name,
      set_name: cleanCard.setName || cleanCard.set_name || 'Expansion',
      image: cleanCard.image || cleanCard.imageUrl || '',
      grade: 'Near Mint',
      is_first_edition: false,
      live_price: cleanCard.price ? String(cleanCard.price) : 'N/A',
      purchase_price: resolvedPurchasePrice,
      status: 'collection' as const,
      best_link: tcgLink,
      best_source: cleanCard.price ? 'TCGPlayer' : '',
      game: resolvedGame,
      language: cleanCard.language
    };

    if (storageMode === 'local') {
      const created = saveLocalCard(newCard, 'collection');
      setMyCollection((prev) => [created, ...prev]);
      // Remove from wishlist if it was there
      setMyList((prev) => prev.filter((w) => String(w.card_id) !== String(tcgId) && w.name.toLowerCase().trim() !== cardName));
      return { status: 'added' as const, card: created };
    }

    const { data, error } = await supabase.from('cards').insert(newCard).select().single();
    if (!error && data) {
      setMyCollection((prev) => [data, ...prev]);
      return { status: 'added' as const, card: data };
    }
    return { status: 'error' as const };
  };

  const addCardToCollection = async (
    card: SearchCardResult | CardItem,
    details: { purchasePrice: number; language: CardLanguage; grade: string }
  ) => {
    const tcgId = (card as any).tcgplayerId || (card as any).card_id || card.id;
    const cardName = card.name.toLowerCase().trim();

    const isJa = details.language === 'ja' || (card.name ? /\[(JA|JP)\]/i.test(card.name) : false);
    const isOp = details.language === 'onepiece';
    const resolvedGame: TcgGame = isJa ? 'pokemon-japan' : isOp ? 'onepiece' : 'pokemon';

    const cleanCard: SearchCardResult = {
      ...(card as any),
      game: resolvedGame,
      language: details.language
    };

    const tcgLink = formatTcgplayerLink({
      ...cleanCard,
      grade: details.grade
    });

    const newCard = {
      user_id: userId,
      card_id: String(tcgId),
      name: cleanCard.name,
      set_name: cleanCard.setName || (cleanCard as any).set_name || 'Expansion',
      image: cleanCard.image || cleanCard.imageUrl || '',
      grade: details.grade,
      is_first_edition: false,
      live_price: cleanCard.price ? String(cleanCard.price) : 'N/A',
      purchase_price: details.purchasePrice,
      status: 'collection' as const,
      best_link: tcgLink,
      best_source: cleanCard.price ? 'TCGPlayer' : '',
      game: resolvedGame,
      language: details.language
    };

    if (storageMode === 'local') {
      const created = saveLocalCard(newCard, 'collection');
      setMyCollection((prev) => [created, ...prev]);
      setMyList((prev) =>
        prev.filter((w) => String(w.card_id) !== String(tcgId) && w.name.toLowerCase().trim() !== cardName)
      );
      return { status: 'added' as const, card: created };
    }

    const { data, error } = await supabase.from('cards').insert(newCard).select().single();
    if (!error && data) {
      setMyCollection((prev) => [data, ...prev]);
      return { status: 'added' as const, card: data };
    }
    return { status: 'error' as const };
  };

  const updateCollectionCard = async (
    cardId: number,
    details: { purchasePrice: number; language: CardLanguage; grade: string }
  ) => {
    const updates: Partial<CardItem> = {
      purchase_price: details.purchasePrice,
      language: details.language,
      grade: details.grade
    };

    if (storageMode === 'local') {
      updateLocalCardFields(cardId, updates);
      setMyCollection((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c))
      );
      setMyList((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c))
      );
      return true;
    }

    const { error } = await supabase.from('cards').update(updates).eq('id', cardId);
    if (!error) {
      setMyCollection((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c))
      );
      return true;
    }
    return false;
  };

  const handleBatchRefresh = async () => {
    const allCards = [...myList, ...myCollection];
    if (allCards.length === 0) return;

    setIsLoading(true);
    setServerError(null);

    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    const cardsToUpdate = allCards.filter((c) => {
      if (!c.last_price_update) return true;
      const lastUpdate = new Date(c.last_price_update).getTime();
      return now - lastUpdate > TWENTY_FOUR_HOURS;
    });

    if (cardsToUpdate.length === 0) {
      setIsLoading(false);
      return { skipped: true };
    }

    const batchPayload = cardsToUpdate.map((c) => ({
      id: c.card_id,
      name: c.name,
      set: c.set_name && !c.set_name.toLowerCase().includes('unknown') ? c.set_name : '',
      grade: c.grade,
      isFirstEdition: c.is_first_edition,
      game: c.game || 'pokemon'
    }));

    try {
      const responseJson = await withRetry(async () => {
        const r = await fetch(`/api/cards?t=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cards: batchPayload }),
          cache: 'no-store'
        });
        const json = await r.json();
        if (!r.ok) throw new Error('Update failed');
        return json;
      });

      if (responseJson.data) {
        for (const updated of responseJson.data) {
          const updatePayload: any = {
            ebay_price: updated.ebayPrice,
            ebay_link: updated.ebayLink,
            last_price_update: new Date().toISOString()
          };

          if (updated.bestSource === 'TCGPlayer' && updated.tcgPrice) {
            updatePayload.live_price = updated.tcgPrice;
            updatePayload.best_link = updated.tcgLink;
            updatePayload.best_source = 'TCGPlayer';
          } else if (updated.bestSource === 'JustTCG' && updated.tcgPrice) {
            updatePayload.live_price = updated.tcgPrice;
            updatePayload.best_link = updated.tcgLink;
            updatePayload.best_source = 'JustTCG';
          } else if (updated.bestSource === 'eBay' && updated.ebayPrice) {
            updatePayload.live_price = updated.ebayPrice;
            updatePayload.best_link = updated.ebayLink;
            updatePayload.best_source = 'eBay';
          }

          if (storageMode === 'local') {
            const cardObj = allCards.find((c) => String(c.card_id) === String(updated.id));
            if (cardObj) {
              for (const [k, v] of Object.entries(updatePayload)) {
                updateLocalCard(cardObj.id, k, v);
              }
            }
          } else {
            await supabase
              .from('cards')
              .update(updatePayload)
              .eq('card_id', updated.id)
              .eq('user_id', userId);
          }
        }
      }
      fetchCards(userId);
      return { count: cardsToUpdate.length };
    } catch (error: any) {
      setServerError("Failed to refresh prices. Please try again later.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEbayOnlyRefresh = async () => {
    const allCards = [...myList, ...myCollection];
    if (allCards.length === 0) return;

    setIsLoading(true);
    setServerError(null);

    const now = Date.now();
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    const cardsToUpdate = allCards.filter((c) => {
      if (!c.last_ebay_check) return true;
      const lastCheck = new Date(c.last_ebay_check).getTime();
      return now - lastCheck > TWO_HOURS;
    });

    if (cardsToUpdate.length === 0) {
      setIsLoading(false);
      return { skipped: true };
    }

    const payload = cardsToUpdate.map((c) => ({
      id: c.card_id,
      name: c.name,
      set: c.set_name && !c.set_name.toLowerCase().includes('unknown') ? c.set_name : '',
      grade: c.grade,
      isFirstEdition: c.is_first_edition,
      game: c.game || 'pokemon',
      ebayOnly: true
    }));

    try {
      const responseJson = await withRetry(async () => {
        const r = await fetch(`/api/cards?t=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cards: payload }),
          cache: 'no-store'
        });
        const json = await r.json();
        if (!r.ok) throw new Error('eBay refresh failed');
        return json;
      });

      if (responseJson.data) {
        for (const updated of responseJson.data) {
          const updatePayload: any = {
            ebay_price: updated.ebayPrice,
            ebay_link: updated.ebayLink,
            last_ebay_check: new Date().toISOString()
          };

          if (updated.bestSource === 'eBay' && updated.ebayPrice) {
            updatePayload.live_price = updated.ebayPrice;
            updatePayload.best_link = updated.ebayLink;
            updatePayload.best_source = 'eBay';
          }

          if (storageMode === 'local') {
            const cardObj = allCards.find((c) => String(c.card_id) === String(updated.id));
            if (cardObj) {
              for (const [k, v] of Object.entries(updatePayload)) {
                updateLocalCard(cardObj.id, k, v);
              }
            }
          } else {
            await supabase
              .from('cards')
              .update(updatePayload)
              .eq('card_id', updated.id)
              .eq('user_id', userId);
          }
        }
      }
      fetchCards(userId);
      return { count: cardsToUpdate.length };
    } catch (err: any) {
      setServerError("Failed to refresh eBay sold comps. Please try again later.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    myList,
    myCollection,
    isLoading,
    serverError,
    storageMode,
    isMigrating,
    switchStorageMode,
    handleMigrateFromServer,
    handleClearServerCards,
    setServerError,
    fetchCards,
    addToTracked,
    updateCardDetails,
    deleteCard,
    moveToCollection,
    toggleCardOwned,
    addCardToCollection,
    updateCollectionCard,
    handleBatchRefresh,
    handleEbayOnlyRefresh
  };
}
