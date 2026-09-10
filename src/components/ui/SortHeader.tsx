'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortField, SortOrder } from '@/lib/types';

interface SortHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
  className?: string;
}

export function SortHeader({
  label,
  field,
  currentField,
  currentOrder,
  onSort,
  className = ''
}: SortHeaderProps) {
  const isActive = currentField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider transition select-none ${
        isActive 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      } ${className}`}
    >
      <span>{label}</span>
      {isActive ? (
        currentOrder === 'asc' ? (
          <ArrowUp className="w-3.5 h-3.5" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5" />
        )
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition" />
      )}
    </button>
  );
}
