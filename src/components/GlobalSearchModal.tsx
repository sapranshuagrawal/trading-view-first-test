import React, { useState, useEffect, useMemo } from 'react';
import {
  EXTRA_GLOBAL_INDICES,
  US_STOCKS_TRENDING,
  US_STOCKS_MOST_ACTIVE,
  US_STOCKS_TOP_GAINERS,
  CRYPTO_HIGHLIGHTS,
  FOREX_MAJORS,
  CATEGORY_DATASETS,
} from '../data/marketsData';
import { SelectedSymbolInfo } from './SymbolDetailModal';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbolInfo: SelectedSymbolInfo) => void;
}

type SearchFilter = 'All' | 'Stocks' | 'Indices' | 'Crypto' | 'Forex' | 'Futures' | 'ETFs';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('All');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const allItems = useMemo(() => {
    const items: (SelectedSymbolInfo & { categoryType: SearchFilter })[] = [];
    const seen = new Set<string>();

    const add = (item: SelectedSymbolInfo, categoryType: SearchFilter) => {
      if (!seen.has(item.symbol)) {
        seen.add(item.symbol);
        items.push({ ...item, categoryType });
      }
    };

    EXTRA_GLOBAL_INDICES.forEach((idx) => {
      add(
        {
          symbol: idx.symbol,
          name: idx.name,
          subtitle: idx.subtitle,
          badgeText: idx.badgeText,
          badgeBg: idx.badgeBg,
          badgeTextColor: idx.badgeTextColor,
          price: idx.price,
          rawPrice: idx.rawPrice,
          change: idx.change,
          changePercent: idx.changePercent,
          isPositive: idx.isPositive,
          description: idx.description,
          exchange: idx.subtitle.split('·')[1]?.trim() || 'INDEX',
        },
        'Indices'
      );
    });

    [
      ...US_STOCKS_TRENDING,
      ...US_STOCKS_MOST_ACTIVE,
      ...US_STOCKS_TOP_GAINERS,
      ...CATEGORY_DATASETS['World stocks'].leaders.Trending,
    ].forEach((stk) => {
      add(
        {
          symbol: stk.ticker,
          name: stk.name,
          badgeText: stk.badgeText,
          badgeBg: stk.badgeBg,
          badgeTextColor: stk.badgeTextColor,
          price: stk.price,
          rawPrice: stk.rawPrice,
          changePercent: stk.changePercent,
          isPositive: stk.isPositive,
          volume: stk.volume,
          marketCap: stk.marketCap,
          sector: stk.sector,
          exchange: stk.exchange || 'NASDAQ',
          peRatio: stk.peRatio,
          eps: stk.eps,
          dayRange: stk.dayRange,
          technicalRating: stk.technicalRating,
          description: stk.description,
        },
        'Stocks'
      );
    });

    CRYPTO_HIGHLIGHTS.forEach((cr) => {
      add(
        {
          symbol: cr.ticker,
          name: cr.name,
          badgeText: cr.badgeText,
          badgeBg: cr.badgeBg,
          badgeTextColor: cr.badgeTextColor,
          price: cr.price,
          rawPrice: cr.rawPrice,
          changePercent: cr.changePercent,
          isPositive: cr.isPositive,
          volume: cr.volume,
          marketCap: cr.marketCap,
          exchange: 'CRYPTO',
        },
        'Crypto'
      );
    });

    FOREX_MAJORS.forEach((fx) => {
      add(
        {
          symbol: fx.pair.replace(/\s+/g, ''),
          name: fx.pair,
          badgeText: fx.pair.slice(0, 2),
          badgeBg: '#2962ff',
          badgeTextColor: '#ffffff',
          price: fx.price,
          rawPrice: fx.rawPrice,
          changePercent: fx.changePercent,
          isPositive: fx.isPositive,
          dayRange: fx.dayRange,
          exchange: 'FX SPOT',
        },
        'Forex'
      );
    });

    CATEGORY_DATASETS.Futures.leaders.Trending.forEach((fut) => {
      add(
        {
          symbol: fut.ticker,
          name: fut.name,
          badgeText: fut.badgeText,
          badgeBg: fut.badgeBg,
          badgeTextColor: fut.badgeTextColor,
          price: fut.price,
          rawPrice: fut.rawPrice,
          changePercent: fut.changePercent,
          isPositive: fut.isPositive,
          volume: fut.volume,
          marketCap: fut.marketCap,
          exchange: fut.marketCap,
        },
        'Futures'
      );
    });

    CATEGORY_DATASETS.ETFs.leaders.Trending.forEach((etf) => {
      add(
        {
          symbol: etf.ticker,
          name: etf.name,
          badgeText: etf.badgeText,
          badgeBg: etf.badgeBg,
          badgeTextColor: etf.badgeTextColor,
          price: etf.price,
          rawPrice: etf.rawPrice,
          changePercent: etf.changePercent,
          isPositive: etf.isPositive,
          volume: etf.volume,
          marketCap: etf.marketCap,
          exchange: 'NYSE ARCA / NASDAQ',
        },
        'ETFs'
      );
    });

    return items;
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory = activeFilter === 'All' || item.categoryType === activeFilter;
      const q = query.trim().toLowerCase();
      if (!q) return matchesCategory;
      return (
        matchesCategory &&
        (item.symbol.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          (item.exchange && item.exchange.toLowerCase().includes(q)))
      );
    });
  }, [allItems, activeFilter, query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-tv-grayBorder rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="p-4 border-b border-tv-grayBorder flex items-center gap-3">
          <svg className="w-5 h-5 text-tv-grayText shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company, index, crypto, or FX pair (e.g. NVDA, SPX, BTCUSD)..."
            className="w-full text-sm text-tv-black placeholder:text-tv-grayText focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-tv-grayText hover:text-tv-black px-2 py-1 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-tv-grayText hover:text-tv-black px-2 py-1 rounded bg-tv-grayLight cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-4 py-2.5 border-b border-tv-grayBorder flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white">
          {(['All', 'Stocks', 'Indices', 'Crypto', 'Forex', 'Futures', 'ETFs'] as SearchFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === tab
                  ? 'bg-[#131722] text-white'
                  : 'text-tv-black hover:bg-tv-grayLight'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-tv-grayBorder/60">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-tv-grayText">
              No matching symbols found for "{query}". Try searching for NVDA, SPX, BTCUSD, or EUR/USD.
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.symbol}
                onClick={() => {
                  onSelectSymbol(item);
                  onClose();
                }}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-tv-grayLight/70 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: item.badgeBg,
                      color: item.badgeTextColor || '#ffffff',
                    }}
                  >
                    {item.badgeText}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-tv-black group-hover:text-tv-blueActive">
                        {item.symbol}
                      </span>
                      <span className="text-xs text-tv-grayText">{item.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right tabular-numbers">
                    <div className="text-sm font-bold text-tv-black">{item.price}</div>
                    <div
                      className={`text-xs font-semibold ${
                        item.isPositive ? 'text-tv-green' : 'text-tv-red'
                      }`}
                    >
                      {item.changePercent}
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-tv-grayText uppercase w-20 text-right hidden sm:inline-block">
                    {item.exchange || item.categoryType}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
