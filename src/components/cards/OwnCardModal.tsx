'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { CheckCircle2, Trash2, Award, Sparkles, Layers } from 'lucide-react';
import { CardItem, SearchCardResult, CardLanguage, CardGrade, CardCondition } from '@/lib/types';
import { formatCurrency } from '@/utils/format';

export interface OwnCardSaveDetails {
  purchasePrice: number;
  language: CardLanguage;
  grade: string;
}

interface OwnCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: SearchCardResult | CardItem | null;
  mode: 'add' | 'edit';
  existingItem?: CardItem | null;
  onSave: (card: SearchCardResult | CardItem, details: OwnCardSaveDetails) => void | Promise<void>;
  onRemove?: (cardId: number) => void | Promise<void>;
}

const GRADING_COMPANIES = ['PSA', 'CGC', 'BGS', 'ARS'] as const;
const GRADES = ['10', '9.5', '9', '8.5', '8', '7', '6', '5', '4', '3', '2', '1', 'Authentic'] as const;

const RAW_CONDITIONS: { value: CardCondition; label: string; desc: string }[] = [
  { value: 'Near Mint', label: 'Near Mint (NM)', desc: 'Minimal to no wear' },
  { value: 'Lightly Played', label: 'Lightly Played (LP)', desc: 'Minor edge or corner wear' },
  { value: 'Moderately Played', label: 'Moderately Played (MP)', desc: 'Noticeable wear or scratching' },
  { value: 'Heavily Played', label: 'Heavily Played (HP)', desc: 'Major wear, creases or whitening' },
  { value: 'Damaged', label: 'Damaged (DMG)', desc: 'Severe creasing, tearing or liquid' }
];

const LANGUAGES: { code: CardLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' }
];

export function OwnCardModal({
  isOpen,
  onClose,
  card,
  mode,
  existingItem,
  onSave,
  onRemove
}: OwnCardModalProps) {
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<CardLanguage>('en');
  const [isGraded, setIsGraded] = useState<boolean>(false);
  const [gradingCompany, setGradingCompany] = useState<(typeof GRADING_COMPANIES)[number]>('PSA');
  const [gradeNumber, setGradeNumber] = useState<string>('10');
  const [rawCondition, setRawCondition] = useState<CardCondition>('Near Mint');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !card) return;

    if (mode === 'edit' && existingItem) {
      // Pre-fill existing card details
      setPurchasePrice(
        existingItem.purchase_price != null && existingItem.purchase_price > 0
          ? String(existingItem.purchase_price)
          : ''
      );
      setSelectedLanguage(existingItem.language || 'en');

      const existingGrade = existingItem.grade || 'Near Mint';
      const isGradedMatch = GRADING_COMPANIES.find((comp) => existingGrade.startsWith(comp));
      if (isGradedMatch) {
        setIsGraded(true);
        setGradingCompany(isGradedMatch);
        const numPart = existingGrade.replace(isGradedMatch, '').trim();
        setGradeNumber(numPart || '10');
      } else {
        setIsGraded(false);
        const matchedCondition = RAW_CONDITIONS.find((c) => c.value === existingGrade)?.value || 'Near Mint';
        setRawCondition(matchedCondition);
      }
    } else {
      // Add mode: default price from live price or cheapest language
      const rawPriceVal = (card as any).price ?? (card as any).live_price;
      const initialPrice =
        typeof (card as any).cheapestPrice === 'number'
          ? (card as any).cheapestPrice
          : typeof rawPriceVal === 'number'
          ? rawPriceVal
          : parseFloat(String(rawPriceVal || '0')) || 0;

      setPurchasePrice(initialPrice > 0 ? initialPrice.toFixed(2) : '');
      const defaultLang = (card as any).cheapestLanguage || (card as any).language || 'en';
      setSelectedLanguage(defaultLang === 'onepiece' ? 'en' : defaultLang);
      setIsGraded(false);
      setGradingCompany('PSA');
      setGradeNumber('10');
      setRawCondition('Near Mint');
    }
  }, [isOpen, card, mode, existingItem]);

  if (!isOpen || !card) return null;

  const cardImage = card.image || (card as any).imageUrl || '';
  const cardName = card.name || 'Card';
  const cardSet = (card as any).setName || (card as any).set_name || 'Expansion';
  const livePriceDisplay = (card as any).price ?? (card as any).live_price ?? 'N/A';

  const handleSave = async () => {
    const parsedPrice = parseFloat(purchasePrice);
    const finalPrice = isNaN(parsedPrice) || parsedPrice < 0 ? 0 : parsedPrice;
    const finalGrade: CardGrade | string = isGraded
      ? `${gradingCompany} ${gradeNumber}`.trim()
      : rawCondition;

    try {
      setIsSubmitting(true);
      await onSave(card, {
        purchasePrice: finalPrice,
        language: selectedLanguage,
        grade: finalGrade
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!existingItem?.id || !onRemove) return;
    try {
      setIsSubmitting(true);
      await onRemove(existingItem.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Collection Details' : 'Add to My Collection'}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Card Header Preview */}
        <div className="flex items-center gap-3.5 p-3 bg-gray-50 dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="w-14 h-20 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center p-1">
            {cardImage ? (
              <img
                src={cardImage}
                alt={cardName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            ) : (
              <Layers className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
              {cardName}
            </h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">
              {cardSet}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Live Market:</span>
              <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                {formatCurrency(livePriceDisplay)}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Purchase Price */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Purchase Price Paid ($ USD)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-base font-bold text-gray-900 dark:text-gray-100 outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => setPurchasePrice('0')}
              className="text-[11px] font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition"
            >
              $0 (Gift / Pulled)
            </button>
            {typeof livePriceDisplay === 'number' || (!isNaN(parseFloat(String(livePriceDisplay))) && parseFloat(String(livePriceDisplay)) > 0) ? (
              <button
                type="button"
                onClick={() => {
                  const num = parseFloat(String(livePriceDisplay));
                  if (!isNaN(num)) setPurchasePrice(num.toFixed(2));
                }}
                className="text-[11px] font-semibold px-2 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg transition"
              >
                Use Live Market Comp ({formatCurrency(livePriceDisplay)})
              </button>
            ) : null}
          </div>
        </div>

        {/* 2. Language Acquired */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Language Acquired
          </label>
          <div className="grid grid-cols-4 gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Raw Condition vs Graded */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Condition &amp; Grading
          </label>
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-3 border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsGraded(false)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                !isGraded
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <span>Raw (Ungraded)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsGraded(true)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isGraded
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Graded Slab</span>
            </button>
          </div>

          {!isGraded ? (
            <div>
              <select
                value={rawCondition}
                onChange={(e) => setRawCondition(e.target.value as CardCondition)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {RAW_CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label} - {cond.desc}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Grading Company
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {GRADING_COMPANIES.map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => setGradingCompany(comp)}
                        className={`py-1.5 text-xs font-black rounded-lg transition border cursor-pointer ${
                          gradingCompany === comp
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Grade Value
                  </label>
                  <select
                    value={gradeNumber}
                    onChange={(e) => setGradeNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-black text-gray-900 dark:text-gray-100 outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g === '10' ? '10 (Gem Mint / Pristine)' : g === '9.5' ? '9.5 (Mint+)' : g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>Card will be logged as: <strong>{gradingCompany} {gradeNumber}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          {mode === 'edit' && onRemove && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleRemove}
              className="py-2.5 px-3.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{mode === 'edit' ? 'Save Changes' : 'Add to Collection'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
