/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MARKET_CATEGORIES,
  MarketCategory,
  LeaderSubTab,
  CATEGORY_DATASETS,
  EXTRA_GLOBAL_INDICES,
  CRYPTO_HIGHLIGHTS,
  FOREX_MAJORS,
  US_STOCKS_TRENDING,
  IndexCardItem,
  LeaderItem,
  CryptoHighlightItem,
  ForexMajorItem,
} from './data/marketsData';
import { SymbolDetailModal, SelectedSymbolInfo } from './components/SymbolDetailModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import {
  SuperchartsScreen,
  CommunityScreen,
  BrokersScreen,
} from './components/SecondaryScreens';

type TopNavTab = 'Products' | 'Community' | 'Markets' | 'Brokers';
type SortField = 'default' | 'price' | 'change' | 'volume' | 'marketCap';

export default function App() {
  const [activeNav, setActiveNav] = useState<TopNavTab>('Markets');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('US stocks');
  const [activeLeaderTab, setActiveLeaderTab] = useState<LeaderSubTab>('Trending');
  const [showAllIndices, setShowAllIndices] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('default');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Modals & Popovers
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [selectedSymbol, setSelectedSymbol] = useState<SelectedSymbolInfo | null>(null);
  const [superchartSymbol, setSuperchartSymbol] = useState<SelectedSymbolInfo>({
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    badgeText: 'N',
    badgeBg: '#76b900',
    badgeTextColor: '#ffffff',
    price: '$142.15',
    rawPrice: 142.15,
    changePercent: '+3.22%',
    isPositive: true,
    volume: '54.21M',
    marketCap: '$3.52T',
    exchange: 'NASDAQ',
    peRatio: '54.82',
    eps: '$2.59',
    technicalRating: 'Strong Buy',
  });

  const [watchlist, setWatchlist] = useState<string[]>(['NVDA', 'AAPL', 'BTCUSD', 'SPX']);
  const [watchlistOpen, setWatchlistOpen] = useState<boolean>(false);
  const [getStartedOpen, setGetStartedOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
  const [heroDropdownOpen, setHeroDropdownOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<'EN' | 'DE' | 'FR' | 'JP'>('EN');
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);
  const [footerModal, setFooterModal] = useState<string | null>(null);

  // Global keyboard shortcut Ctrl+K / Cmd+K for Search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const currentDataset = CATEGORY_DATASETS[selectedCategory];

  const displayedIndices: IndexCardItem[] = useMemo(() => {
    if (selectedCategory === 'US stocks' && showAllIndices) {
      return EXTRA_GLOBAL_INDICES;
    }
    return currentDataset.indices;
  }, [selectedCategory, showAllIndices, currentDataset]);

  const displayedLeaders: LeaderItem[] = useMemo(() => {
    const tabRows =
      currentDataset.leaders[activeLeaderTab]?.length > 0
        ? currentDataset.leaders[activeLeaderTab]
        : currentDataset.leaders.Trending;

    if (sortField === 'default') return tabRows;

    const copy = [...tabRows];
    copy.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === 'price') {
        valA = a.rawPrice;
        valB = b.rawPrice;
      } else if (sortField === 'change') {
        valA = a.rawChangePercent;
        valB = b.rawChangePercent;
      } else if (sortField === 'volume') {
        valA = a.rawVolume;
        valB = b.rawVolume;
      } else if (sortField === 'marketCap') {
        valA = a.rawMarketCap;
        valB = b.rawMarketCap;
      }
      return sortAsc ? valA - valB : valB - valA;
    });
    return copy;
  }, [currentDataset, activeLeaderTab, sortField, sortAsc]);

  const handleSortColumn = (field: SortField) => {
    if (sortField === field) {
      if (sortAsc) {
        setSortField('default');
        setSortAsc(false);
      } else {
        setSortAsc(true);
      }
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const openIndexDetail = (idx: IndexCardItem) => {
    setSelectedSymbol({
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
      dayRange: idx.dayLow && idx.dayHigh ? `${idx.dayLow} – ${idx.dayHigh}` : undefined,
      yearRange: idx.yearLow && idx.yearHigh ? `${idx.yearLow} – ${idx.yearHigh}` : undefined,
      exchange: idx.subtitle.split('·')[1]?.trim() || 'INDEX',
    });
  };

  const openLeaderDetail = (item: LeaderItem) => {
    setSelectedSymbol({
      symbol: item.ticker,
      name: item.name,
      badgeText: item.badgeText,
      badgeBg: item.badgeBg,
      badgeTextColor: item.badgeTextColor,
      price: item.price,
      rawPrice: item.rawPrice,
      changePercent: item.changePercent,
      isPositive: item.isPositive,
      volume: item.volume,
      marketCap: item.marketCap,
      sector: item.sector,
      exchange: item.exchange || 'NASDAQ',
      peRatio: item.peRatio,
      eps: item.eps,
      divYield: item.divYield,
      dayRange: item.dayRange,
      yearRange: item.yearRange,
      technicalRating: item.technicalRating,
      description: item.description,
    });
  };

  const openCryptoDetail = (cr: CryptoHighlightItem) => {
    setSelectedSymbol({
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
      exchange: 'CRYPTO SPOT',
      technicalRating: cr.isPositive ? 'Strong Buy' : 'Neutral',
      description: `${cr.name} (${cr.ticker}) 24/7 global spot market price aggregated across top institutional digital asset exchanges.`,
    });
  };

  const openForexDetail = (fx: ForexMajorItem) => {
    setSelectedSymbol({
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
      exchange: 'FX INTERBANK',
      description: `${fx.name} (${fx.pair}) spot foreign exchange rate from global interbank liquidity providers.`,
    });
  };

  const handleSelectSymbolByTicker = (ticker: string) => {
    const foundStock = US_STOCKS_TRENDING.find((s) => s.ticker === ticker);
    if (foundStock) {
      openLeaderDetail(foundStock);
      return;
    }
    const foundCrypto = CRYPTO_HIGHLIGHTS.find((c) => c.ticker === ticker);
    if (foundCrypto) {
      openCryptoDetail(foundCrypto);
      return;
    }
    const foundIdx = EXTRA_GLOBAL_INDICES.find((i) => i.symbol === ticker);
    if (foundIdx) {
      openIndexDetail(foundIdx);
      return;
    }
    const foundFx = FOREX_MAJORS.find((f) => f.pair.replace(/\s+/g, '') === ticker);
    if (foundFx) {
      openForexDetail(foundFx);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* BEGIN: MainHeader */}
      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#e0e3eb]"
        data-purpose="site-navigation"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo & Search & Nav Links */}
          <div className="flex items-center gap-6">
            {/* TradingView Stylized Logo */}
            <a
              aria-label="TradingView Home"
              className="flex items-center gap-1.5 text-tv-black hover:opacity-80 transition-opacity cursor-pointer"
              href="#markets"
              onClick={(e) => {
                e.preventDefault();
                setActiveNav('Markets');
                setSelectedCategory('US stocks');
                setActiveLeaderTab('Trending');
                setSortField('default');
              }}
            >
              <svg
                className="w-8 h-8 fill-current"
                fill="none"
                viewBox="0 0 36 28"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7.4 0H0v28h7.4V0zM14.3 9.3H21v18.7h-6.7V9.3zM28.6 17.5h7.4v10.5h-7.4V17.5z" />
                <path d="M14.3 0H21v6.2h-6.7V0z" />
              </svg>
            </a>

            {/* Search Input Bar */}
            <div
              className="relative w-64 md:w-72 hidden sm:block"
              data-purpose="global-search"
              onClick={() => setSearchOpen(true)}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-tv-grayText">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <input
                className="w-full pl-9 pr-4 py-2 bg-tv-grayLight hover:bg-tv-grayHover/80 text-sm text-tv-black rounded-full border-0 focus:ring-2 focus:ring-tv-blueActive focus:outline-none cursor-pointer transition-colors"
                placeholder="Search (Ctrl+K)"
                readOnly
                type="text"
              />
            </div>

            {/* Primary Navigation Links */}
            <nav
              aria-label="Main Navigation"
              className="hidden lg:flex items-center gap-6 text-[15px] font-medium"
            >
              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('Products');
                }}
                className={`transition-colors whitespace-nowrap ${
                  activeNav === 'Products'
                    ? 'text-tv-blueActive font-semibold'
                    : 'text-tv-black hover:text-tv-blueActive'
                }`}
              >
                Products
              </a>
              <a
                href="#community"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('Community');
                }}
                className={`transition-colors whitespace-nowrap ${
                  activeNav === 'Community'
                    ? 'text-tv-blueActive font-semibold'
                    : 'text-tv-black hover:text-tv-blueActive'
                }`}
              >
                Community
              </a>
              <a
                aria-current={activeNav === 'Markets' ? 'page' : undefined}
                href="#markets"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('Markets');
                }}
                className={`transition-colors whitespace-nowrap ${
                  activeNav === 'Markets'
                    ? 'text-tv-blueActive font-semibold'
                    : 'text-tv-black hover:text-tv-blueActive'
                }`}
              >
                Markets
              </a>
              <a
                href="#brokers"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('Brokers');
                }}
                className={`transition-colors whitespace-nowrap ${
                  activeNav === 'Brokers'
                    ? 'text-tv-blueActive font-semibold'
                    : 'text-tv-black hover:text-tv-blueActive'
                }`}
              >
                Brokers
              </a>
              <div className="relative">
                <a
                  href="#more"
                  onClick={(e) => {
                    e.preventDefault();
                    setMoreMenuOpen((prev) => !prev);
                  }}
                  className="text-tv-black hover:text-tv-blueActive transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  More
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 text-tv-grayText"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                </a>
                {moreMenuOpen && (
                  <div
                    className="absolute left-0 mt-2 w-52 bg-white border border-tv-grayBorder rounded-xl shadow-lg py-2 z-50 text-sm"
                    onMouseLeave={() => setMoreMenuOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setActiveNav('Products');
                        setMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-tv-black hover:bg-tv-grayLight transition-colors cursor-pointer"
                    >
                      Supercharts Terminal
                    </button>
                    <button
                      onClick={() => {
                        setActiveNav('Markets');
                        setSelectedCategory('Economy');
                        setMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-tv-black hover:bg-tv-grayLight transition-colors cursor-pointer"
                    >
                      Macroeconomic Data
                    </button>
                    <button
                      onClick={() => {
                        setActiveNav('Markets');
                        setSelectedCategory('Government bonds');
                        setMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-tv-black hover:bg-tv-grayLight transition-colors cursor-pointer"
                    >
                      Sovereign Yield Curves
                    </button>
                    <button
                      onClick={() => {
                        setSearchOpen(true);
                        setMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-tv-black hover:bg-tv-grayLight transition-colors cursor-pointer"
                    >
                      Global Symbol Search (Ctrl+K)
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: Controls & Action */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                aria-label="Select Language"
                onClick={() => setLangMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm font-semibold text-tv-black hover:bg-tv-grayLight px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5 text-tv-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a14.2 14.2 0 014 9 14.2 14.2 0 01-4 9 14.2 14.2 0 01-4-9 14.2 14.2 0 014-9z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
                <span>{language}</span>
              </button>
              {langMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-36 bg-white border border-tv-grayBorder rounded-xl shadow-lg py-1.5 z-50 text-xs font-semibold"
                  onMouseLeave={() => setLangMenuOpen(false)}
                >
                  {(['EN', 'DE', 'FR', 'JP'] as const).map((lng) => (
                    <button
                      key={lng}
                      onClick={() => {
                        setLanguage(lng);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-tv-grayLight cursor-pointer ${
                        language === lng ? 'text-tv-blueActive' : 'text-tv-black'
                      }`}
                    >
                      <span>
                        {lng === 'EN'
                          ? 'English (US)'
                          : lng === 'DE'
                          ? 'Deutsch'
                          : lng === 'FR'
                          ? 'Français'
                          : '日本語'}
                      </span>
                      {language === lng && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Avatar Icon (Watchlist Drawer Trigger) */}
            <button
              aria-label="User Account"
              onClick={() => setWatchlistOpen(true)}
              className="p-1.5 rounded-full hover:bg-tv-grayLight text-tv-black transition-colors relative cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>

            {/* Get Started Button */}
            <a
              href="#get-started"
              onClick={(e) => {
                e.preventDefault();
                setGetStartedOpen(true);
              }}
              className="px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-[#2962ff] to-[#9c27b0] hover:opacity-95 shadow-sm transition-opacity whitespace-nowrap cursor-pointer"
            >
              Get started
            </a>
          </div>
        </div>
      </header>
      {/* END: MainHeader */}

      {/* Conditional View Routing: Default is Markets ("Markets, everywhere") */}
      {activeNav === 'Products' ? (
        <SuperchartsScreen
          initialSymbol={superchartSymbol}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
          onBackToMarkets={() => setActiveNav('Markets')}
        />
      ) : activeNav === 'Community' ? (
        <CommunityScreen onSelectSymbol={handleSelectSymbolByTicker} />
      ) : activeNav === 'Brokers' ? (
        <BrokersScreen />
      ) : (
        <>
          {/* BEGIN: HeroHeadlineSection */}
          <section className="pt-10 pb-6 text-center relative" data-purpose="markets-hero">
            <div className="max-w-[1380px] mx-auto px-4">
              <h1
                onClick={() => setHeroDropdownOpen((prev) => !prev)}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-tv-black inline-flex items-center gap-3 justify-center group cursor-pointer select-none"
              >
                Markets, everywhere
                <svg
                  className={`w-7 h-7 md:w-9 md:h-9 text-tv-black stroke-[3] transition-transform ${
                    heroDropdownOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </h1>

              {heroDropdownOpen && (
                <div className="mt-3 mx-auto max-w-md bg-white border border-tv-grayBorder rounded-2xl shadow-xl p-3 z-30 flex flex-wrap items-center justify-center gap-1.5">
                  {MARKET_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveLeaderTab('Trending');
                        setHeroDropdownOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#131722] text-white'
                          : 'text-tv-black hover:bg-tv-grayLight'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
          {/* END: HeroHeadlineSection */}

          {/* BEGIN: MarketCategoryNavigation */}
          <section className="py-4" data-purpose="category-pills-bar">
            <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border border-tv-grayBorder/80 rounded-full p-1.5 bg-white shadow-sm w-fit max-w-full mx-auto text-sm font-medium">
                {MARKET_CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setActiveLeaderTab('Trending');
                        setSortField('default');
                      }}
                      className={
                        isActive
                          ? 'bg-[#131722] text-white px-4 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer'
                          : 'text-tv-black hover:bg-tv-grayLight px-4 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer'
                      }
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
          {/* END: MarketCategoryNavigation */}

          {/* BEGIN: MainContent */}
          <main className="max-w-[1380px] mx-auto px-4 sm:px-6 py-6 space-y-12 w-full">
            {/* Indices Section */}
            <section data-purpose="indices-overview">
              <div className="flex items-center justify-between mb-4">
                <a
                  href="#indices"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAllIndices((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 text-2xl md:text-3xl font-extrabold text-tv-black hover:text-tv-blueActive transition-colors group cursor-pointer"
                >
                  {currentDataset.sectionTitle}
                  <svg
                    className="w-6 h-6 stroke-[3] group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="#all-indices"
                  onClick={(e) => {
                    e.preventDefault();
                    if (selectedCategory !== 'US stocks') {
                      setSelectedCategory('US stocks');
                      setShowAllIndices(true);
                    } else {
                      setShowAllIndices((prev) => !prev);
                    }
                  }}
                  className="text-sm font-semibold text-tv-blueActive hover:underline cursor-pointer"
                >
                  {showAllIndices && selectedCategory === 'US stocks'
                    ? 'Show top 5 indices'
                    : 'See all indices'}
                </a>
              </div>

              {/* Indices Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                {displayedIndices.map((idx) => (
                  <div
                    key={idx.id}
                    onClick={() => openIndexDetail(idx)}
                    className="p-4 rounded-xl border border-tv-grayBorder hover:shadow-md hover:border-gray-300 transition-all cursor-pointer bg-white flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-full font-bold ${
                            idx.badgeFontSize || 'text-xs'
                          } flex items-center justify-center shrink-0`}
                          style={{
                            backgroundColor: idx.badgeBg,
                            color: idx.badgeTextColor || '#ffffff',
                          }}
                        >
                          {idx.badgeText}
                        </span>
                        <div>
                          <h3 className="font-bold text-tv-black leading-tight text-sm">
                            {idx.name}
                          </h3>
                          <span className="text-xs text-tv-grayText uppercase">
                            {idx.subtitle}
                          </span>
                        </div>
                      </div>
                      {/* Mini SVG Trend Sparkline */}
                      <svg
                        className={`w-16 h-8 ${
                          idx.isPositive ? 'text-tv-green' : 'text-tv-red'
                        }`}
                        fill="none"
                        viewBox="0 0 100 40"
                      >
                        <path
                          d={idx.sparklinePath}
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                        />
                      </svg>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-base font-bold tabular-numbers text-tv-black">
                        {idx.price}
                      </span>
                      <div
                        className={`flex items-center gap-1 text-xs font-semibold tabular-numbers ${
                          idx.isPositive
                            ? 'text-tv-green bg-emerald-50'
                            : 'text-tv-red bg-rose-50'
                        } px-2 py-0.5 rounded`}
                      >
                        <span>{idx.change}</span>
                        <span>{idx.changePercent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Popular US Stocks & Movers Section */}
            <section
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              data-purpose="popular-stocks-and-tables"
            >
              {/* Left 2 Cols: Main Stock Movers Table */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-tv-grayBorder pb-2">
                  <h2 className="text-xl font-bold text-tv-black">
                    {currentDataset.tableTitle}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {(['Trending', 'Most active', 'Top gainers'] as LeaderSubTab[]).map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveLeaderTab(tab);
                            setSortField('default');
                          }}
                          className={
                            activeLeaderTab === tab
                              ? 'px-3 py-1 bg-tv-grayLight text-tv-black rounded-md cursor-pointer'
                              : 'px-3 py-1 hover:bg-tv-grayLight text-tv-grayText rounded-md cursor-pointer'
                          }
                        >
                          {tab}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm" id="stocks-leaders-table">
                    <thead>
                      <tr className="text-xs text-tv-grayText uppercase border-b border-tv-grayBorder font-medium select-none">
                        <th
                          onClick={() => handleSortColumn('default')}
                          className="py-2.5 pr-4 cursor-pointer hover:text-tv-black transition-colors"
                        >
                          Ticker
                        </th>
                        <th
                          onClick={() => handleSortColumn('price')}
                          className="py-2.5 px-4 text-right cursor-pointer hover:text-tv-black transition-colors"
                        >
                          Price {sortField === 'price' ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                        <th
                          onClick={() => handleSortColumn('change')}
                          className="py-2.5 px-4 text-right cursor-pointer hover:text-tv-black transition-colors"
                        >
                          Change % {sortField === 'change' ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                        <th
                          onClick={() => handleSortColumn('volume')}
                          className="py-2.5 px-4 text-right hidden sm:table-cell cursor-pointer hover:text-tv-black transition-colors"
                        >
                          Volume {sortField === 'volume' ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                        <th
                          onClick={() => handleSortColumn('marketCap')}
                          className="py-2.5 pl-4 text-right cursor-pointer hover:text-tv-black transition-colors"
                        >
                          Market Cap {sortField === 'marketCap' ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tv-grayBorder/60">
                      {displayedLeaders.map((row) => (
                        <tr
                          key={row.ticker}
                          onClick={() => openLeaderDetail(row)}
                          className="hover:bg-tv-grayLight/60 transition-colors group cursor-pointer"
                        >
                          <td className="py-3 pr-4 flex items-center gap-3">
                            <div
                              className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: row.badgeBg,
                                color: row.badgeTextColor || '#ffffff',
                              }}
                            >
                              {row.badgeText}
                            </div>
                            <div>
                              <span className="font-bold text-tv-black group-hover:text-tv-blueActive">
                                {row.ticker}
                              </span>
                              <span className="text-xs text-tv-grayText block">
                                {row.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold tabular-numbers">
                            {row.price}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold tabular-numbers ${
                              row.isPositive ? 'text-tv-green' : 'text-tv-red'
                            }`}
                          >
                            {row.changePercent}
                          </td>
                          <td className="py-3 px-4 text-right tabular-numbers text-tv-grayText hidden sm:table-cell">
                            {row.volume}
                          </td>
                          <td className="py-3 pl-4 text-right tabular-numbers font-medium">
                            {row.marketCap}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right 1 Col: Currencies & Crypto Glance */}
              <div className="space-y-6">
                {/* Crypto Overview */}
                <div
                  className="p-5 rounded-2xl border border-tv-grayBorder bg-white"
                  data-purpose="crypto-overview"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-tv-black">Crypto Highlights</h3>
                    <span
                      onClick={() => {
                        setSelectedCategory('Crypto');
                        setActiveLeaderTab('Trending');
                      }}
                      className="text-xs font-medium text-tv-blueActive hover:underline cursor-pointer"
                    >
                      More crypto
                    </span>
                  </div>
                  <div className="space-y-3">
                    {CRYPTO_HIGHLIGHTS.map((cr) => (
                      <div
                        key={cr.ticker}
                        onClick={() => openCryptoDetail(cr)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-tv-grayLight cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full ${
                              cr.badgeTextColor === '#000000'
                                ? 'text-black font-black'
                                : 'text-white font-bold'
                            } text-[10px] flex items-center justify-center`}
                            style={{ backgroundColor: cr.badgeBg }}
                          >
                            {cr.badgeText}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-tv-black">
                              {cr.ticker}
                            </div>
                            <div className="text-[11px] text-tv-grayText">{cr.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm tabular-numbers text-tv-black">
                            {cr.price}
                          </div>
                          <div
                            className={`text-xs font-semibold tabular-numbers ${
                              cr.isPositive ? 'text-tv-green' : 'text-tv-red'
                            }`}
                          >
                            {cr.changePercent}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Forex Majors */}
                <div
                  className="p-5 rounded-2xl border border-tv-grayBorder bg-white"
                  data-purpose="forex-overview"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-tv-black">Forex Majors</h3>
                    <span
                      onClick={() => {
                        setSelectedCategory('Forex');
                        setActiveLeaderTab('Trending');
                      }}
                      className="text-xs font-medium text-tv-blueActive hover:underline cursor-pointer"
                    >
                      Currencies
                    </span>
                  </div>
                  <div className="space-y-3">
                    {FOREX_MAJORS.map((fx) => (
                      <div
                        key={fx.pair}
                        onClick={() => openForexDetail(fx)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-tv-grayLight cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-sm text-tv-black">
                          {fx.pair}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm tabular-numbers text-tv-black">
                            {fx.price}
                          </div>
                          <div
                            className={`text-xs font-semibold tabular-numbers ${
                              fx.isPositive ? 'text-tv-green' : 'text-tv-red'
                            }`}
                          >
                            {fx.changePercent}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>
          {/* END: MainContent */}
        </>
      )}

      {/* BEGIN: MainFooter */}
      <footer
        className="mt-auto border-t border-tv-grayBorder bg-white py-8"
        data-purpose="site-footer"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-tv-grayText">
          <div className="flex items-center gap-6">
            <span>© 2025 TradingView</span>
            <a
              className="hover:underline cursor-pointer"
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                setFooterModal('Terms of Use');
              }}
            >
              Terms of use
            </a>
            <a
              className="hover:underline cursor-pointer"
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                setFooterModal('Privacy Policy');
              }}
            >
              Privacy Policy
            </a>
            <a
              className="hover:underline cursor-pointer"
              href="#cookies"
              onClick={(e) => {
                e.preventDefault();
                setFooterModal('Cookies Policy');
              }}
            >
              Cookies
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span>Select market data provided by ICE Data Services</span>
          </div>
        </div>
      </footer>
      {/* END: MainFooter */}

      {/* Interactive Symbol Detail & Chart Modal */}
      <SymbolDetailModal
        symbolInfo={selectedSymbol}
        onClose={() => setSelectedSymbol(null)}
        isWatchlisted={
          selectedSymbol ? watchlist.includes(selectedSymbol.symbol) : false
        }
        onToggleWatchlist={toggleWatchlist}
        onOpenSuperchart={(info) => {
          setSuperchartSymbol(info);
          setSelectedSymbol(null);
          setActiveNav('Products');
        }}
      />

      {/* Global Command+K Symbol Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectSymbol={(info) => setSelectedSymbol(info)}
      />

      {/* User Account & Watchlist Modal */}
      {watchlistOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setWatchlistOpen(false)}
        >
          <div
            className="bg-white border border-tv-grayBorder rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-tv-grayBorder pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-tv-black">
                  Personal Watchlist
                </h3>
                <p className="text-xs text-tv-grayText">
                  Starred instruments synced with Supercharts
                </p>
              </div>
              <button
                onClick={() => setWatchlistOpen(false)}
                className="p-1.5 rounded-lg text-tv-grayText hover:text-tv-black hover:bg-tv-grayLight cursor-pointer"
              >
                ✕
              </button>
            </div>

            {watchlist.length === 0 ? (
              <div className="py-8 text-center text-xs text-tv-grayText">
                Your watchlist is empty. Click any ticker row or index card to add symbols.
              </div>
            ) : (
              <div className="divide-y divide-tv-grayBorder/60">
                {watchlist.map((sym) => (
                  <div
                    key={sym}
                    className="py-2.5 flex items-center justify-between text-sm"
                  >
                    <button
                      onClick={() => {
                        setWatchlistOpen(false);
                        handleSelectSymbolByTicker(sym);
                      }}
                      className="font-bold text-tv-black hover:text-tv-blueActive cursor-pointer"
                    >
                      {sym}
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setWatchlistOpen(false);
                          handleSelectSymbolByTicker(sym);
                        }}
                        className="text-xs font-semibold text-tv-blueActive hover:underline cursor-pointer"
                      >
                        View Chart
                      </button>
                      <button
                        onClick={() => toggleWatchlist(sym)}
                        className="text-xs text-tv-grayText hover:text-tv-red cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setWatchlistOpen(false);
                  setActiveNav('Products');
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#131722] text-white hover:opacity-90 cursor-pointer"
              >
                Open Supercharts Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Get Started Modal */}
      {getStartedOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setGetStartedOpen(false)}
        >
          <div
            className="bg-white border border-tv-grayBorder rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-tv-black">
                  Start Charting & Paper Trading
                </h3>
                <p className="text-xs text-tv-grayText mt-1">
                  Access real-time global indices, institutional screeners, and multi-timeframe Supercharts.
                </p>
              </div>
              <button
                onClick={() => setGetStartedOpen(false)}
                className="p-1.5 rounded-lg text-tv-grayText hover:text-tv-black hover:bg-tv-grayLight cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-xl border border-tv-grayBorder space-y-2">
                <div className="font-bold text-sm text-tv-black">For Individual Traders</div>
                <div className="text-tv-grayText">
                  Essential real-time US equities, crypto, and FX charts with 5 indicators per chart.
                </div>
                <div className="font-extrabold text-base text-tv-black tabular-numbers pt-1">
                  $0 / forever
                </div>
              </div>
              <div className="p-4 rounded-xl border border-tv-blueActive bg-blue-50/20 space-y-2">
                <div className="font-bold text-sm text-tv-blueActive">
                  For Active Desk Analysts
                </div>
                <div className="text-tv-grayText">
                  Intraday volume profiles, custom formula spreads, and 8-chart multi-monitor layouts.
                </div>
                <div className="font-extrabold text-base text-tv-black tabular-numbers pt-1">
                  $14.95 / month
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setGetStartedOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-tv-black hover:bg-tv-grayLight cursor-pointer"
              >
                Continue Exploring Markets
              </button>
              <button
                onClick={() => {
                  setGetStartedOpen(false);
                  setActiveNav('Products');
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#2962ff] to-[#9c27b0] hover:opacity-95 cursor-pointer"
              >
                Launch Supercharts Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info Modal */}
      {footerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setFooterModal(null)}
        >
          <div
            className="bg-white border border-tv-grayBorder rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-tv-grayBorder pb-3">
              <h3 className="text-base font-bold text-tv-black">{footerModal}</h3>
              <button
                onClick={() => setFooterModal(null)}
                className="p-1 rounded-lg text-tv-grayText hover:text-tv-black cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-tv-grayText leading-relaxed">
              Market quotes, indices, and reference data are provided for informational and analytical purposes. Select real-time and delayed market data feeds are supplied by ICE Data Services and participating global exchanges.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setFooterModal(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#131722] text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
