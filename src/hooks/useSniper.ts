'use client';

import { useState, useCallback } from 'react';
import { SnipeRule } from '@/lib/types';

export function useSniper(_userId?: string) {
  const [rules, setRules] = useState<SnipeRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRules = useCallback(async (uid: string) => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sniper?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        setRules(data.data || []);
      }
    } catch (err) {
      console.error('Error loading snipe rules:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRule = (newRule: SnipeRule) => {
    setRules((prev) => [newRule, ...prev]);
  };

  const deleteRule = async (id: number | string) => {
    try {
      const res = await fetch(`/api/sniper?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== id));
        return true;
      }
    } catch (err) {
      console.error('Error deleting snipe rule:', err);
    }
    return false;
  };

  return {
    rules,
    isLoading,
    fetchRules,
    addRule,
    deleteRule
  };
}
