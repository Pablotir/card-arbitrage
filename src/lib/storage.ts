'use client';

import { CardItem, StorageMode } from './types';
import { supabase } from './supabase';

const WISHLIST_KEY = 'cfinder_wishlist_cards';
const COLLECTION_KEY = 'cfinder_collection_cards';
const STORAGE_MODE_KEY = 'cfinder_storage_mode';

export function getStorageMode(): StorageMode {
  if (typeof window === 'undefined') return 'local';
  const saved = localStorage.getItem(STORAGE_MODE_KEY);
  return (saved === 'cloud' ? 'cloud' : 'local');
}

export function setStorageMode(mode: StorageMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_MODE_KEY, mode);
}

export function getLocalCards(status: 'tracked' | 'collection'): CardItem[] {
  if (typeof window === 'undefined') return [];
  const key = status === 'tracked' ? WISHLIST_KEY : COLLECTION_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalCard(
  cardData: Omit<CardItem, 'id' | 'created_at'>,
  status: 'tracked' | 'collection'
): CardItem {
  const current = getLocalCards(status);
  const newCard: CardItem = {
    ...cardData,
    id: Date.now() + Math.floor(Math.random() * 1000),
    status,
    created_at: new Date().toISOString()
  };

  const updated = [newCard, ...current];
  const key = status === 'tracked' ? WISHLIST_KEY : COLLECTION_KEY;
  localStorage.setItem(key, JSON.stringify(updated));
  return newCard;
}

export function updateLocalCard(id: number, field: string, value: any): void {
  // Check both lists
  for (const status of ['tracked', 'collection'] as const) {
    const cards = getLocalCards(status);
    const index = cards.findIndex((c) => c.id === id);
    if (index !== -1) {
      cards[index] = { ...cards[index], [field]: value };
      const key = status === 'tracked' ? WISHLIST_KEY : COLLECTION_KEY;
      localStorage.setItem(key, JSON.stringify(cards));
      return;
    }
  }
}

export function deleteLocalCard(id: number): void {
  for (const status of ['tracked', 'collection'] as const) {
    const cards = getLocalCards(status);
    const filtered = cards.filter((c) => c.id !== id);
    if (filtered.length !== cards.length) {
      const key = status === 'tracked' ? WISHLIST_KEY : COLLECTION_KEY;
      localStorage.setItem(key, JSON.stringify(filtered));
      return;
    }
  }
}

export function moveLocalCardToCollection(id: number, purchasePrice: number): boolean {
  const wishlist = getLocalCards('tracked');
  const target = wishlist.find((c) => c.id === id);
  if (!target) return false;

  // Remove from wishlist
  const remainingWishlist = wishlist.filter((c) => c.id !== id);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(remainingWishlist));

  // Add to collection
  const collection = getLocalCards('collection');
  const movedCard: CardItem = {
    ...target,
    status: 'collection',
    purchase_price: purchasePrice
  };
  localStorage.setItem(COLLECTION_KEY, JSON.stringify([movedCard, ...collection]));
  return true;
}

export async function migrateCloudToLocal(userId: string): Promise<{
  wishlistCount: number;
  collectionCount: number;
}> {
  if (!supabase || !userId) {
    return { wishlistCount: 0, collectionCount: 0 };
  }

  // 1. Fetch from Supabase
  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId);

  if (!data || data.length === 0) {
    return { wishlistCount: 0, collectionCount: 0 };
  }

  const cloudWishlist = data.filter((c: any) => c.status === 'tracked');
  const cloudCollection = data.filter((c: any) => c.status === 'collection');

  // 2. Merge into local storage (avoid duplicates by card_id + name)
  const existingWishlist = getLocalCards('tracked');
  const existingCollection = getLocalCards('collection');

  const mergedWishlist = [...existingWishlist];
  for (const card of cloudWishlist) {
    if (!mergedWishlist.some((c) => c.card_id === card.card_id && c.name === card.name)) {
      mergedWishlist.push(card);
    }
  }

  const mergedCollection = [...existingCollection];
  for (const card of cloudCollection) {
    if (!mergedCollection.some((c) => c.card_id === card.card_id && c.name === card.name)) {
      mergedCollection.push(card);
    }
  }

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(mergedWishlist));
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(mergedCollection));
  setStorageMode('local');

  return {
    wishlistCount: cloudWishlist.length,
    collectionCount: cloudCollection.length
  };
}

export async function clearCloudCards(userId: string): Promise<boolean> {
  if (!supabase || !userId) return false;
  const { error } = await supabase.from('cards').delete().eq('user_id', userId);
  return !error;
}
