export type TcgGame = 'pokemon' | 'pokemon-japan' | 'onepiece';
export type CardLanguage = 'en' | 'ja' | 'ko' | 'zh' | 'onepiece';
export type StorageMode = 'local' | 'cloud';

export type CardGrade = 
  | 'Near Mint'
  | 'Lightly Played'
  | 'Moderately Played'
  | 'Heavily Played'
  | 'Damaged'
  | 'Raw (Ungraded)'
  | 'PSA 10'
  | 'PSA 9'
  | 'PSA 8'
  | 'CGC 10'
  | 'BGS 10'
  | 'BGS 10 Black Label'
  | 'CGC 10 Pristine';

export type CardCondition = 
  | 'Near Mint'
  | 'Lightly Played'
  | 'Moderately Played'
  | 'Heavily Played'
  | 'Damaged'
  | 'Any';

export interface CardItem {
  id: number;
  user_id: string;
  card_id: string;
  name: string;
  set_name: string;
  image: string;
  grade: CardGrade | string;
  is_first_edition?: boolean;
  live_price: string | null;
  purchase_price?: number | null;
  best_link?: string;
  best_source?: 'TCGPlayer' | 'JustTCG' | 'eBay' | 'TCGdex' | string;
  ebay_price?: string | null;
  ebay_link?: string | null;
  status: 'tracked' | 'collection'; // 'tracked' acts as the Wishlist status
  game?: TcgGame;
  language?: CardLanguage;
  last_price_update?: string;
  last_ebay_check?: string;
  created_at?: string;
}

export interface MultiLangPrice {
  language: CardLanguage;
  label: string;
  price: number | null;
  currency: string;
  source: string;
  link?: string;
  image?: string;
  isCheapest?: boolean;
}

export interface SearchCardResult {
  id: string;
  tcgplayerId?: string;
  name: string;
  setName?: string;
  set_name?: string;
  image?: string;
  imageUrl?: string;
  price?: number | string | null;
  rarity?: string;
  number?: string;
  category?: string;
  trainerType?: string;
  game?: TcgGame;
  language?: CardLanguage;

  // Multi-Language Cost Comparison & Optimization
  languages?: Partial<Record<CardLanguage, MultiLangPrice>>;
  cheapestLanguage?: CardLanguage;
  cheapestPrice?: number | null;
  savingsVsEnglish?: number; // e.g. 62 (%)
  hasHighValueAltLanguages?: boolean; // true if price > 100 and KR/ZH comparisons were added
  isExclusive?: boolean; // true if language exclusive (e.g. Japanese promo or exclusive artwork)
  pricingSource?: string; // 'TCGPlayer' | 'Cardmarket' | 'JustTCG' | 'eBay'
}

export interface SearchFilterState {
  languages: CardLanguage[]; // Multi-select: 'en', 'ja', 'ko', 'zh', 'onepiece'
  categories: string[]; // Multi-select: 'Trainer - Supporter', 'Pokemon', etc.
  rarities: string[]; // Multi-select: 'Ultra Rare', 'Special Illustration Rare', etc.
  conditions: string[]; // Multi-select: 'Near Mint', 'Lightly Played', etc.
  printings: string[]; // Multi-select: 'Normal', 'Holofoil', '1st Edition', etc.
  setName: string;
  onlyUnowned: boolean; // "Missing from Collection" / "Cards I don't have"
}

export interface DealItem {
  id: string;
  title: string;
  price: string;
  currency: string;
  timeLeft: string;
  endDate: string;
  link: string;
  image: string;
}

export interface SetInfo {
  id: string;
  name: string;
  code?: string;
  releaseDate?: string;
  cardCount?: {
    total?: number;
    official?: number;
  };
  logo?: string;
  symbol?: string;
  isRecent?: boolean;
}

export interface SnipeRule {
  id: number | string;
  user_id: string | number;
  category: string; // 'POKEMON' | 'CARD'
  spec_filters: {
    card_name?: string;
    set_name?: string;
    condition?: string;
    product_type?: string;
    grade?: string;
    [key: string]: any;
  };
  target_price: number;
  max_condition: string;
  is_active: boolean;
  discord_webhook_url?: string;
  created_at?: string;
}

export interface SnipeMatch {
  id?: string | number;
  rule_id?: string | number;
  title: string;
  price: number | string;
  condition?: string;
  link: string;
  image?: string;
  retailer?: string;
  found_at?: string;
}

export type SortField = 'name' | 'set' | 'grade' | 'price' | 'profit' | 'created';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'table' | 'grid';
