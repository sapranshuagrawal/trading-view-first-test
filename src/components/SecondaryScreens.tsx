import React, { useState, useMemo } from 'react';
import {
  US_STOCKS_TRENDING,
  US_INDICES,
  CRYPTO_HIGHLIGHTS,
  COMMUNITY_IDEAS,
  BROKER_PARTNERS,
  generateChartSeries,
} from '../data/marketsData';
import { SelectedSymbolInfo } from './SymbolDetailModal';

interface SuperchartsScreenProps {
  initialSymbol: SelectedSymbolInfo;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onBackToMarkets: () => void;
}

export const SuperchartsScreen: React.FC<SuperchartsScreenProps> = ({
  initialSymbol,
  watchlist,
  onToggleWatchlist,
  onBackToMarkets,
}) => {
  const [activeSymbol, setActiveSymbol] = useState<SelectedSymbolInfo>(initialSymbol);
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y'>('1D');
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [orderSide, setOrderSide] = useState<'Buy' | 'Sell'>('Buy');
  const [orderQty, setOrderQty] = useState<string>('10');
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const quickWatchlist: SelectedSymbolInfo[] = useMemo(() => {
    const base: SelectedSymbolInfo[] = [
      ...US_STOCKS_TRENDING.map((s) => ({
        symbol: s.ticker,
        name: s.name,
        badgeText: s.badgeText,
        badgeBg: s.badgeBg,
        badgeTextColor: s.badgeTextColor,
        price: s.price,
        rawPrice: s.rawPrice,
        changePercent: s.changePercent,
        isPositive: s.isPositive,
        volume: s.volume,
        marketCap: s.marketCap,
        exchange: s.exchange,
        peRatio: s.peRatio,
        eps: s.eps,
        technicalRating: s.technicalRating,
      })),
      ...US_INDICES.slice(0, 3).map((idx) => ({
        symbol: idx.symbol,
        name: idx.name,
        badgeText: idx.badgeText,
        badgeBg: idx.badgeBg,
        badgeTextColor: idx.badgeTextColor,
        price: idx.price,
        rawPrice: idx.rawPrice,
        changePercent: idx.changePercent,
        isPositive: idx.isPositive,
        exchange: 'INDEX',
      })),
      ...CRYPTO_HIGHLIGHTS.slice(0, 2).map((c) => ({
        symbol: c.ticker,
        name: c.name,
        badgeText: c.badgeText,
        badgeBg: c.badgeBg,
        badgeTextColor: c.badgeTextColor,
        price: c.price,
        rawPrice: c.rawPrice,
        changePercent: c.changePercent,
        isPositive: c.isPositive,
        volume: c.volume,
        marketCap: c.marketCap,
        exchange: 'CRYPTO',
      })),
    ];
    return base;
  }, []);

  const series = useMemo(
    () =>
      generateChartSeries(
        activeSymbol.symbol,
        activeSymbol.rawPrice,
        activeSymbol.isPositive,
        timeframe
      ),
    [activeSymbol, timeframe]
  );

  const prices = series.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceSpan = maxPrice - minPrice || 1;
  const maxVol = Math.max(...series.map((p) => p.volume), 1);

  const width = 900;
  const height = 420;
  const padY = 32;

  const coords = series.map((pt, idx) => {
    const x = (idx / Math.max(1, series.length - 1)) * width;
    const y = height - padY - ((pt.price - minPrice) / priceSpan) * (height - padY * 2);
    // 7-period moving average
    const slice = series.slice(Math.max(0, idx - 6), idx + 1);
    const emaVal = slice.reduce((acc, cur) => acc + cur.price, 0) / slice.length;
    const emaY = height - padY - ((emaVal - minPrice) / priceSpan) * (height - padY * 2);
    return { x, y, emaY, emaVal, ...pt };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
  const emaPath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.emaY.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${width} ${height} L0 ${height} Z`;

  const strokeColor = activeSymbol.isPositive ? '#089981' : '#f23645';
  const activePt = hoverIdx !== null && coords[hoverIdx] ? coords[hoverIdx] : coords[coords.length - 1];

  const handlePaperOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderNotice(
      `Paper ${orderSide.toUpperCase()} order filled: ${orderQty} ${activeSymbol.symbol} @ ${activeSymbol.price}`
    );
    setTimeout(() => setOrderNotice(null), 3500);
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-tv-grayBorder pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMarkets}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-tv-black bg-tv-grayLight hover:bg-tv-grayHover transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Markets Overview
          </button>
          <div className="h-5 w-px bg-tv-grayBorder" />
          <div className="flex items-center gap-2.5">
            <span
              className="w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center"
              style={{
                backgroundColor: activeSymbol.badgeBg,
                color: activeSymbol.badgeTextColor || '#ffffff',
              }}
            >
              {activeSymbol.badgeText}
            </span>
            <div>
              <span className="font-extrabold text-base text-tv-black mr-2">{activeSymbol.symbol}</span>
              <span className="text-xs text-tv-grayText">{activeSymbol.name}</span>
            </div>
          </div>
        </div>

        {/* Timeframe & Indicator Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-tv-grayLight p-1 rounded-lg">
            {(['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white text-tv-black shadow-xs'
                    : 'text-tv-grayText hover:text-tv-black'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showEMA
                ? 'border-tv-blueActive text-tv-blueActive bg-blue-50/50'
                : 'border-tv-grayBorder text-tv-grayText hover:text-tv-black'
            }`}
          >
            EMA (20)
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showVolume
                ? 'border-tv-blueActive text-tv-blueActive bg-blue-50/50'
                : 'border-tv-grayBorder text-tv-grayText hover:text-tv-black'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => onToggleWatchlist(activeSymbol.symbol)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-tv-grayBorder text-tv-black hover:bg-tv-grayLight transition-colors cursor-pointer"
          >
            {watchlist.includes(activeSymbol.symbol) ? '★ Watchlisted' : '☆ Watchlist'}
          </button>
        </div>
      </div>

      {/* Main Superchart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Interactive Chart Canvas */}
        <div className="lg:col-span-3 border border-tv-grayBorder rounded-2xl p-5 bg-white flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tabular-numbers text-tv-black">
                {hoverIdx !== null && activePt
                  ? activePt.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : activeSymbol.price}
              </span>
              <span
                className={`text-sm font-bold tabular-numbers ${
                  activeSymbol.isPositive ? 'text-tv-green' : 'text-tv-red'
                }`}
              >
                {activeSymbol.changePercent}
              </span>
              {showEMA && activePt && (
                <span className="text-xs text-tv-blueActive font-mono tabular-numbers">
                  EMA20: {activePt.emaVal.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-xs text-tv-grayText tabular-numbers">
              Session Range: {minPrice.toLocaleString()} – {maxPrice.toLocaleString()}
            </div>
          </div>

          <div
            className="relative w-full h-[380px] select-none cursor-crosshair overflow-hidden"
            onMouseLeave={() => setHoverIdx(null)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setHoverIdx(Math.round(relX * (coords.length - 1)));
            }}
          >
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="superChartArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {[0.15, 0.35, 0.55, 0.75, 0.9].map((r, i) => (
                <line
                  key={i}
                  x1={0}
                  y1={height * r}
                  x2={width}
                  y2={height * r}
                  stroke="#f0f3fa"
                  strokeWidth="1"
                />
              ))}

              {/* Volume Histogram Bars */}
              {showVolume &&
                coords.map((c, i) => {
                  const barH = (c.volume / maxVol) * 75;
                  return (
                    <rect
                      key={i}
                      x={c.x - 5}
                      y={height - barH}
                      width="10"
                      height={barH}
                      fill={activeSymbol.isPositive ? '#08998122' : '#f2364522'}
                    />
                  );
                })}

              <path d={areaPath} fill="url(#superChartArea)" />
              <path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {showEMA && (
                <path
                  d={emaPath}
                  fill="none"
                  stroke="#2962ff"
                  strokeWidth="1.8"
                  strokeDasharray="5 3"
                />
              )}

              {hoverIdx !== null && activePt && (
                <>
                  <line
                    x1={activePt.x}
                    y1={0}
                    x2={activePt.x}
                    y2={height}
                    stroke="#787b86"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <circle
                    cx={activePt.x}
                    cy={activePt.y}
                    r="5.5"
                    fill={strokeColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
          </div>

          {/* Paper Trading Ticket Bar */}
          <form
            onSubmit={handlePaperOrder}
            className="pt-4 border-t border-tv-grayBorder flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-tv-black">Paper Trading Ticket:</span>
              <div className="flex items-center bg-tv-grayLight p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOrderSide('Buy')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    orderSide === 'Buy' ? 'bg-tv-green text-white' : 'text-tv-grayText'
                  }`}
                >
                  Buy / Long
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('Sell')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    orderSide === 'Sell' ? 'bg-tv-red text-white' : 'text-tv-grayText'
                  }`}
                >
                  Sell / Short
                </button>
              </div>
              <input
                type="number"
                min="1"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                className="w-20 px-2.5 py-1 text-xs font-semibold tabular-numbers bg-tv-grayLight rounded-lg border border-transparent focus:border-tv-blueActive focus:bg-white focus:outline-none"
              />
              <span className="text-xs text-tv-grayText">shares / units @ Market</span>
            </div>

            <div className="flex items-center gap-3">
              {orderNotice && (
                <span className="text-xs font-semibold text-tv-green">{orderNotice}</span>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#131722] text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                Place Simulated {orderSide} Order
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Column: Watchlist & Symbol Switcher */}
        <div className="border border-tv-grayBorder rounded-2xl p-4 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-tv-grayBorder pb-2.5">
            <h3 className="text-sm font-bold text-tv-black">Watchlist & Leaders</h3>
            <span className="text-xs text-tv-grayText tabular-numbers">{quickWatchlist.length} symbols</span>
          </div>
          <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
            {quickWatchlist.map((item) => {
              const isSelected = item.symbol === activeSymbol.symbol;
              return (
                <button
                  key={item.symbol}
                  onClick={() => setActiveSymbol(item)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-tv-grayLight' : 'hover:bg-tv-grayLight/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: item.badgeBg,
                        color: item.badgeTextColor || '#ffffff',
                      }}
                    >
                      {item.badgeText}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-tv-black">{item.symbol}</div>
                      <div className="text-[11px] text-tv-grayText truncate max-w-[110px]">
                        {item.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right tabular-numbers">
                    <div className="text-xs font-bold text-tv-black">{item.price}</div>
                    <div
                      className={`text-[11px] font-semibold ${
                        item.isPositive ? 'text-tv-green' : 'text-tv-red'
                      }`}
                    >
                      {item.changePercent}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CommunityScreen: React.FC<{
  onSelectSymbol: (symbol: string) => void;
}> = ({ onSelectSymbol }) => {
  const [filterDirection, setFilterDirection] = useState<'All' | 'Long' | 'Short'>('All');
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const filteredIdeas = COMMUNITY_IDEAS.filter(
    (idea) => filterDirection === 'All' || idea.direction === filterDirection
  );

  const toggleLike = (id: string) => {
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-tv-grayBorder pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-tv-black tracking-tight">
            Community Ideas & Technical Setups
          </h1>
          <p className="text-sm text-tv-grayText mt-1.5">
            Actionable chart research, institutional liquidity zones, and macro thesis breakdowns published by market analysts.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-tv-grayLight p-1 rounded-lg text-xs font-semibold">
          {(['All', 'Long', 'Short'] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => setFilterDirection(dir)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filterDirection === dir
                  ? 'bg-white text-tv-black shadow-xs'
                  : 'text-tv-grayText hover:text-tv-black'
              }`}
            >
              {dir === 'All' ? 'All Setups' : `${dir} Bias`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIdeas.map((idea) => {
          const isLiked = likedIds.includes(idea.id);
          return (
            <div
              key={idea.id}
              className="border border-tv-grayBorder rounded-2xl p-6 bg-white hover:border-gray-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-tv-grayText">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectSymbol(idea.symbol)}
                      className="font-bold text-tv-black hover:text-tv-blueActive transition-colors cursor-pointer"
                    >
                      {idea.symbol}
                    </button>
                    <span>·</span>
                    <span>{idea.timeframe} Chart</span>
                    <span>·</span>
                    <span
                      className={`font-semibold ${
                        idea.direction === 'Long' ? 'text-tv-green' : 'text-tv-red'
                      }`}
                    >
                      {idea.direction} Setup
                    </span>
                  </div>
                  <span>{idea.publishedAgo}</span>
                </div>

                <h2
                  onClick={() => onSelectSymbol(idea.symbol)}
                  className="text-lg font-bold text-tv-black hover:text-tv-blueActive transition-colors cursor-pointer"
                >
                  {idea.title}
                </h2>
                <p className="text-sm text-tv-grayText leading-relaxed">{idea.summary}</p>
              </div>

              <div className="pt-4 border-t border-tv-grayBorder flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 tabular-numbers">
                  <span className="text-tv-grayText">
                    Target: <strong className="text-tv-green">{idea.targetPrice}</strong>
                  </span>
                  <span>·</span>
                  <span className="text-tv-grayText">
                    Invalidation: <strong className="text-tv-red">{idea.stopLoss}</strong>
                  </span>
                  <span>·</span>
                  <span className="text-tv-grayText">By {idea.author}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(idea.id)}
                    className={`px-3 py-1 rounded-lg font-semibold border transition-colors tabular-numbers cursor-pointer ${
                      isLiked
                        ? 'border-tv-blueActive text-tv-blueActive bg-blue-50/50'
                        : 'border-tv-grayBorder text-tv-black hover:bg-tv-grayLight'
                    }`}
                  >
                    ▲ {idea.likes + (isLiked ? 1 : 0)}
                  </button>
                  <button
                    onClick={() => onSelectSymbol(idea.symbol)}
                    className="px-3 py-1 rounded-lg font-semibold bg-tv-grayLight text-tv-black hover:bg-tv-grayHover transition-colors cursor-pointer"
                  >
                    Inspect Chart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BrokersScreen: React.FC = () => {
  const [connectedBroker, setConnectedBroker] = useState<string | null>('ibkr');

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-tv-grayBorder pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-tv-black tracking-tight">
          Verified Brokerage Integrations
        </h1>
        <p className="text-sm text-tv-grayText mt-1.5">
          Compare regulated multi-asset brokers and connect live or simulated trading accounts directly to the trading panel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BROKER_PARTNERS.map((broker) => {
          const isConnected = connectedBroker === broker.id;
          return (
            <div
              key={broker.id}
              className="border border-tv-grayBorder rounded-2xl p-6 bg-white flex flex-col justify-between space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span
                    className="w-11 h-11 rounded-full font-extrabold text-sm text-white flex items-center justify-center shrink-0"
                    style={{ backgroundColor: broker.badgeBg }}
                  >
                    {broker.badgeText}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-tv-black">{broker.name}</h2>
                    <div className="text-xs text-tv-grayText mt-0.5">
                      Regulated: {broker.regulation} · {broker.reviewsCount}
                    </div>
                  </div>
                </div>
                <div className="text-right tabular-numbers">
                  <div className="text-sm font-extrabold text-tv-black">{broker.rating}</div>
                  <div className="text-xs text-tv-grayText">Rating</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-tv-grayBorder text-xs">
                <div>
                  <span className="text-tv-grayText block">Tradable Assets</span>
                  <span className="font-semibold text-tv-black mt-0.5 block">{broker.assets}</span>
                </div>
                <div>
                  <span className="text-tv-grayText block">Fee Structure & Minimum</span>
                  <span className="font-semibold text-tv-black mt-0.5 block tabular-numbers">
                    {broker.commission} (Min {broker.minDeposit})
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setConnectedBroker(isConnected ? null : broker.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    isConnected
                      ? 'bg-emerald-50 text-tv-green border border-emerald-200'
                      : 'bg-[#131722] text-white hover:opacity-90'
                  }`}
                >
                  {isConnected ? 'Connected to Trading Panel ✓' : 'Connect Brokerage Account'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
