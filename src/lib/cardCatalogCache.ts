import { SearchCardResult } from './types';

const CACHE_PREFIX = 'cfinder_catalog_cache_v2_';
const OLD_PREFIXES = ['cfinder_catalog_cache_v1_'];
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds (432,000,000 ms)

export interface CatalogCacheEntry {
  timestamp: number;
  data: SearchCardResult[];
  key: string;
}

/**
 * Automatically purges obsolete legacy cache versions (e.g. v1)
 */
function purgeLegacyCaches(): void {
  if (typeof window === 'undefined') return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && OLD_PREFIXES.some(p => k.startsWith(p))) {
        toRemove.push(k);
      }
    }
    for (const k of toRemove) localStorage.removeItem(k);
  } catch {}
}

/**
 * Retrieves cached card catalog results from localStorage if within 5-day expiration window.
 */
export function getCachedCatalog(key: string): SearchCardResult[] | null {
  if (typeof window === 'undefined') return null;
  try {
    purgeLegacyCaches();
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const entry: CatalogCacheEntry = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;

    if (age > FIVE_DAYS_MS) {
      // Expired (> 5 days)
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch (err) {
    console.warn('Failed to retrieve catalog cache:', err);
    return null;
  }
}

/**
 * Saves card catalog results to localStorage with a 5-day expiration timestamp.
 */
export function setCachedCatalog(key: string, data: SearchCardResult[]): void {
  if (typeof window === 'undefined' || !data || data.length === 0) return;
  try {
    const entry: CatalogCacheEntry = {
      timestamp: Date.now(),
      data,
      key
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (err) {
    // If localStorage quota exceeded, clear older caches
    console.warn('Failed to save catalog cache, pruning old entries:', err);
    pruneOldCatalogCache();
    try {
      const entry: CatalogCacheEntry = {
        timestamp: Date.now(),
        data,
        key
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // Storage full
    }
  }
}

/**
 * Returns the age in days of the cached catalog, or null if not cached.
 */
export function getCatalogCacheAgeDays(key: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry: CatalogCacheEntry = JSON.parse(raw);
    const ageMs = Date.now() - entry.timestamp;
    return Math.floor(ageMs / (24 * 60 * 60 * 1000));
  } catch {
    return null;
  }
}

/**
 * Deletes all cached search catalog entries (forces price refresh).
 */
export function clearCatalogCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        toRemove.push(key);
      }
    }
    for (const key of toRemove) {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn('Failed to clear catalog cache:', err);
  }
}

/**
 * Helper to remove old/expired caches if storage limit is approached.
 */
function pruneOldCatalogCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const entries: { key: string; timestamp: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith(CACHE_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(storageKey) || '{}');
          entries.push({ key: storageKey, timestamp: item.timestamp || 0 });
        } catch {
          localStorage.removeItem(storageKey);
        }
      }
    }
    // Sort oldest first and delete top half
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toDelete = entries.slice(0, Math.ceil(entries.length / 2));
    for (const item of toDelete) {
      localStorage.removeItem(item.key);
    }
  } catch {
    // Ignore
  }
}
