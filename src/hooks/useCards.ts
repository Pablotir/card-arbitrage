'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { CardItem, SearchCardResult, TcgGame } from '@/lib/types';

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

  const fetchCards = useCallback(async (uid: string) => {
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

  const addToTracked = async (card: SearchCardResult, game: TcgGame) => {
    const tcgId = card.tcgplayerId || card.id;
    const tcgLink = card.tcgplayerId
      ? `https://www.tcgplayer.com/product/${card.tcgplayerId}`
      : `https://justtcg.com/cards/${card.id}`;

    const newCard = {
      user_id: userId,
      card_id: String(tcgId),
      name: card.name,
      set_name: card.setName || card.set_name || 'Expansion',
      image: card.image || card.imageUrl || '',
      grade: 'Raw (Ungraded)',
      is_first_edition: false,
      live_price: card.price ? String(card.price) : 'N/A',
      status: 'tracked',
      best_link: tcgLink,
      best_source: card.price ? 'TCGPlayer' : '',
      game: game
    };

    const { error } = await supabase.from('cards').insert(newCard);
    if (!error) {
      fetchCards(userId);
      return true;
    }
    return false;
  };

  const updateCardDetails = async (cardDbId: number, field: string, value: any) => {
    setMyList((prev) =>
      prev.map((c) => (c.id === cardDbId ? { ...c, [field]: value } : c))
    );
    await supabase.from('cards').update({ [field]: value }).eq('id', cardDbId);
  };

  const deleteCard = async (cardDbId: number) => {
    await supabase.from('cards').delete().eq('id', cardDbId);
    fetchCards(userId);
  };

  const moveToCollection = async (card: CardItem, purchasePrice: number) => {
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

          await supabase
            .from('cards')
            .update(updatePayload)
            .eq('card_id', updated.id)
            .eq('user_id', userId);
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
    const ONE_HOUR = 60 * 60 * 1000;

    const cardsToCheck = allCards.filter((c) => {
      if (!c.last_ebay_check) return true;
      const lastCheck = new Date(c.last_ebay_check).getTime();
      return now - lastCheck > ONE_HOUR;
    });

    if (cardsToCheck.length === 0) {
      setIsLoading(false);
      return { skipped: true };
    }

    const batchPayload = cardsToCheck.map((c) => ({
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
          body: JSON.stringify({ cards: batchPayload }),
          cache: 'no-store'
        });
        const json = await r.json();
        if (!r.ok) throw new Error('eBay check failed');
        return json;
      });

      if (responseJson.data) {
        for (const updated of responseJson.data) {
          const currentCard = cardsToCheck.find((c) => c.card_id === updated.id);
          const updatePayload: any = {
            ebay_price: updated.ebayPrice,
            ebay_link: updated.ebayLink,
            last_ebay_check: new Date().toISOString()
          };

          if (updated.ebayPrice && currentCard?.live_price) {
            const ebayPrice = parseFloat(updated.ebayPrice);
            const currentPrice = parseFloat(currentCard.live_price);
            if (ebayPrice < currentPrice) {
              updatePayload.live_price = updated.ebayPrice;
              updatePayload.best_link = updated.ebayLink;
              updatePayload.best_source = 'eBay';
            }
          }

          await supabase
            .from('cards')
            .update(updatePayload)
            .eq('card_id', updated.id)
            .eq('user_id', userId);
        }
      }
      fetchCards(userId);
      return { count: cardsToCheck.length };
    } catch (error: any) {
      setServerError("Failed to check eBay prices.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    myList,
    myCollection,
    isLoading,
    serverError,
    setServerError,
    fetchCards,
    addToTracked,
    updateCardDetails,
    deleteCard,
    moveToCollection,
    handleBatchRefresh,
    handleEbayOnlyRefresh
  };
}
