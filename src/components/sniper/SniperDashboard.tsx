'use client';

import { useState } from 'react';
import { SnipeRule, SnipeMatch } from '@/lib/types';
import { formatCurrency } from '@/utils/format';
import {
  Target,
  Plus,
  Play,
  Trash2,
  ExternalLink,
  Bot,
  Zap,
  Loader2
} from 'lucide-react';

interface SniperDashboardProps {
  rules: SnipeRule[];
  onOpenCreateModal: () => void;
  onDeleteRule: (id: number | string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function SniperDashboard({
  rules,
  onOpenCreateModal,
  onDeleteRule,
  onShowToast
}: SniperDashboardProps) {
  const [testingRuleId, setTestingRuleId] = useState<string | number | null>(null);
  const [liveMatches, setLiveMatches] = useState<{ [key: string]: SnipeMatch[] }>({});
  const [testingAll, setTestingAll] = useState(false);

  const handleTestRule = async (rule: SnipeRule) => {
    setTestingRuleId(rule.id);
    try {
      const res = await fetch('/api/sniper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          card_name: rule.spec_filters?.card_name || rule.category,
          set_name: rule.spec_filters?.set_name || '',
          max_price: rule.target_price,
          condition: rule.max_condition || 'Near Mint',
          discord_webhook_url: rule.discord_webhook_url
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Test failed');

      const matches: SnipeMatch[] = data.data || [];
      setLiveMatches((prev) => ({ ...prev, [String(rule.id)]: matches }));

      if (matches.length > 0) {
        onShowToast(
          `?? Found ${matches.length} listings under $${rule.target_price}!`,
          'success'
        );
      } else {
        onShowToast(
          `No listings under $${rule.target_price} right now. Your bot will keep watching!`,
          'info'
        );
      }
    } catch (err: any) {
      onShowToast(err.message || 'Failed to scan eBay', 'error');
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleTestAll = async () => {
    if (rules.length === 0) return;
    setTestingAll(true);
    for (const rule of rules) {
      await handleTestRule(rule);
      await new Promise((r) => setTimeout(r, 600)); // Rate limit safety
    }
    setTestingAll(false);
  };

  return (
    <div className="space-y-6">
      {/* Bot Status & Quick Arm Banner */}
      <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-purple-800/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/30">
              <Bot className="w-3.5 h-3.5" />
              <span>HardwareSniper Discord Bot Linked</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Automated eBay Near Mint Sniping
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Rules configured here sync instantly with your background Discord bot. When an undervalued Near Mint card is listed on eBay, you receive alerts immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="bg-white text-purple-900 hover:bg-purple-50 px-5 py-3 rounded-xl font-black text-xs transition shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Arm New Snipe</span>
            </button>

            {rules.length > 0 && (
              <button
                type="button"
                onClick={handleTestAll}
                disabled={testingAll}
                className="bg-purple-800/80 hover:bg-purple-700/80 border border-purple-600/50 text-white px-4 py-3 rounded-xl font-bold text-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                {testingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Scan All Live</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Snipe Rules List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 overflow-hidden transition-colors">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Active Snipe Targets ({rules.length})</span>
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Synced with Supabase snipes table
            </span>
          </div>
        </div>

        {rules.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Target className="w-12 h-12 mx-auto text-purple-300 dark:text-purple-700 mb-3" />
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              No active snipes configured
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Arm a snipe for any card (like Mega Rayquaza ex or Charizard) to automatically catch Near Mint deals below your target price.
            </p>
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Snipe</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {rules.map((rule) => {
              const cardName = rule.spec_filters?.card_name || 'Card';
              const setName = rule.spec_filters?.set_name || 'Any Set';
              const isScanning = testingRuleId === rule.id;
              const matches = liveMatches[String(rule.id)] || [];

              return (
                <div key={rule.id} className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 dark:text-gray-100 text-base">
                          {cardName}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full uppercase">
                          Active Bot Tracking
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60">
                          {setName}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          Condition: <strong className="text-gray-800 dark:text-gray-200">{rule.max_condition}</strong>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          Target: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">&lt; {formatCurrency(rule.target_price)}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestRule(rule)}
                        disabled={isScanning}
                        className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50"
                      >
                        {isScanning ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        )}
                        <span>{isScanning ? 'Scanning...' : 'Test Snipe Now'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteRule(rule.id)}
                        className="text-gray-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Live Matched Listings Feed for this rule */}
                  {matches.length > 0 && (
                    <div className="bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/60 rounded-xl p-3 space-y-2">
                      <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
                        ?? {matches.length} eBay Listings Found Below ${rule.target_price}:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {matches.map((m, mIdx) => (
                          <a
                            key={m.id || mIdx}
                            href={m.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-purple-200/60 dark:border-purple-800/60 hover:shadow-xs transition flex items-center gap-3"
                          >
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {m.image ? (
                                <img src={m.image} alt={m.title} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-[8px] text-gray-400">Item</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                {m.title}
                              </p>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(m.price)}
                                </span>
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-0.5">
                                  Buy on eBay <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
