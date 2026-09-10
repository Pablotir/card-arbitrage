'use client';

import { useState, useMemo } from 'react';
import { CardItem, SortField, SortOrder, ViewMode, TcgGame } from '@/lib/types';
import { CardRow } from './CardRow';
import { CardGrid } from './CardGrid';
import { SortHeader } from '../ui/SortHeader';
import { TcgToggle } from '../ui/TcgToggle';
import { GRADE_OPTIONS } from '@/utils/constants';
import { formatCurrency } from '@/utils/format';
import {
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
  Inbox
} from 'lucide-react';

interface CardTableProps {
  cards: CardItem[];
  tcg: TcgGame;
  setTcg: (game: TcgGame) => void;
  onGradeChange: (id: number, grade: string) => void;
  onBuyClick: (card: CardItem) => void;
  onSnipeClick: (card: CardItem) => void;
  onDeleteClick: (id: number) => void;
  onBatchRefresh: () => void;
  onEbayOnlyRefresh: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
  isLoading: boolean;
}

export function CardTable({
  cards,
  tcg,
  setTcg,
  onGradeChange,
  onBuyClick,
  onSnipeClick,
  onDeleteClick,
  onBatchRefresh,
  onEbayOnlyRefresh,
  onImportClick,
  onExportClick,
  isLoading
}: CardTableProps) {
  const [filterText, setFilterText] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'price' ? 'desc' : 'asc');
    }
  };

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    return cards
      .filter((card) => {
        // Game match
        const gameMatch = (card.game || 'pokemon') === tcg;
        if (!gameMatch) return false;

        // Grade filter
        if (gradeFilter !== 'All' && card.grade !== gradeFilter) {
          return false;
        }

        // Text search
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
        } else if (sortField === 'grade') {
          cmp = (a.grade || '').localeCompare(b.grade || '');
        } else if (sortField === 'price') {
          const pA = parseFloat(a.live_price || '0') || 0;
          const pB = parseFloat(b.live_price || '0') || 0;
          cmp = pA - pB;
        } else {
          // Default by id or created
          cmp = (a.id || 0) - (b.id || 0);
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [cards, tcg, gradeFilter, filterText, sortField, sortOrder]);

  const totalValue = useMemo(() => {
    return filteredAndSortedCards.reduce(
      (acc, c) => acc + (parseFloat(c.live_price || '0') || 0),
      0
    );
  }, [filteredAndSortedCards]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 overflow-hidden transition-colors">
      {/* Top Header & Controls */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Tracked Cards ({filteredAndSortedCards.length})
          </h2>
          <TcgToggle value={tcg} onChange={setTcg} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onImportClick}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={onExportClick}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

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
            <span>{isLoading ? 'Updating...' : 'Update Prices'}</span>
          </button>
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-800">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          {/* Text filter */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter list by name or set..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 outline-hidden focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          >
            <option value="All">All Grades</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content: Table or Grid */}
      {filteredAndSortedCards.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <Inbox className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            No cards found
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto mt-1">
            {cards.length === 0
              ? 'You have not added any cards yet. Use Search Cards above to track your favorite cards.'
              : 'No tracked cards match your search or grade filter.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <CardGrid
          cards={filteredAndSortedCards}
          onGradeChange={onGradeChange}
          onBuyClick={onBuyClick}
          onSnipeClick={onSnipeClick}
          onDeleteClick={onDeleteClick}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 text-xs">
              <tr>
                <th className="p-4 w-20">Card</th>
                <th className="p-4">
                  <SortHeader
                    label="Details"
                    field="name"
                    currentField={sortField}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="p-4">
                  <SortHeader
                    label="Grade"
                    field="grade"
                    currentField={sortField}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="p-4">
                  <SortHeader
                    label="Market / Best"
                    field="price"
                    currentField={sortField}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="p-4">Actions</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredAndSortedCards.map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  onGradeChange={onGradeChange}
                  onBuyClick={onBuyClick}
                  onSnipeClick={onSnipeClick}
                  onDeleteClick={onDeleteClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Total */}
      {filteredAndSortedCards.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 p-4 flex justify-between sm:justify-end items-center gap-4">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Tracked Market Value:
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalValue)}
          </span>
        </div>
      )}
    </div>
  );
}
