'use client';

import { useState, useMemo } from 'react';
import { CardItem, SortField, SortOrder, TcgGame } from '@/lib/types';
import { SortHeader } from '../ui/SortHeader';
import { TcgToggle } from '../ui/TcgToggle';
import { formatCurrency, formatProfit } from '@/utils/format';
import { Search, RefreshCw, Sparkles, Trash2, Inbox } from 'lucide-react';

interface CollectionTableProps {
  collection: CardItem[];
  tcg: TcgGame;
  setTcg: (game: TcgGame) => void;
  onDeleteClick: (id: number) => void;
  onBatchRefresh: () => void;
  onEbayOnlyRefresh: () => void;
  isLoading: boolean;
}

export function CollectionTable({
  collection,
  tcg,
  setTcg,
  onDeleteClick,
  onBatchRefresh,
  onEbayOnlyRefresh,
  isLoading
}: CollectionTableProps) {
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState<SortField>('profit');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'profit' || field === 'price' ? 'desc' : 'asc');
    }
  };

  const filteredCollection = useMemo(() => {
    return collection
      .filter((card) => {
        if ((card.game || 'pokemon') !== tcg) return false;
        if (filterText.trim()) {
          const query = filterText.toLowerCase();
          const nameMatch = card.name?.toLowerCase().includes(query);
          const setMatch = card.set_name?.toLowerCase().includes(query);
          if (!nameMatch && !setMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') {
          cmp = (a.name || '').localeCompare(b.name || '');
        } else if (sortField === 'set') {
          cmp = (a.set_name || '').localeCompare(b.set_name || '');
        } else if (sortField === 'price') {
          const pA = parseFloat(a.live_price || '0') || 0;
          const pB = parseFloat(b.live_price || '0') || 0;
          cmp = pA - pB;
        } else if (sortField === 'profit') {
          const valA = parseFloat(a.live_price || '0') || 0;
          const costA = a.purchase_price || 0;
          const valB = parseFloat(b.live_price || '0') || 0;
          const costB = b.purchase_price || 0;
          cmp = (valA - costA) - (valB - costB);
        } else {
          cmp = (a.id || 0) - (b.id || 0);
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [collection, tcg, filterText, sortField, sortOrder]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 overflow-hidden transition-colors">
      {/* Header Bar */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            My Collection ({filteredCollection.length})
          </h2>
          <TcgToggle value={tcg} onChange={setTcg} />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEbayOnlyRefresh}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Checking...' : 'Check eBay'}</span>
          </button>

          <button
            type="button"
            onClick={onBatchRefresh}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Update Values'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="relative max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search collection by name or set..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      {filteredCollection.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <Inbox className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Your collection is empty
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto mt-1">
            Track cards and click &quot;Bought&quot; to log your purchase price and track real-time profit and loss.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 text-xs">
              <tr>
                <th className="p-4 w-20">Card</th>
                <th className="p-4">
                  <SortHeader
                    label="Name &amp; Set"
                    field="name"
                    currentField={sortField}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="p-4">Paid</th>
                <th className="p-4">
                  <SortHeader
                    label="Current Value"
                    field="price"
                    currentField={sortField}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="p-4">
                  <SortHeader
                    label="Profit / Loss"
                    field="profit"
                    currentField={sortField}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="p-4 text-right">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCollection.map((card) => {
                const live = parseFloat(card.live_price || '0') || 0;
                const cost = card.purchase_price || 0;
                const profit = live - cost;
                const { text: profitText, isPositive } = formatProfit(profit);

                return (
                  <tr
                    key={card.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-4 w-20">
                      <div className="w-12 h-16 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center p-0.5">
                        {card.image ? (
                          <img
                            src={card.image}
                            alt={card.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[9px] text-gray-400">No Image</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {card.name}
                      </p>
                      <span className="inline-block mt-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60">
                        {card.set_name || 'Set'}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                      {formatCurrency(card.purchase_price)}
                    </td>

                    <td className="p-4 font-black text-blue-600 dark:text-blue-400 text-base">
                      {formatCurrency(card.live_price)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center text-xs font-black px-2.5 py-1 rounded-lg ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {profitText}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteClick(card.id)}
                        className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Remove from collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
