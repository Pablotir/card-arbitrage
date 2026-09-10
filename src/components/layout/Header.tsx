'use client';

import { ThemeToggle } from '../ui/ThemeToggle';
import { Target, Search, Bookmark, Layers, LogOut } from 'lucide-react';

export type TabType = 'search' | 'list' | 'collection' | 'sniper';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  trackedCount: number;
  collectionCount: number;
  sniperCount?: number;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  themeMounted: boolean;
}

export function Header({
  activeTab,
  setActiveTab,
  trackedCount,
  collectionCount,
  sniperCount = 0,
  user,
  onLogin,
  onLogout,
  theme,
  onToggleTheme,
  themeMounted
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
            ?
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              CFinder
            </h1>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
              Arbitrage &amp; Sniper
            </span>
          </div>
        </div>

        {/* Right side controls: Theme + Auth */}
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} mounted={themeMounted} />

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 py-1 px-2 sm:px-3 rounded-xl">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 hidden md:inline max-w-[140px] truncate">
                {user.email}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:text-rose-700 dark:hover:text-rose-300 transition py-1 px-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 flex gap-1 sm:gap-2 overflow-x-auto border-t border-gray-100 dark:border-gray-800/80 pt-1 pb-0 no-scrollbar">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'search'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Search Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'list'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Tracked ({trackedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('collection')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'collection'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Collection ({collectionCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('sniper')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sniper'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Target className="w-4 h-4 text-purple-500" />
          <span>Sniper Bot {sniperCount > 0 ? `(${sniperCount})` : ''}</span>
          <span className="text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
            Bot
          </span>
        </button>
      </div>
    </header>
  );
}
