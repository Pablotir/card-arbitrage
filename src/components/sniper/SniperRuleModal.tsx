'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Target, Bell } from 'lucide-react';
import { CONDITION_OPTIONS } from '@/utils/constants';

interface SniperRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: any | null;
  userId: string;
  onRuleCreated: (newRule: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function SniperRuleModal({
  isOpen,
  onClose,
  card,
  userId,
  onRuleCreated,
  onShowToast
}: SniperRuleModalProps) {
  const [cardName, setCardName] = useState('');
  const [setName, setSetName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('Near Mint');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (card) {
      setCardName(card.name || '');
      setSetName(card.setName || card.set_name || '');
      // Calculate suggested snipe price: 15% below live price if available
      const live = parseFloat(card.live_price || card.price || '0');
      if (live > 0) {
        setTargetPrice((live * 0.85).toFixed(2));
      } else {
        setTargetPrice('');
      }
    }
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !targetPrice) {
      onShowToast('Please provide a card name and target max price', 'error');
      return;
    }

    const priceNum = parseFloat(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      onShowToast('Please enter a valid target price', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sniper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          card_name: cardName.trim(),
          set_name: setName.trim(),
          target_price: priceNum,
          condition: condition,
          discord_webhook_url: discordWebhook.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create snipe rule');

      onShowToast(`?? Snipe rule set for ${cardName} under $${priceNum.toFixed(2)}!`, 'success');
      if (data.data && data.data[0]) {
        onRuleCreated(data.data[0]);
      }
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Error setting snipe rule', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Discord Bot Snipe">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Syncs with your HardwareSniper Discord bot and monitors eBay for Near Mint cards listed below your threshold.
        </p>

        {/* Card Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Card Name
          </label>
          <input
            type="text"
            required
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="e.g. Mega Rayquaza ex"
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Set Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Set Name (Optional)
          </label>
          <input
            type="text"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            placeholder="e.g. Delta Reign, 30th Celebration"
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Max Price & Condition */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Max Target Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-gray-100 outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Target Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Discord Webhook (Optional) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Discord Channel Webhook (Optional)
          </label>
          <div className="relative">
            <Bell className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <span className="text-[10px] text-gray-400 block mt-1">
            Optional: For instant alerts directly to a specific Discord channel.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Target className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : 'Arm Sniper'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
