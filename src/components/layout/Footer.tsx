'use client';

export function Footer() {
  return (
    <footer className="mt-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        {/* Brand */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">CFinder</span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded">v2.0</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
            Live Pokémon &amp; One Piece card arbitrage. Real-time market tracking, ending-soonest auction feeds, and Discord bot automated sniping.
          </p>
        </div>

        {/* Feature Suggestion */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Got an Idea?
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Have a feature request or suggestion? We&apos;d love to hear it.
          </p>
          <a
            href="mailto:banditsalandit123@gmail.com"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition mt-1"
          >
            <span>??</span> Share an Idea
          </a>
        </div>

        {/* Creator */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            The Builder
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Made by{' '}
            <a
              href="https://pabloti.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Pablo
            </a>
            . Building tools for daily trading and sniping.
          </p>
          <div className="flex gap-2.5 mt-1">
            <a
              href="https://www.linkedin.com/in/pablotiradohidalgo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition shadow-xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452H16.9v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.98 1.98 0 0 1-1.977-1.98 1.98 1.98 0 1 1 1.977 1.98zm1.709 13.019H3.626V9h3.42v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href="https://pabloti.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium px-3 py-1.5 rounded-lg transition"
            >
              ?? Portfolio
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 py-3 px-6 text-center text-gray-400 dark:text-gray-500 text-[11px]">
        © {new Date().getFullYear()} CFinder by Pablo. Trading card data powered by TCGdex &amp; eBay Browse API.
      </div>
    </footer>
  );
}
