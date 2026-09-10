'use client';

import { formatCurrency, formatProfit } from '@/utils/format';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface PortfolioStatsProps {
  totalCost: number;
  totalValue: number;
  itemCount: number;
}

export function PortfolioStats({ totalCost, totalValue, itemCount }: PortfolioStatsProps) {
  const profit = totalValue - totalCost;
  const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const { isPositive } = formatProfit(profit);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Cost */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-4 transition-colors">
        <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Total Investment
          </span>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight mt-0.5">
            {formatCurrency(totalCost)}
          </p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {itemCount} {itemCount === 1 ? 'card' : 'cards'} owned
          </span>
        </div>
      </div>

      {/* Current Value */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-4 transition-colors">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Current Market Value
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-tight mt-0.5">
            {formatCurrency(totalValue)}
          </p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            Live prices updated
          </span>
        </div>
      </div>

      {/* Profit / Loss */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-4 transition-colors">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )}
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Total Return (P/L)
          </span>
          <p
            className={`text-2xl font-black leading-tight mt-0.5 ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(profit)}
          </p>
          <span
            className={`text-[11px] font-bold ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {profitPercent.toFixed(1)}% ROI
          </span>
        </div>
      </div>
    </div>
  );
}
