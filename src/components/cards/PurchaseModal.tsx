'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { ShoppingBag } from 'lucide-react';
import { CardItem } from '@/lib/types';

interface PurchaseModalProps {
  isOpen: boolean;
  card: CardItem | null;
  onClose: () => void;
  onConfirm: (card: CardItem, price: number) => void;
}

export function PurchaseModal({ isOpen, card, onClose, onConfirm }: PurchaseModalProps) {
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (card) {
      const live = parseFloat(card.live_price || '0');
      if (live > 0) {
        setPrice(live.toFixed(2));
      } else {
        setPrice('');
      }
    }
  }, [card]);

  const handleConfirm = () => {
    if (!card) return;
    const num = parseFloat(price);
    if (isNaN(num) || num < 0) return;
    onConfirm(card, num);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Collection">
      <div className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          How much did you pay for{' '}
          <strong className="text-blue-600 dark:text-blue-400">{card?.name}</strong>?
        </p>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
          <input
            type="number"
            step="0.01"
            autoFocus
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-900 dark:text-gray-100 outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Confirm Move</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
